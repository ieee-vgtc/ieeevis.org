/**
 * Reads a thread straight from the public Bluesky AppView, no proxy involved.
 * This is the source once a page knows the real `at://` URI of its post, and it
 * is read-only: liking or replying needs a Bluesky account of one's own.
 *
 * Media stays on cdn.bsky.app — a reader who can reach the AppView can reach
 * the CDN.
 */

import { MODERATION_LABELER_DID } from "./moderation";
import { normalizeAppViewThread } from "./normalize";
import type { ThreadResponse } from "./types";

const APPVIEW_BASE = "https://public.api.bsky.app";
/** Deeper than any thread we render, so nesting is limited by display alone. */
const FETCH_DEPTH = 10;

export async function fetchAppViewThread(
  atUri: string,
  options: {
    signal?: AbortSignal;
    base?: string;
    /** Dropped on top of what the thread's own threadgate hides. */
    hiddenUris?: ReadonlySet<string>;
  } = {},
): Promise<ThreadResponse> {
  const base = options.base || APPVIEW_BASE;
  const response = await fetch(
    `${base}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=${FETCH_DEPTH}`,
    {
      signal: options.signal,
      headers: {
        accept: "application/json",
        // Without this the AppView applies self-labels only; it allows the
        // header from the browser via CORS.
        "atproto-accept-labelers": MODERATION_LABELER_DID,
      },
      // A poll or reload must never be served a stale browser-cached copy; the
      // server cache still absorbs the load.
      cache: "no-store",
    },
  );

  // A deleted, blocked or misaddressed post answers 400/404; that is a state of
  // the thread, not a failure worth retrying with backoff.
  if (response.status === 400 || response.status === 404) {
    return { state: "unavailable" };
  }
  if (!response.ok) {
    throw new Error(`Bluesky returned ${response.status}.`);
  }

  return normalizeAppViewThread(await response.json(), options.hiddenUris);
}
