import { createRemoteJWKSet, jwtVerify } from "jose";
import { isBskyHandle, normalizeBskyHandle } from "../utils/bskyHandle";

/**
 * Server-side half of attendee sign-in. Sign-in itself happens entirely in
 * the browser (see `./auth0Client.ts`, the SPA/PKCE flow) — there is no
 * server session, and nothing here holds a client secret. The only things
 * that still run server-side are the two routes that must be trusted
 * (`/auth/token`, `/auth/bluesky-handle`): they take the attendee's Auth0 ID
 * token as a bearer credential and re-verify its signature against Auth0's
 * public JWKS before trusting the identity it carries. Both routes are
 * Netlify Functions and simply 404 on the static S3 deploys; the features
 * they back (commenting on the Bluesky bridge as a VIS attendee, saving a
 * linked Bluesky handle) degrade to "signed out" there, same as a 401.
 */

export type Auth0Config = {
  clientId: string;
  domain: string;
  issuer: string;
  /** Credentials for the Management API; default to the app's own. */
  managementClientId: string;
  managementClientSecret: string;
};

export type AuthenticatedUser = {
  bskyHandle?: string;
  email?: string;
  name?: string;
  sub: string;
};

/**
 * Namespaced custom claim carrying the attendee's linked Bluesky handle.
 *
 * Auth0 does not put `user_metadata` into ID tokens, and any non-standard
 * claim must use a namespaced URI, so surfacing `user_metadata.bsky_handle`
 * requires an Auth0 Login Action on the tenant:
 *
 *   exports.onExecutePostLogin = async (event, api) => {
 *     const handle = event.user.user_metadata?.bsky_handle;
 *     if (typeof handle === "string" && handle.trim()) {
 *       api.idToken.setCustomClaim(
 *         "https://ieeevis.org/bsky_handle",
 *         handle.trim(),
 *       );
 *     }
 *   };
 *
 * Without that Action this claim is simply absent and the `bluesky` token
 * claim is omitted.
 */
const BSKY_HANDLE_CLAIM = "https://ieeevis.org/bsky_handle";

function readBskyHandle(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getOptionalEnv(name: string) {
  // Astro loads values from .env into import.meta.env for local development.
  // Netlify exposes runtime values through process.env in the server function.
  const value = (import.meta.env[name] ?? process.env[name])?.trim();
  return value && !value.startsWith("replace-with-") ? value : undefined;
}

function getRequiredEnv(name: string) {
  const value = getOptionalEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeDomain(domain: string) {
  const normalized = domain.replace(/^https:\/\//, "").replace(/\/$/, "");
  if (!/^[a-z0-9.-]+$/i.test(normalized)) {
    throw new Error("PUBLIC_AUTH0_DOMAIN must be a hostname, without a path.");
  }
  return normalized;
}

export function getAuth0Config(): Auth0Config {
  // Not a secret: these are the same values the SPA client in `./auth0Client.ts`
  // sends to the browser, reused here so the two never drift apart.
  const domain = normalizeDomain(getRequiredEnv("PUBLIC_AUTH0_DOMAIN"));
  const clientId = getRequiredEnv("PUBLIC_AUTH0_CLIENT_ID");
  return {
    clientId,
    domain,
    issuer: `https://${domain}/`,
    managementClientId:
      getOptionalEnv("AUTH0_MANAGEMENT_CLIENT_ID") ?? clientId,
    managementClientSecret:
      getOptionalEnv("AUTH0_MANAGEMENT_CLIENT_SECRET") ?? "",
  };
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

/**
 * The attendee identified by a bearer `Authorization` header, or undefined
 * if the header is missing, malformed, or fails verification — an
 * unauthenticated request looks exactly like an invalid one, which is the
 * right behavior for both.
 */
export async function verifyBearerIdToken(
  config: Auth0Config,
  authorizationHeader: string | null,
): Promise<AuthenticatedUser | undefined> {
  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length).trim()
    : undefined;
  if (!token) {
    return undefined;
  }

  try {
    jwks ??= createRemoteJWKSet(
      new URL(`${config.issuer}.well-known/jwks.json`),
    );
    const { payload } = await jwtVerify(token, jwks, {
      audience: config.clientId,
      issuer: config.issuer,
    });
    if (typeof payload.sub !== "string") {
      return undefined;
    }
    return {
      // Set by the Auth0 Login Action documented on BSKY_HANDLE_CLAIM; absent
      // for attendees who have not linked a Bluesky account.
      bskyHandle: readBskyHandle(payload[BSKY_HANDLE_CLAIM]),
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      sub: payload.sub,
    };
  } catch {
    return undefined;
  }
}

/** The canonical form of a handle from a request body, or undefined if it is no handle. */
export function readBskyHandleInput(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const handle = normalizeBskyHandle(value);
  return isBskyHandle(handle) ? handle : undefined;
}

let managementToken: { value: string; expiresAt: number } | undefined;

/**
 * A Management API token by client credentials. The app needs a grant for
 * the Management API with the `update:users` scope (Auth0 dashboard →
 * Applications → APIs → Auth0 Management API → Machine to Machine
 * Applications), or a separate machine-to-machine app with that grant, given
 * as AUTH0_MANAGEMENT_CLIENT_ID / AUTH0_MANAGEMENT_CLIENT_SECRET.
 */
async function getManagementToken(config: Auth0Config) {
  if (managementToken && managementToken.expiresAt > Date.now() + 60_000) {
    return managementToken.value;
  }

  if (!config.managementClientSecret) {
    throw new Error(
      "Missing required environment variable: AUTH0_MANAGEMENT_CLIENT_SECRET",
    );
  }

  const response = await fetch(`${config.issuer}oauth/token`, {
    body: new URLSearchParams({
      audience: `${config.issuer}api/v2/`,
      client_id: config.managementClientId,
      client_secret: config.managementClientSecret,
      grant_type: "client_credentials",
    }),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(
      `Auth0 Management API token request failed with status ${response.status}.`,
    );
  }

  const result = (await response.json()) as {
    access_token?: unknown;
    expires_in?: unknown;
  };
  if (typeof result.access_token !== "string") {
    throw new Error("Auth0 did not return a Management API token.");
  }
  const expiresIn =
    typeof result.expires_in === "number" ? result.expires_in : 3600;
  managementToken = {
    value: result.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return managementToken.value;
}

/**
 * Store the attendee's Bluesky handle as `user_metadata.bsky_handle`, which
 * is what the Login Action documented on BSKY_HANDLE_CLAIM surfaces on their
 * next sign-in (and so the next ID token `verifyBearerIdToken` checks).
 */
export async function saveBskyHandle(
  config: Auth0Config,
  sub: string,
  handle: string,
) {
  const token = await getManagementToken(config);
  const response = await fetch(
    `${config.issuer}api/v2/users/${encodeURIComponent(sub)}`,
    {
      body: JSON.stringify({ user_metadata: { bsky_handle: handle } }),
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      method: "PATCH",
    },
  );
  if (!response.ok) {
    throw new Error(`Auth0 user update failed with status ${response.status}.`);
  }
}
