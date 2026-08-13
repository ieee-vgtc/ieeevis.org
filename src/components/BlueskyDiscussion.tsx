/**
 * The Bluesky discussion of a page's post: the announcement itself, its reply
 * thread, and — where the reader is allowed — a comment box and a like button.
 *
 * It reads from either of two sources, which deliver the same shaped thread
 * (`bluesky/types.ts`):
 *
 *   - `atUri` reads the thread straight from the public Bluesky AppView. This
 *     is what pages use once the real post URIs are known and baked in.
 *   - `paperId` reads it from the conference discussion service, which
 *     addresses threads by the paper's stable id, reaches readers behind
 *     networks that cannot see Bluesky, and is the only source that accepts
 *     guest writes.
 *
 * Given both, the AppView is tried first and the service is the fallback.
 * Commenting and liking appear only when the thread came from the service and
 * the reader's site session yields a token; everything else is read-only.
 *
 * A comment carries the attendee's real name unless they tick "Hide my name",
 * which swaps it for their stable pseudonym. Such a post is unnamed rather than
 * untraceable — organizers can still tell who wrote it — so the label says what
 * it does instead of calling the post anonymous, and the hint beside it spells
 * out the difference.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import PostCard from "./bluesky/PostCard";
import ReplyThread from "./bluesky/ReplyThread";
import SortToggle from "./bluesky/SortToggle";
import { fetchAppViewThread } from "./bluesky/direct";
import { formatOpensAt, likeCountOf } from "./bluesky/format";
import { createServiceClient } from "./bluesky/service";
import type {
  LikesResponse,
  MeResponse,
  ServiceClient,
} from "./bluesky/service";
import type {
  ReplySort,
  ShapedPost,
  ThreadResponse,
  ThreadSource,
} from "./bluesky/types";
import { usePolledThread } from "./bluesky/usePolledThread";

const DEFAULT_API_BASES = ["https://bsky.tech.ieeevis.org"];
const DEFAULT_REFRESH_MS = 5_000;
const MAX_DEPTH = 5;
const COMMENT_LIMIT = 250; // graphemes; mirrors CONFERENCE.guestTextLimit
const TOKEN_REFRESH_SKEW_MS = 60_000;

interface BlueskyDiscussionProps {
  /** `slots.slot_id` (e.g. "v-full-1234") or the paper UUID — the API takes both. */
  paperId?: string;
  /** `at://did/app.bsky.feed.post/rkey` of the post the thread hangs off. */
  atUri?: string;
  /**
   * Service origins in priority order; the next one is tried when a request
   * fails to reach the current one.
   */
  apiBases?: string[];
  refreshMs?: number;
  maxDepth?: number;
  /** Initial order of top-level replies; the reader can toggle. */
  defaultSort?: ReplySort;
}

interface LoadedThread {
  source: ThreadSource;
  thread: ThreadResponse;
}

interface GuestToken {
  token: string;
  expiresAt: number;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Count the way the API does, so the counter and the 400 agree. */
function graphemeLength(text: string): number {
  const Segmenter = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (!Segmenter) {
    return [...text].length;
  }
  let n = 0;
  for (const _ of new Segmenter("en", { granularity: "grapheme" }).segment(
    text,
  )) {
    n++;
  }
  return n;
}

/** Top-level ordering. "top" = most liked first (recency as tie-break);
 *  "newest" = most recent first. Nested replies stay chronological. */
function sortReplies(replies: ShapedPost[], sort: ReplySort): ShapedPost[] {
  const byRecency = (a: ShapedPost, b: ShapedPost) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  const byLikes = (a: ShapedPost, b: ShapedPost) =>
    likeCountOf(b) - likeCountOf(a) || byRecency(a, b);
  return [...replies].sort(sort === "top" ? byLikes : byRecency);
}

/** Every reply URI in a thread, at any depth. */
function collectUris(
  replies: ShapedPost[],
  into = new Set<string>(),
): Set<string> {
  for (const reply of replies) {
    if (reply.uri) {
      into.add(reply.uri);
    }
    if (reply.replies?.length) {
      collectUris(reply.replies, into);
    }
  }
  return into;
}

/**
 * A cheap fingerprint of a loaded thread: its state, how many replies it holds
 * at any depth, and the merged like count. When any of these move, a poll
 * brought something new and the polling cadence resets to the base interval.
 */
function threadSignature(loaded: LoadedThread): string {
  const thread = loaded.thread;
  if (thread.state !== "open" || !thread.post) {
    return thread.state;
  }
  const replyCount = collectUris(thread.post.replies || []).size;
  return `open:${replyCount}:${thread.post.totalLikeCount}`;
}

/** "updated 3s ago", "updated 2m ago", … for the freshness indicator. */
function formatAgo(sinceMs: number): string {
  const seconds = Math.max(0, Math.round(sinceMs / 1000));
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  return `${Math.floor(minutes / 60)}h ago`;
}

/**
 * Mint a short-lived token from the site's own session. Paper pages are behind
 * `isProtectedPath`, so a reader who got this far normally has a session; a 401
 * simply means "no guest UI" and is not an error worth showing.
 */
function useGuestToken(enabled: boolean) {
  const tokenRef = useRef<GuestToken | null>(null);
  const [hasToken, setHasToken] = useState(false);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!enabled) {
      return null;
    }

    const cached = tokenRef.current;
    if (cached && cached.expiresAt - TOKEN_REFRESH_SKEW_MS > Date.now()) {
      return cached.token;
    }

    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${base}/auth/token`, {
        credentials: "same-origin",
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        tokenRef.current = null;
        setHasToken(false);
        return null;
      }

      const data = (await response.json()) as {
        token?: string;
        expiresAt?: string;
      };
      if (!data.token) {
        setHasToken(false);
        return null;
      }

      tokenRef.current = {
        token: data.token,
        expiresAt: data.expiresAt
          ? Date.parse(data.expiresAt)
          : Date.now() + 600_000,
      };
      setHasToken(true);
      return data.token;
    } catch {
      setHasToken(false);
      return null;
    }
  }, [enabled]);

  useEffect(() => {
    void getToken();
  }, [getToken]);

  return { hasToken, getToken };
}

/**
 * Who the reader will be credited as, read once the token exists. A miss leaves
 * this null, and the form falls back to promising only the pseudonym — the
 * weaker claim of the two, and so the safe one to make when we cannot check.
 */
function useIdentity(
  client: ServiceClient,
  getToken: () => Promise<string | null>,
  enabled: boolean,
) {
  const [identity, setIdentity] = useState<MeResponse | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    void (async () => {
      try {
        const token = await getToken();
        if (!token) {
          return;
        }

        const response = await client.fetchMe(token, {
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }

        const me = (await response.json()) as Partial<MeResponse>;
        if (typeof me.pseudonym === "string") {
          setIdentity({ name: me.name ?? null, pseudonym: me.pseudonym });
        }
      } catch {
        // Cosmetic: the checkbox still works, the preview is just vaguer.
      }
    })();

    return () => controller.abort();
  }, [client, enabled, getToken]);

  return identity;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function BlueskyDiscussion({
  paperId,
  atUri,
  apiBases = DEFAULT_API_BASES,
  refreshMs = DEFAULT_REFRESH_MS,
  maxDepth = MAX_DEPTH,
  defaultSort = "top",
}: BlueskyDiscussionProps) {
  const [sort, setSort] = useState<ReplySort>(defaultSort);
  const [draft, setDraft] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingReplies, setPendingReplies] = useState<ShapedPost[]>([]);
  const [liked, setLiked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { hasToken, getToken } = useGuestToken(Boolean(paperId));

  // Callers pass an inline array literal, so depend on its contents rather than
  // its identity — otherwise every render would build a new client and restart
  // the polling effect.
  const basesKey = apiBases.join(",");
  const client = useMemo(
    () => createServiceClient(basesKey.split(",")),
    [basesKey],
  );

  const identity = useIdentity(client, getToken, hasToken);
  /** What the service will put in front of the post, as best we can predict. */
  const attribution = anonymous
    ? identity?.pseudonym
    : identity?.name || identity?.pseudonym;

  const load = useCallback(
    async (signal: AbortSignal, fresh: boolean): Promise<LoadedThread> => {
      if (atUri) {
        try {
          const thread = await fetchAppViewThread(atUri, { signal });
          // Unreachable from here (blocked network) or not there at all: with a
          // paper id the service can still answer, so let it try.
          if (thread.state !== "unavailable" || !paperId) {
            return { source: "direct", thread };
          }
        } catch (err) {
          if ((err as Error).name === "AbortError" || !paperId) {
            throw err;
          }
        }
      }

      if (!paperId) {
        throw new Error("No Bluesky post URI or paper id was given.");
      }

      return {
        source: "service",
        thread: await client.fetchThread(paperId, { signal, fresh }),
      };
    },
    [atUri, client, paperId],
  );

  const { data, loading, error, refresh, lastUpdatedAt, sectionRef, markInteraction } =
    usePolledThread({
      load,
      refreshMs,
      signature: threadSignature,
    });

  // A once-a-second tick so the "updated Xs ago" label counts up on its own.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const onRefreshClick = useCallback(async () => {
    markInteraction();
    setRefreshing(true);
    try {
      await refresh(true);
    } finally {
      setRefreshing(false);
    }
  }, [markInteraction, refresh]);

  const thread = data?.thread;
  /** Guest writes are bridged by the service; the AppView is read-only here. */
  const interactive = data?.source === "service" && hasToken;

  /**
   * Whether *this reader* has liked the paper. The thread response cannot carry
   * it — that response is cached by nginx and shared between readers — so it
   * comes from the per-user likes endpoint, which needs the bearer token.
   */
  const syncLiked = useCallback(async () => {
    const token = paperId ? await getToken() : null;
    if (!token || !paperId) {
      return;
    }

    try {
      const response = await client.fetchLikes(paperId, token);
      if (!response.ok) {
        return;
      }

      const likes = (await response.json()) as LikesResponse;
      if (typeof likes.likedByMe === "boolean") {
        setLiked(likes.likedByMe);
      }
    } catch {
      // A like-state miss is cosmetic; never surface it over the thread itself.
    }
  }, [client, getToken, paperId]);

  useEffect(() => {
    if (!data || data.thread.state !== "open") {
      return;
    }

    // Drop optimistic replies only once they appear in the real thread — a
    // cached response may not include them yet, and clearing on every poll
    // would make a just-posted comment flicker out and back.
    const known = collectUris(data.thread.post?.replies || []);
    setPendingReplies((current) =>
      current.filter((reply) => !reply.uri || !known.has(reply.uri)),
    );

    if (data.source === "service") {
      void syncLiked();
    }
  }, [data, syncLiked]);

  const submitComment = useCallback(
    async (event: FormEvent) => {
      const text = draft.trim();
      event.preventDefault();
      if (!text || submitting || !paperId) {
        return;
      }
      if (graphemeLength(text) > COMMENT_LIMIT) {
        setActionError(`Comments are limited to ${COMMENT_LIMIT} characters.`);
        return;
      }

      setSubmitting(true);
      setActionError(null);

      try {
        const token = await getToken();
        if (!token) {
          setActionError("Your session expired. Reload the page to comment.");
          return;
        }

        const response = await client.postComment(
          paperId,
          token,
          text,
          anonymous,
        );

        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          setActionError(
            retryAfter
              ? `You are commenting too quickly. Try again in ${retryAfter}s.`
              : "You are commenting too quickly. Try again shortly.",
          );
          return;
        }
        if (response.status === 409) {
          setActionError("This discussion is not open yet.");
          return;
        }
        if (!response.ok) {
          throw new Error(`The service returned ${response.status}.`);
        }

        const created = (await response.json()) as {
          uri?: string;
          author?: string;
        };

        // Show it immediately; the next refetch replaces it with the real post.
        // The service credits the post by prefixing its text, which the local
        // draft has none of, so the name it reports back rides in `pseudonym` —
        // where `displayPost` looks first — for these few seconds.
        setPendingReplies((current) => [
          ...current,
          {
            uri: created.uri || `pending-${Date.now()}`,
            author: { displayName: null, avatar: null },
            text,
            createdAt: new Date().toISOString(),
            guest: true,
            pseudonym: created.author || attribution || null,
            likeCount: 0,
            embedImages: [],
            replies: [],
          },
        ]);
        setDraft("");

        await refresh(true);
      } catch (err) {
        setActionError(
          (err as Error).message || "Your comment could not be posted.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      anonymous,
      attribution,
      client,
      draft,
      getToken,
      paperId,
      refresh,
      submitting,
    ],
  );

  const toggleLike = useCallback(async () => {
    const next = !liked;
    setLiked(next); // optimistic
    setActionError(null);

    try {
      const token = paperId ? await getToken() : null;
      if (!token || !paperId) {
        setLiked(!next);
        setActionError("Your session expired. Reload the page to like.");
        return;
      }

      const response = await client.setLike(paperId, token, next);
      if (!response.ok && response.status !== 204) {
        throw new Error(`The service returned ${response.status}.`);
      }

      await refresh(true);
    } catch (err) {
      setLiked(!next); // roll back
      setActionError((err as Error).message || "Your like could not be saved.");
    }
  }, [client, getToken, liked, paperId, refresh]);

  // ── render ──

  // Nothing is mapped for this paper (no session, withdrawn, or not in the
  // program). Render nothing at all rather than an empty "Discussion" heading.
  if (thread?.state === "unavailable") {
    return null;
  }

  if (loading && !thread) {
    return (
      <section ref={sectionRef} style={sectionStyle} aria-live="polite">
        <h2 style={{ marginBottom: "0.5rem" }}>Discussion</h2>
        <p style={{ color: "#6b7280" }}>Loading the discussion…</p>
      </section>
    );
  }

  if (thread?.state === "not_open") {
    const opensAt = formatOpensAt(thread.opensAt);
    return (
      <section ref={sectionRef} style={sectionStyle} aria-live="polite">
        <h2 style={{ marginBottom: "0.5rem" }}>Discussion</h2>
        <p style={{ color: "#6b7280", margin: 0 }}>
          {opensAt
            ? `The discussion for this paper opens shortly before its session, on ${opensAt}.`
            : "The discussion for this paper opens shortly before its session."}
        </p>
      </section>
    );
  }

  const root = thread?.state === "open" ? thread.post : undefined;
  // Pending (just-posted) replies stay pinned at the end regardless of sort so
  // the author always sees their own comment.
  const replies = [
    ...sortReplies(root?.replies || [], sort),
    ...pendingReplies,
  ];
  const remaining = COMMENT_LIMIT - graphemeLength(draft);
  const rootLikes = root ? likeCountOf(root) : 0;

  let rootFooter: ReactNode = null;
  if (root) {
    rootFooter = (
      <>
        {interactive ? (
          <button
            aria-pressed={liked}
            onClick={toggleLike}
            style={{
              padding: "0.25rem 0.7rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              backgroundColor: liked ? "#eff6ff" : "#fff",
              color: liked ? "#2563eb" : "inherit",
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
            type="button"
          >
            {liked ? "♥" : "♡"} {rootLikes}
          </button>
        ) : (
          <span>
            {rootLikes} {rootLikes === 1 ? "like" : "likes"}
          </span>
        )}

        <a
          href={root.bskyUrl}
          rel="noopener noreferrer"
          style={{ color: "#2563eb", textDecoration: "none" }}
          target="_blank"
        >
          View on Bluesky
        </a>
      </>
    );
  }

  return (
    <section
      ref={sectionRef}
      style={sectionStyle}
      aria-live="polite"
      // Any click, tap or scroll gesture on the section counts as activity and
      // resets the polling cadence to the base interval.
      onPointerDown={markInteraction}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "0.5rem 0.75rem",
          marginBottom: "0.5rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Discussion</h2>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.8rem",
            color: "#6b7280",
          }}
        >
          {lastUpdatedAt !== null && (
            <span aria-live="off">
              updated {formatAgo(now - lastUpdatedAt)}
            </span>
          )}
          <button
            aria-label="Refresh the discussion"
            disabled={refreshing}
            onClick={onRefreshClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.25rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              color: "inherit",
              cursor: refreshing ? "default" : "pointer",
              fontSize: "0.8rem",
              opacity: refreshing ? 0.6 : 1,
            }}
            type="button"
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                animation: refreshing
                  ? "bsky-spin 0.8s linear infinite"
                  : undefined,
              }}
            >
              ↻
            </span>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>
      <style>{"@keyframes bsky-spin{to{transform:rotate(360deg)}}"}</style>

      {root && <PostCard footer={rootFooter} post={root} variant="root" />}

      {interactive && (
        <form onSubmit={submitComment} style={{ margin: "1rem 0" }}>
          <label
            htmlFor={`bsky-comment-${paperId}`}
            style={{ display: "none" }}
          >
            Add a comment
          </label>
          <textarea
            disabled={submitting}
            id={`bsky-comment-${paperId}`}
            onChange={(event) => {
              markInteraction();
              setDraft(event.target.value);
            }}
            onFocus={markInteraction}
            placeholder="Add a comment"
            rows={3}
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              resize: "vertical",
            }}
            value={draft}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.5rem",
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                cursor: submitting ? "default" : "pointer",
              }}
            >
              <input
                checked={anonymous}
                disabled={submitting}
                onChange={(event) => {
                  markInteraction();
                  setAnonymous(event.target.checked);
                }}
                type="checkbox"
              />
              Hide my name
            </label>

            {/* The section is already a polite live region, so a toggle of the
                checkbox announces the new byline without one of its own. */}
            <span style={{ color: "#374151" }}>
              <span aria-hidden="true" style={{ color: "#9ca3af" }}>
                ·{" "}
              </span>
              {attribution
                ? `Posting as ${attribution}`
                : "Posting under your pseudonym"}
            </span>
          </div>

          <small
            style={{
              display: "block",
              marginTop: "0.3rem",
              fontSize: "0.8rem",
              color: "#6b7280",
            }}
          >
            Your name is hidden from readers, not from conference organizers.
          </small>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginTop: "0.6rem",
            }}
          >
            <button
              disabled={submitting || !draft.trim() || remaining < 0}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "0.5rem",
                border: "1px solid #2563eb",
                backgroundColor: "#2563eb",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
              type="submit"
            >
              {submitting ? "Posting…" : "Comment"}
            </button>

            <small
              style={{
                marginLeft: "auto",
                color: remaining < 0 ? "#b91c1c" : "#6b7280",
              }}
            >
              {remaining}
            </small>
          </div>
        </form>
      )}

      {actionError && (
        <p style={{ color: "#b91c1c", marginTop: 0 }}>{actionError}</p>
      )}

      {error && (
        <p style={{ color: replies.length > 0 ? "#92400e" : "#b91c1c" }}>
          {replies.length > 0
            ? error
            : `Could not load the discussion: ${error}`}
        </p>
      )}

      {!error && replies.length === 0 && (
        <p style={{ color: "#6b7280" }}>
          No comments yet.{interactive ? " Start the conversation." : ""}
        </p>
      )}

      {replies.length > 1 && (
        <SortToggle
          onChange={(next) => {
            markInteraction();
            setSort(next);
          }}
          sort={sort}
        />
      )}

      {replies.map((reply, index) => (
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

const sectionStyle: CSSProperties = {
  marginTop: "2rem",
  borderTop: "1px solid #d1d5db",
  paddingTop: "1.2rem",
};
