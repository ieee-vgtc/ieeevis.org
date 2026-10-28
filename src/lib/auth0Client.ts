/**
 * Attendee sign-in, done entirely in the browser (the "SPA" Auth0
 * application type, PKCE, no client secret) — the same shape as the Bluesky
 * login in `components/bluesky/oauth.ts`.
 *
 * The site has no backend on the S3 deploys, so there is nowhere to keep a
 * server-side session or a confidential client secret. `@auth0/auth0-spa-js`
 * exchanges the authorization code for tokens straight from the browser and
 * caches them in `localStorage`, which is what lets a signed-in attendee stay
 * signed in across full page loads here — this is a multi-page site, not a
 * client-routed one, so an in-memory cache (the library's default) would lose
 * the session on every navigation. `useRefreshTokens` trades that for a
 * refresh token so sessions also survive the ID token's own expiry without
 * depending on a third-party-cookie silent-auth iframe, which Safari and
 * Firefox block by default; it requires "Refresh Token Rotation" enabled on
 * the Auth0 application, with `offline_access` in its allowed scopes.
 *
 * Trade-off (this is what "switch to SPA mode" means): the signed-in state
 * lives in the reader's own browser storage and nothing here can prove a
 * token wasn't tampered with before a page reads it back out of
 * `localStorage`. That's fine for what this gates — a sign-in prompt in
 * place of a PDF link, an attendee's display name — never anything a forged
 * session could turn into real access. Anything that actually needs to trust
 * the identity (guest comments, saving a Bluesky handle, the profile and the
 * attendee's papers) goes to bsky-api (`./bskyApi.ts`), which re-verifies the
 * ID token's signature against Auth0's public keys server-side. The site
 * itself holds no secret and runs no server code for any of it.
 *
 * NEW ENVIRONMENT VARIABLES (must use the PUBLIC_ prefix — Astro only
 * includes PUBLIC_-prefixed values in the browser bundle):
 *   PUBLIC_AUTH0_DOMAIN, PUBLIC_AUTH0_CLIENT_ID — from an Auth0 application
 *   of type "Single Page Application" (not the old "Regular Web
 *   Application"; that type expects a client secret this flow never sends).
 *   PUBLIC_AUTH0_CONNECTION — optional; set to skip Auth0's connection
 *   picker and go straight to one connection (`vis26-attendees` in 2026).
 * None of these are secret — they identify the client, the way a public key
 * does, and are visible in any browser's network tab regardless.
 *
 * Auth0 dashboard setup for that application — see the README's "Sign-in and
 * the Bluesky discussions" section for the full list (Allowed Callback/Logout
 * URLs and Web Origins for every origin this site is served from, including
 * a `https://*.netlify.app` wildcard for PR deploy previews; Refresh Token
 * grant type enabled for `useRefreshTokens` below to work).
 */

import { Auth0Client, type User } from "@auth0/auth0-spa-js";
import { safeReturnTo, siteBase } from "../utils/withBaseURL";

// Trailing slash is required: the S3 deploys serve this as a static
// auth/callback/index.html file, and a request for the extensionless path
// without the slash gets redirected by CloudFront to add it, a hop that
// drops the code/state query string Auth0 appended ("There are no query
// params available for parsing"). Requesting the canonical URL directly
// skips that redirect.
const CALLBACK_PATH = "/auth/callback/";

export type AttendeeUser = {
  email?: string;
  name?: string;
  sub: string;
};

type AppState = { returnTo?: string };

function toAttendeeUser(user: User | undefined): AttendeeUser | null {
  if (!user?.sub) {
    return null;
  }
  return { email: user.email, name: user.name, sub: user.sub };
}

let clientPromise: Promise<Auth0Client> | null = null;

function getClient(): Promise<Auth0Client> {
  clientPromise ??= (async () => {
    const domain = import.meta.env.PUBLIC_AUTH0_DOMAIN;
    const clientId = import.meta.env.PUBLIC_AUTH0_CLIENT_ID;
    if (!domain || !clientId) {
      throw new Error(
        "Auth0 is not configured for this deployment (missing PUBLIC_AUTH0_DOMAIN / PUBLIC_AUTH0_CLIENT_ID).",
      );
    }

    const connection = import.meta.env.PUBLIC_AUTH0_CONNECTION;
    return new Auth0Client({
      domain,
      clientId,
      cacheLocation: "localstorage",
      useRefreshTokens: true,
      authorizationParams: {
        redirect_uri: `${window.location.origin}${siteBase()}${CALLBACK_PATH}`,
        scope: "openid profile email",
        ...(connection ? { connection } : {}),
      },
    });
  })();
  return clientPromise;
}

/**
 * Each field is a string, `null` when the account has no value for it, or
 * `undefined` when it could not be read (the claim is missing from the token,
 * e.g. the Login Action did not add it).
 */
export type AttendeeProfile = {
  bskyHandle?: string | null;
  company?: string | null;
  email?: string | null;
  name?: string | null;
};

/**
 * Namespace of the custom claims the Auth0 Post Login Action adds to the ID
 * token from `user_metadata` (Auth0 requires a URI namespace). See the README
 * for the Action's code.
 */
const CLAIM_NAMESPACE = "https://ieeevis.org/";

/**
 * The signed-in attendee's profile, read from the ID token alone: `name` and
 * `email` are standard claims, and `company` and `bsky_handle` come from the
 * Login Action, which always sets them (an empty string for no value), so a
 * missing one means it could not be read. Needs no request to any server.
 * Null if no one is signed in; throws if the token cannot be read.
 */
export async function getAttendeeProfile(): Promise<AttendeeProfile | null> {
  const client = await getClient();
  if (!(await client.isAuthenticated())) {
    return null;
  }
  const claims = await client.getIdTokenClaims();
  if (!claims?.sub) {
    throw new Error("The ID token has no subject.");
  }
  // `name` and `email` are standard claims: absent means no value. The custom
  // claims are always set by the Login Action: absent means not read.
  const standard = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const custom = (value: unknown) =>
    value === undefined ? undefined : standard(value);
  return {
    bskyHandle: custom(claims[`${CLAIM_NAMESPACE}bsky_handle`]),
    company: custom(claims[`${CLAIM_NAMESPACE}company`]),
    email: standard(claims.email),
    name: standard(claims.name),
  };
}

/** The signed-in attendee, or null if no one is signed in. Never throws. */
export async function getCurrentUser(): Promise<AttendeeUser | null> {
  try {
    const client = await getClient();
    if (!(await client.isAuthenticated())) {
      return null;
    }
    return toAttendeeUser(await client.getUser());
  } catch (error) {
    console.error("Unable to read the Auth0 session:", error);
    return null;
  }
}

/**
 * Seconds before its `exp` at which an ID token counts as expired here. The
 * SDK caches by the access token's lifetime, so it can hand back an ID token
 * past its own expiry; bsky-api would reject that with a 401.
 */
const ID_TOKEN_EXPIRY_SKEW_SECONDS = 120;

/**
 * The attendee's raw ID token, to send as a bearer credential to bsky-api,
 * which re-verifies it server-side. Refreshed first if it is expired or about
 * to be. Null if no one is signed in or the refresh fails; never throws.
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const client = await getClient();
    if (!(await client.isAuthenticated())) {
      return null;
    }
    let claims = await client.getIdTokenClaims();
    const expiresSoon =
      typeof claims?.exp === "number" &&
      claims.exp - ID_TOKEN_EXPIRY_SKEW_SECONDS < Date.now() / 1000;
    if (expiresSoon) {
      await client.getTokenSilently({ cacheMode: "off" });
      claims = await client.getIdTokenClaims();
    }
    return claims?.__raw ?? null;
  } catch (error) {
    console.error("Unable to read the Auth0 ID token:", error);
    return null;
  }
}

/**
 * Force a fresh ID token from Auth0, bypassing the cached one. Used right
 * after bsky-api saves a new Bluesky handle, so the next ID token carries the
 * new `bsky_handle` claim immediately, and to retry once after a 401.
 */
export async function refreshSession(): Promise<void> {
  const client = await getClient();
  if (!(await client.isAuthenticated())) {
    return;
  }
  await client.getTokenSilently({ cacheMode: "off" });
}

/** The current page's path (and query string) relative to the site's base. */
export function currentPagePath(): string {
  const base = siteBase();
  const path = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length) || "/"
    : window.location.pathname;
  return `${path}${window.location.search}`;
}

/** Send the reader to Auth0 to sign in. Never resolves: the page navigates away. */
export async function login(returnTo: string): Promise<never> {
  const client = await getClient();
  await client.loginWithRedirect({
    appState: { returnTo: safeReturnTo(returnTo) } satisfies AppState,
  });
  return new Promise<never>(() => {});
}

/** Sign out and return to the site's home page. Never resolves. */
export async function logout(): Promise<never> {
  const client = await getClient();
  await client.logout({
    logoutParams: { returnTo: `${window.location.origin}${siteBase()}/` },
  });
  return new Promise<never>(() => {});
}

/**
 * Finish a login on `/auth/callback`. Returns the path the reader started
 * from, which rode along as the `appState`.
 */
export async function completeLogin(): Promise<{ returnTo: string }> {
  const client = await getClient();
  const result = await client.handleRedirectCallback<AppState>();
  return {
    returnTo: safeReturnTo(result.appState?.returnTo, siteBase() || "/"),
  };
}
