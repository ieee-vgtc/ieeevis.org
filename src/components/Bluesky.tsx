/**
 * Read-only comments for any page, taken from the replies to one Bluesky post.
 * Address it with the post's `at://` URI, or with the author's DID and the
 * post's record key. The post itself is not shown, only the conversation under
 * it, and replying happens on Bluesky.
 *
 * Pages that need the conference discussion service — threads addressed by
 * paper id, comments from attendees without a Bluesky account — use
 * `BlueskyDiscussion`. Both render the same cards.
 */

import { useCallback } from "react";
import ReplyThread from "./bluesky/ReplyThread";
import { fetchAppViewThread } from "./bluesky/direct";
import type { ThreadResponse } from "./bluesky/types";
import { usePolledThread } from "./bluesky/usePolledThread";

const DEFAULT_MAX_DEPTH = 5;
const DEFAULT_REFRESH_MS = 60_000;
const MAX_BACKOFF_MS = 30_000;

interface BlueskyCommentsProps {
  did?: string;
  /** The post's record key (the last segment of its `at://` URI). */
  postCid?: string;
  atUri?: string;
  maxDepth?: number;
  /** An alternative AppView origin; the public one is the default. */
  apiBase?: string;
  refreshMs?: number;
  pauseWhenHidden?: boolean;
}

export default function BlueskyComments({
  did,
  postCid,
  atUri,
  maxDepth = DEFAULT_MAX_DEPTH,
  apiBase,
  refreshMs = DEFAULT_REFRESH_MS,
  pauseWhenHidden = true,
}: BlueskyCommentsProps) {
  const uri =
    atUri ||
    (did && postCid ? `at://${did}/app.bsky.feed.post/${postCid}` : "");

  const load = useCallback(
    async (signal: AbortSignal): Promise<ThreadResponse> => {
      if (!uri) {
        throw new Error(
          "Missing Bluesky post identifier. Provide atUri or did + postCid.",
        );
      }
      return fetchAppViewThread(uri, { base: apiBase, signal });
    },
    [apiBase, uri],
  );

  const { data, loading, error } = usePolledThread({
    load,
    maxBackoffMs: MAX_BACKOFF_MS,
    pauseWhenHidden,
    refreshMs,
  });

  const root = data?.state === "open" ? data.post : undefined;
  const replies = root?.replies || [];
  // Deleted, blocked, or simply the wrong URI: say so rather than let it read
  // as a post nobody has replied to.
  const missing = data?.state === "unavailable";

  return (
    <section
      aria-live="polite"
      style={{
        marginTop: "2rem",
        borderTop: "1px solid #d1d5db",
        paddingTop: "1.2rem",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Comments</h2>

      {root && (
        <p style={{ marginTop: 0, marginBottom: "1rem" }}>
          Join the conversation on{" "}
          <a href={root.bskyUrl} rel="noopener noreferrer" target="_blank">
            Bluesky
          </a>
          .
        </p>
      )}

      {loading && <p>Loading comments…</p>}

      {!loading &&
        error &&
        (replies.length > 0 ? (
          <p style={{ color: "#92400e" }}>{error}</p>
        ) : (
          <p style={{ color: "#b91c1c" }}>
            Could not load Bluesky comments: {error}
          </p>
        ))}

      {!loading && !error && missing && (
        <p style={{ color: "#b91c1c" }}>
          This post is not available on Bluesky.
        </p>
      )}

      {!loading && !error && !missing && replies.length === 0 && (
        <p>No replies yet. Be the first one on Bluesky.</p>
      )}

      {!loading &&
        replies.map((reply, index) => (
          <ReplyThread
            depth={0}
            key={reply.uri || `root-${index}`}
            maxDepth={maxDepth}
            post={reply}
          />
        ))}
    </section>
  );
}
