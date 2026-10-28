/**
 * Client for the attendee routes on bsky-api (conferentech repo,
 * `supabase/functions/bsky-api`), the backend behind the Bluesky discussions.
 *
 * The site is static on its production S3 deploys and keeps no secret, so
 * everything that has to trust the attendee's identity happens there: the
 * browser sends the raw Auth0 ID token as a bearer credential, and bsky-api
 * verifies it against Auth0's public keys (RS256, this site's client ID as
 * the audience) before answering.
 *
 * PUBLIC_BSKY_API_BASE overrides the base, e.g.
 * `http://127.0.0.1:8000/functions/v1/bsky-api` for a local Supabase.
 */

import { getIdToken, refreshSession } from "./auth0Client";

export const BSKY_API_BASE = (
  import.meta.env.PUBLIC_BSKY_API_BASE || "https://bsky.tech.ieeevis.org"
).replace(/\/$/, "");

/** A non-2xx answer from bsky-api; `code` is its `{"error": "..."}` text. */
export class BskyApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`bsky-api returned ${status}${code ? ` (${code})` : ""}.`);
  }
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const idToken = await getIdToken();
  if (!idToken) {
    throw new BskyApiError(401, "not signed in");
  }
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${idToken}`);
  return fetch(`${BSKY_API_BASE}${path}`, { ...init, headers });
}

/**
 * Call an attendee route with the reader's ID token. A 401 (the token
 * expired between our check and the server's) gets one retry with a freshly
 * refreshed token. Throws BskyApiError for any non-2xx answer.
 */
export async function bskyApiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response = await send(path, init);
  if (response.status === 401) {
    try {
      await refreshSession();
    } catch {
      // The retry below then fails the same way and reports the 401.
    }
    response = await send(path, init);
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: unknown;
    } | null;
    throw new BskyApiError(
      response.status,
      typeof body?.error === "string" ? body.error : "",
    );
  }
  return (await response.json()) as T;
}

/**
 * Put a Bluesky handle on the attendee's Auth0 profile
 * (`user_metadata.bsky_handle`). bsky-api checks that it exists on Bluesky
 * and returns it in canonical form. Afterwards the ID token is refreshed so
 * its `bsky_handle` claim carries the new handle at once; the handle is
 * already saved by then, so a failed refresh only means the claim catches up
 * on the next refresh, not that the save failed.
 */
export async function saveBskyHandle(handle: string): Promise<string> {
  const result = await bskyApiFetch<{ handle: string }>("/api/me/bsky-handle", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle }),
  });
  try {
    await refreshSession();
  } catch (error) {
    console.warn("Saved the handle, but the session did not refresh:", error);
  }
  return result.handle;
}

/**
 * Whether a failed save means saving cannot work here at all for now (the
 * service is unreachable or lacks its Auth0 credentials, or the account is
 * not an attendee), as opposed to a handle the reader can correct.
 */
export function isSaveUnavailable(error: unknown): boolean {
  if (!(error instanceof BskyApiError)) {
    return true;
  }
  return error.status !== 400 && error.status !== 422;
}

/** What to tell the reader when saving a handle fails. */
export function saveHandleErrorMessage(error: unknown): string {
  const status = error instanceof BskyApiError ? error.status : 0;
  switch (status) {
    case 400:
      return "That does not look like a Bluesky handle, e.g. you.bsky.social.";
    case 422:
      return "That handle was not found on Bluesky. Check the spelling.";
    case 404:
      return "Your account is not on the attendee list, so a handle cannot be saved.";
    default:
      return "Saving a handle is not available right now. Please try again later.";
  }
}
