/**
 * Bluesky login for the discussion, done entirely in the browser.
 *
 * The site is a public OAuth client: there is no server-side session, the
 * tokens live in the reader's own browser (IndexedDB, managed by
 * `@atproto/oauth-client-browser`), and every write goes from the browser to
 * the reader's own PDS. The discussion service is not involved — a reply
 * posted this way is an ordinary Bluesky reply and shows up in the thread on
 * the next poll like any other.
 *
 * Bluesky needs to fetch the client's metadata from the `client_id` URL, so
 * the metadata is served by `src/pages/oauth/client-metadata.json.ts` and the
 * same object is built here for the browser, both from the deployment's own
 * origin. Deriving it from the origin (like `getAuth0Config`) is what lets
 * production, a local checkout and a deploy preview each act as their own
 * client without per-environment configuration.
 *
 * The OAuth login page lives on the reader's PDS (bsky.social for most). Where
 * that host is unreachable the login simply fails, and the guest composer
 * bridged through the discussion service stays the way to take part.
 *
 * The library is loaded on demand: it and `@atproto/api` are large, and most
 * readers never log in. `hasStoredSession` reads the library's own marker
 * without importing it, so a page only pays for the import when a session
 * exists or the reader starts one.
 */

import type {
  BrowserOAuthClient,
  OAuthClientMetadataInput,
  OAuthSession,
} from "@atproto/oauth-client-browser";

/** `transition:generic` is what lets a public client post and like. */
export const OAUTH_SCOPE = "atproto transition:generic";
export const CALLBACK_PATH = "/oauth/bluesky/";
const METADATA_PATH = "/oauth/client-metadata.json";
/** Handles resolve through DNS, which the browser cannot do itself. */
const HANDLE_RESOLVER = "https://bsky.social";
/** Where `@atproto/oauth-client-browser` remembers the signed-in account. */
const STORED_SUB_KEY = "@@atproto/oauth-client-browser(sub)";

export function siteBase(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

/**
 * The metadata Bluesky reads from `client_id`, and that the browser client is
 * constructed with. The two must be the same object, so both build it here.
 */
export function buildClientMetadata(
  origin: string,
  base: string,
): OAuthClientMetadataInput {
  return {
    client_id: `${origin}${base}${METADATA_PATH}`,
    client_name: "IEEE VIS 2026",
    client_uri: `${origin}${base}/`,
    redirect_uris: [`${origin}${base}${CALLBACK_PATH}`],
    scope: OAUTH_SCOPE,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "web",
    dpop_bound_access_tokens: true,
  } as OAuthClientMetadataInput;
}

/**
 * A local checkout cannot serve `https://` metadata, so it uses the loopback
 * client that ATProto defines for development: the client id encodes the
 * redirect URI and scope, and Bluesky reads nothing from the site. The library
 * requires the page to be on `127.0.0.1`, not `localhost`, and moves it there.
 */
function isLoopback(hostname: string): boolean {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
}

function loopbackClientId(location: Location, base: string): string {
  const redirect = `http://127.0.0.1:${location.port}${base}${CALLBACK_PATH}`;
  return `http://localhost?redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(OAUTH_SCOPE)}`;
}

let clientPromise: Promise<BrowserOAuthClient> | null = null;

function getClient(): Promise<BrowserOAuthClient> {
  clientPromise ??= (async () => {
    const { BrowserOAuthClient } =
      await import("@atproto/oauth-client-browser");
    const base = siteBase();
    if (isLoopback(window.location.hostname)) {
      return BrowserOAuthClient.load({
        clientId: loopbackClientId(window.location, base),
        handleResolver: HANDLE_RESOLVER,
      });
    }
    return new BrowserOAuthClient({
      clientMetadata: buildClientMetadata(window.location.origin, base),
      handleResolver: HANDLE_RESOLVER,
    });
  })();
  return clientPromise;
}

/** Whether this browser holds a Bluesky session — without loading the library. */
export function hasStoredSession(): boolean {
  try {
    return Boolean(window.localStorage.getItem(STORED_SUB_KEY));
  } catch {
    return false;
  }
}

let initPromise: Promise<OAuthSession | null> | null = null;

/**
 * The stored session, refreshed if needed, or null when there is none. Shared
 * across every discussion on the page, since the library must process a login
 * callback at most once.
 */
export function restoreSession(): Promise<OAuthSession | null> {
  initPromise ??= getClient().then(async (client) => {
    const result = await client.initRestore();
    return result?.session ?? null;
  });
  return initPromise;
}

/**
 * Finish a login on the callback page. Returns the session and the path the
 * reader started from, which rode along as the OAuth `state`.
 */
export async function completeLogin(): Promise<{
  session: OAuthSession;
  returnTo: string;
}> {
  const client = await getClient();
  const result = await client.initCallback();
  return { session: result.session, returnTo: safeReturnTo(result.state) };
}

/**
 * Send the reader to their PDS to log in. Never resolves: the page navigates
 * away, and the returned promise only rejects if it does not (the reader used
 * the back button, or the handle could not be resolved).
 */
export async function startLogin(
  handle: string,
  returnTo: string,
): Promise<never> {
  const client = await getClient();
  return client.signInRedirect(normalizeHandle(handle), {
    state: returnTo,
    scope: OAUTH_SCOPE,
  });
}

/** A handle as typed — with or without the "@", any case — in canonical form. */
export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

/** Only paths within this site may be login destinations. */
export function safeReturnTo(value: string | null | undefined): string {
  const base = siteBase() || "/";
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return base;
  }
  return value;
}
