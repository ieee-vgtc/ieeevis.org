import { createHash, randomBytes } from "node:crypto";
import type { APIContext } from "astro";
import { createRemoteJWKSet, EncryptJWT, jwtDecrypt, jwtVerify } from "jose";

type Cookies = APIContext["cookies"];

type Auth0Config = {
  appBaseUrl: string;
  clientId: string;
  clientSecret: string;
  connection: string;
  domain: string;
  issuer: string;
  sessionSecret: string;
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
 * claim is omitted — the guest composer stays visible, which is the safe
 * default.
 */
const BSKY_HANDLE_CLAIM = "https://ieeevis.org/bsky_handle";

function readBskyHandle(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export type AuthTransaction = {
  nonce: string;
  returnTo: string;
  state: string;
};

export const AUTH_SESSION_COOKIE = "vis2026_session";
export const AUTH_TRANSACTION_COOKIE = "vis2026_auth_transaction";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const TRANSACTION_MAX_AGE_SECONDS = 60 * 10;

function getRequiredEnv(name: string) {
  // Astro loads values from .env into import.meta.env for local development.
  // Netlify exposes runtime values through process.env in the server function.
  const value = (import.meta.env[name] ?? process.env[name])?.trim();
  if (!value || value.startsWith("replace-with-")) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeDomain(domain: string) {
  const normalized = domain.replace(/^https:\/\//, "").replace(/\/$/, "");
  if (!/^[a-z0-9.-]+$/i.test(normalized)) {
    throw new Error("AUTH0_DOMAIN must be a hostname, without a path.");
  }
  return normalized;
}

export function getAuth0Config(): Auth0Config {
  const appBaseUrl = getRequiredEnv("APP_BASE_URL").replace(/\/$/, "");
  const parsedBaseUrl = new URL(appBaseUrl);
  if (
    parsedBaseUrl.protocol !== "http:" &&
    parsedBaseUrl.protocol !== "https:"
  ) {
    throw new Error("APP_BASE_URL must use http or https.");
  }

  const sessionSecret = getRequiredEnv("AUTH0_SESSION_SECRET");
  if (sessionSecret.length < 32) {
    throw new Error(
      "AUTH0_SESSION_SECRET must be at least 32 characters long.",
    );
  }

  const domain = normalizeDomain(getRequiredEnv("AUTH0_DOMAIN"));
  return {
    appBaseUrl,
    clientId: getRequiredEnv("AUTH0_CLIENT_ID"),
    clientSecret: getRequiredEnv("AUTH0_CLIENT_SECRET"),
    connection: getRequiredEnv("AUTH0_CONNECTION"),
    domain,
    issuer: `https://${domain}/`,
    sessionSecret,
  };
}

function getCookiePath() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return basePath || "/";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: getCookiePath(),
    sameSite: "lax" as const,
    secure: !import.meta.env.DEV,
  };
}

function encryptionKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

function randomValue() {
  return randomBytes(32).toString("base64url");
}

export function getAppUrl(config: Auth0Config, relativePath: string) {
  const baseUrl = `${config.appBaseUrl}/`;
  return new URL(relativePath.replace(/^\//, ""), baseUrl).toString();
}

/**
 * Build a same-site link to the login route that returns the user to
 * `url` once they've signed in. Used by any page that gates a piece of
 * content (a PDF link, a video embed) behind authentication.
 */
export function buildLoginUrl(url: URL) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pathWithoutBase = url.pathname.startsWith(base)
    ? url.pathname.slice(base.length) || "/"
    : url.pathname;

  const loginUrl = new URL(`${base}/auth/login`, url.origin);
  loginUrl.searchParams.set("returnTo", `${pathWithoutBase}${url.search}`);
  return `${loginUrl.pathname}${loginUrl.search}`;
}

/** Only permit paths within this deployment as post-login destinations. */
export function safeReturnTo(value: string | null | undefined) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }
  return value;
}

export async function createTransaction(
  config: Auth0Config,
  returnTo: string,
): Promise<AuthTransaction & { token: string }> {
  const transaction: AuthTransaction = {
    nonce: randomValue(),
    returnTo: safeReturnTo(returnTo),
    state: randomValue(),
  };

  const token = await new EncryptJWT(transaction)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${TRANSACTION_MAX_AGE_SECONDS}s`)
    .encrypt(encryptionKey(config.sessionSecret));

  return { ...transaction, token };
}

export async function readTransaction(
  config: Auth0Config,
  token: string | undefined,
): Promise<AuthTransaction | undefined> {
  if (!token) {
    return undefined;
  }

  try {
    const { payload } = await jwtDecrypt(
      token,
      encryptionKey(config.sessionSecret),
    );
    if (
      typeof payload.state !== "string" ||
      typeof payload.nonce !== "string" ||
      typeof payload.returnTo !== "string"
    ) {
      return undefined;
    }
    return {
      nonce: payload.nonce,
      returnTo: safeReturnTo(payload.returnTo),
      state: payload.state,
    };
  } catch {
    return undefined;
  }
}

export async function createSession(
  config: Auth0Config,
  user: AuthenticatedUser,
) {
  return new EncryptJWT(user)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .encrypt(encryptionKey(config.sessionSecret));
}

export async function readSession(
  cookies: Cookies,
): Promise<AuthenticatedUser | undefined> {
  const token = cookies.get(AUTH_SESSION_COOKIE)?.value;
  if (!token) {
    return undefined;
  }

  try {
    const config = getAuth0Config();
    const { payload } = await jwtDecrypt(
      token,
      encryptionKey(config.sessionSecret),
    );
    if (typeof payload.sub !== "string") {
      return undefined;
    }
    return {
      bskyHandle: readBskyHandle(payload.bskyHandle),
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      sub: payload.sub,
    };
  } catch {
    return undefined;
  }
}

export function setTransactionCookie(cookies: Cookies, token: string) {
  cookies.set(
    AUTH_TRANSACTION_COOKIE,
    token,
    cookieOptions(TRANSACTION_MAX_AGE_SECONDS),
  );
}

export function setSessionCookie(cookies: Cookies, token: string) {
  cookies.set(
    AUTH_SESSION_COOKIE,
    token,
    cookieOptions(SESSION_MAX_AGE_SECONDS),
  );
}

export function clearTransactionCookie(cookies: Cookies) {
  cookies.delete(AUTH_TRANSACTION_COOKIE, cookieOptions(0));
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(AUTH_SESSION_COOKIE, cookieOptions(0));
}

export async function verifyAuth0IdToken(
  config: Auth0Config,
  idToken: string,
  expectedNonce: string,
): Promise<AuthenticatedUser> {
  const jwks = createRemoteJWKSet(
    new URL(`${config.issuer}.well-known/jwks.json`),
  );
  const { payload } = await jwtVerify(idToken, jwks, {
    audience: config.clientId,
    issuer: config.issuer,
  });

  if (payload.nonce !== expectedNonce || typeof payload.sub !== "string") {
    throw new Error("The Auth0 ID token did not match this login transaction.");
  }

  return {
    // Set by the Auth0 Login Action documented on BSKY_HANDLE_CLAIM; absent
    // for attendees who have not linked a Bluesky account.
    bskyHandle: readBskyHandle(payload[BSKY_HANDLE_CLAIM]),
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
    sub: payload.sub,
  };
}

export async function exchangeAuthorizationCode(
  config: Auth0Config,
  code: string,
) {
  const response = await fetch(`${config.issuer}oauth/token`, {
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getAppUrl(config, "/auth/callback"),
    }),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Auth0 token exchange failed with status ${response.status}.`,
    );
  }

  const result = (await response.json()) as { id_token?: unknown };
  if (typeof result.id_token !== "string") {
    throw new Error("Auth0 did not return an ID token.");
  }
  return result.id_token;
}

export function getAuthorizeUrl(
  config: Auth0Config,
  transaction: AuthTransaction,
) {
  const authorizeUrl = new URL(`${config.issuer}authorize`);
  authorizeUrl.search = new URLSearchParams({
    client_id: config.clientId,
    connection: config.connection,
    nonce: transaction.nonce,
    redirect_uri: getAppUrl(config, "/auth/callback"),
    response_type: "code",
    scope: "openid profile email",
    state: transaction.state,
  }).toString();
  return authorizeUrl.toString();
}

export function getLogoutUrl(config: Auth0Config) {
  const logoutUrl = new URL(`${config.issuer}v2/logout`);
  logoutUrl.search = new URLSearchParams({
    client_id: config.clientId,
    returnTo: getAppUrl(config, "/"),
  }).toString();
  return logoutUrl.toString();
}
