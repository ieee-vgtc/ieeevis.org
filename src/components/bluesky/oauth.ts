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
import { normalizeBskyHandle } from "../../utils/bskyHandle";
import { safeReturnTo, siteBase } from "../../utils/withBaseURL";

/**
 * Exactly what `native.ts` does and nothing more: write and delete posts
 * and likes in the reader's repository, and read profiles and posts through
 * the Bluesky AppView. A token stolen from the browser can do only that —
 * not follow, block, edit the profile, or read messages. The account's
 * consent screen lists these instead of "full access".
 */
const APPVIEW = "did:web:api.bsky.app%23bsky_appview";
export const OAUTH_SCOPE = [
  "atproto",
  "repo:app.bsky.feed.post?action=create&action=delete",
  "repo:app.bsky.feed.like?action=create&action=delete",
  `rpc:app.bsky.actor.getProfile?aud=${APPVIEW}`,
  `rpc:app.bsky.feed.getPosts?aud=${APPVIEW}`,
].join(" ");
export const CALLBACK_PATH = "/oauth/bluesky/";
const METADATA_PATH = "/oauth/client-metadata.json";
/**
 * Where Bluesky-hosted accounts log in. Given as the sign-in input it takes
 * the reader straight to that login page, no handle needed; it also resolves
 * handles (through DNS, which the browser cannot do itself) for accounts
 * hosted elsewhere.
 */
export const BLUESKY_ENTRYWAY = "https://bsky.social";
/** Where `@atproto/oauth-client-browser` remembers the signed-in account. */
const STORED_SUB_KEY = "@@atproto/oauth-client-browser(sub)";

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
  };
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
        handleResolver: BLUESKY_ENTRYWAY,
      });
    }
    return new BrowserOAuthClient({
      clientMetadata: buildClientMetadata(window.location.origin, base),
      handleResolver: BLUESKY_ENTRYWAY,
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
  return {
    session: result.session,
    returnTo: safeReturnTo(result.state, siteBase() || "/"),
  };
}

/**
 * Send the reader to log in — at the server given as a URL, or at the one
 * their handle resolves to. Never resolves: the page navigates away, and the
 * returned promise only rejects if it does not (the reader used the back
 * button, or the handle could not be resolved).
 */
export async function startLogin(
  input: string,
  returnTo: string,
): Promise<never> {
  const client = await getClient();
  const target = /^https?:\/\//.test(input)
    ? input
    : normalizeBskyHandle(input);
  return client.signInRedirect(target, {
    state: returnTo,
    scope: OAUTH_SCOPE,
  });
}
