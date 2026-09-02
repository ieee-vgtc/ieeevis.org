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
import type { CSSProperties, FormEvent } from "react";
import PostCard from "./bluesky/PostCard";
import type { PostLikeContext } from "./bluesky/PostCard";
import ReplyList from "./bluesky/ReplyList";
import SortToggle from "./bluesky/SortToggle";
import { fetchAppViewThread } from "./bluesky/direct";
import { formatOpensAt, likeCountOf } from "./bluesky/format";
import { createServiceClient } from "./bluesky/service";
import type {
  MeResponse,
  MyLikesResponse,
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
// How much of the byline the "Comment as …" button shows before ellipsis, so a
// long name cannot blow the button off its row.
const BYLINE_LIMIT = 22;

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
  /** Bypassed the service's shared cache, which may still disagree. */
  bypassedCache: boolean;
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

/** Clip a byline to `BYLINE_LIMIT` code points, adding an ellipsis if cut. */
function truncateByline(name: string): string {
  const chars = Array.from(name);
  return chars.length > BYLINE_LIMIT
    ? `${chars.slice(0, BYLINE_LIMIT - 1).join("")}…`
    : name;
}

/** Top-level ordering. "top" = most liked first (recency as tie-break);
 *  "newest" = most recent first. Nested replies stay chronological.
 *
 *  The optimistic like `deltas` fold into the sort key as well as the count, so
 *  a just-liked post rises immediately and holds that spot until the server
 *  agrees (the delta is retired only once the server count passes its baseline);
 *  without this a stale cached poll could shuffle it back for a beat. */
function sortReplies(
  replies: ShapedPost[],
  sort: ReplySort,
  deltas: Map<string, number>,
): ShapedPost[] {
  const likesOf = (post: ShapedPost) =>
    likeCountOf(post) + (deltas.get(post.uri) ?? 0);
  const byRecency = (a: ShapedPost, b: ShapedPost) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  const byLikes = (a: ShapedPost, b: ShapedPost) =>
    likesOf(b) - likesOf(a) || byRecency(a, b);
  return [...replies].sort(sort === "top" ? byLikes : byRecency);
}

/** Pending (just-posted) replies sort in on recency; under "top" they have no
 *  likes yet, so they are pinned at the end instead of being buried. */
function orderReplies(
  replies: ShapedPost[],
  pending: ShapedPost[],
  sort: ReplySort,
  deltas: Map<string, number>,
): ShapedPost[] {
  return sort === "newest"
    ? sortReplies([...replies, ...pending], sort, deltas)
    : [...sortReplies(replies, sort, deltas), ...pending];
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

/** The server's merged like count for every post in a thread, keyed by URI. */
function collectLikeCounts(
  replies: ShapedPost[],
  into = new Map<string, number>(),
): Map<string, number> {
  for (const reply of replies) {
    if (reply.uri) {
      into.set(reply.uri, likeCountOf(reply));
    }
    if (reply.replies?.length) {
      collectLikeCounts(reply.replies, into);
    }
  }
  return into;
}

/**
 * The optimistic deltas still worth applying against the given server counts.
 *
 * A delta is dropped the moment the server count has moved past the baseline it
 * was toggled against (in the delta's direction) — the server now reflects the
 * change, so applying the delta too would double-count it. Doing this at read
 * time (not only when pruning the stored state in an effect) closes the one
 * render between fresh data arriving and that prune, where server + delta were
 * briefly counted together — a transient that reordered the list and snapped it
 * straight back. A post not yet in the thread (a just-posted comment) keeps its
 * delta, as does one whose baseline we somehow lack.
 */
function reconcileDeltas(
  deltas: Map<string, number>,
  baselines: Map<string, number>,
  serverCounts: Map<string, number>,
): Map<string, number> {
  const active = new Map<string, number>();
  for (const [uri, delta] of deltas) {
    const server = serverCounts.get(uri);
    const baseline = baselines.get(uri);
    if (server !== undefined && baseline !== undefined) {
      const reflected = delta > 0 ? server > baseline : server < baseline;
      if (reflected) {
        continue;
      }
    }
    active.set(uri, delta);
  }
  return active;
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
          setIdentity({
            name: me.name ?? null,
            pseudonym: me.pseudonym,
            bluesky: typeof me.bluesky === "string" ? me.bluesky : null,
          });
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
  // Which posts *this reader* has liked, and — while an optimistic toggle is in
  // flight — a per-post adjustment laid over the server's total. The thread
  // response is shared between readers (nginx-cached) and so cannot carry either.
  const [likedUris, setLikedUris] = useState<Set<string>>(() => new Set());
  const [likeDeltas, setLikeDeltas] = useState<Map<string, number>>(
    () => new Map(),
  );
  // The server count each in-flight like was toggled against. A delta clears
  // only once the server has moved past its baseline in the right direction, so
  // a stale (cached) poll that predates the like cannot drop the count back.
  const likeBaselinesRef = useRef<Map<string, number>>(new Map());
  // The latest per-post server counts, so a fresh toggle can capture its
  // baseline from what is currently on screen.
  const serverCountsRef = useRef<Map<string, number>>(new Map());
  // A live mirror of `likedUris` so the toggle can read the current state
  // without being re-created on every like.
  const likedUrisRef = useRef(likedUris);
  useEffect(() => {
    likedUrisRef.current = likedUris;
  }, [likedUris]);
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
  // A reader who has linked a Bluesky account can post and like there directly,
  // so we hide the guest composer for them and point them at the thread instead.
  const blueskyHandle = identity?.bluesky?.trim() || null;
  const hasBlueskyAccount = Boolean(blueskyHandle);

  const load = useCallback(
    async (signal: AbortSignal, fresh: boolean): Promise<LoadedThread> => {
      if (atUri) {
        try {
          const thread = await fetchAppViewThread(atUri, { signal });
          // Unreachable from here (blocked network) or not there at all: with a
          // paper id the service can still answer, so let it try.
          if (thread.state !== "unavailable" || !paperId) {
            return { source: "direct", thread, bypassedCache: false };
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
        bypassedCache: fresh,
      };
    },
    [atUri, client, paperId],
  );

  const {
    data,
    loading,
    error,
    refresh,
    lastUpdatedAt,
    sectionRef,
    markInteraction,
  } = usePolledThread({
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
   * Which posts in this thread *this reader* has liked. The thread response
   * cannot carry it — that response is cached by nginx and shared between
   * readers — so it comes from the per-user endpoint, which needs the token.
   */
  const syncMyLikes = useCallback(async () => {
    const token = paperId ? await getToken() : null;
    if (!token || !paperId) {
      return;
    }

    try {
      const response = await client.fetchMyLikes(paperId, token);
      if (!response.ok) {
        return;
      }

      const likes = (await response.json()) as MyLikesResponse;
      if (Array.isArray(likes.postUris)) {
        setLikedUris(new Set(likes.postUris));
      }
    } catch {
      // A like-state miss is cosmetic; never surface it over the thread itself.
    }
  }, [client, getToken, paperId]);

  useEffect(() => {
    if (!data || data.thread.state !== "open") {
      return;
    }

    // Only a response the shared cache could also have served may retire
    // optimistic state. A cache-bypassing read runs ahead of that cache, so
    // retiring on one lets the next ordinary poll undo what the reader just did.
    const cacheHasCaughtUp = !data.bypassedCache;

    // Drop optimistic replies only once they appear in the real thread — a
    // cached response may not include them yet, and clearing on every poll
    // would make a just-posted comment flicker out and back.
    const known = collectUris(data.thread.post?.replies || []);
    if (cacheHasCaughtUp) {
      setPendingReplies((current) =>
        current.filter((reply) => !reply.uri || !known.has(reply.uri)),
      );
    }

    // Record the server's own counts, both so a new toggle can capture its
    // baseline and so pending deltas can be reconciled against them.
    const counts = data.thread.post
      ? collectLikeCounts([data.thread.post])
      : new Map<string, number>();
    serverCountsRef.current = counts;

    // Retire an optimistic delta only once the server count has actually moved
    // past the baseline it was toggled against — a cached poll returning the
    // pre-like count leaves the delta in place, so the count never drops back.
    setLikeDeltas((current) => {
      if (!current.size || !cacheHasCaughtUp) {
        return current;
      }
      let changed = false;
      const next = new Map(current);
      for (const [uri, delta] of current) {
        const server = counts.get(uri);
        if (server === undefined) {
          continue; // not read back yet (e.g. a just-posted comment)
        }
        const baseline = likeBaselinesRef.current.get(uri) ?? server;
        const reflected = delta > 0 ? server > baseline : server < baseline;
        if (reflected) {
          next.delete(uri);
          likeBaselinesRef.current.delete(uri);
          changed = true;
        }
      }
      return changed ? next : current;
    });

    if (data.source === "service") {
      void syncMyLikes();
    }
  }, [data, syncMyLikes]);

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
            guestLikeCount: 0,
            totalLikeCount: 0,
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

  const toggleLike = useCallback(
    async (postUri: string) => {
      const next = !likedUrisRef.current.has(postUri);

      const applyOptimistic = (like: boolean) => {
        setLikedUris((current) => {
          const updated = new Set(current);
          if (like) {
            updated.add(postUri);
          } else {
            updated.delete(postUri);
          }
          return updated;
        });
      };
      const bumpDelta = (by: number) => {
        setLikeDeltas((current) => {
          const updated = new Map(current);
          const value = (updated.get(postUri) ?? 0) + by;
          if (value === 0) {
            // Back to the server's own count (e.g. a like then unlike, or a
            // rollback): no adjustment to reconcile, so drop the baseline too.
            updated.delete(postUri);
            likeBaselinesRef.current.delete(postUri);
          } else {
            updated.set(postUri, value);
            // Capture the count this like is measured against, once.
            if (!likeBaselinesRef.current.has(postUri)) {
              likeBaselinesRef.current.set(
                postUri,
                serverCountsRef.current.get(postUri) ?? 0,
              );
            }
          }
          return updated;
        });
      };

      // Optimistic: flip the liked state and nudge the shown count now.
      applyOptimistic(next);
      bumpDelta(next ? 1 : -1);
      setActionError(null);

      const rollBack = () => {
        applyOptimistic(!next);
        bumpDelta(next ? -1 : 1);
      };

      try {
        const token = paperId ? await getToken() : null;
        if (!token || !paperId) {
          rollBack();
          setActionError("Your session expired. Reload the page to like.");
          return;
        }

        const response = await client.setLike(paperId, token, postUri, next);
        if (!response.ok && response.status !== 204) {
          throw new Error(`The service returned ${response.status}.`);
        }

        await refresh(true);
      } catch (err) {
        rollBack();
        setActionError(
          (err as Error).message || "Your like could not be saved.",
        );
      }
    },
    [client, getToken, paperId, refresh],
  );

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
  // Apply optimistic deltas only where the server has not already caught up, so
  // the shown count and the sort order never briefly double-count a like being
  // reconciled (see reconcileDeltas). Both the counts and the ordering read from
  // the same reconciled map.
  const serverCounts = root
    ? collectLikeCounts([root])
    : new Map<string, number>();
  const activeDeltas = reconcileDeltas(
    likeDeltas,
    likeBaselinesRef.current,
    serverCounts,
  );
  // A pending reply is held until the cache agrees, so hide the copy whenever
  // the thread on screen already carries it.
  const shownUris = collectUris(root?.replies || []);
  const replies = orderReplies(
    root?.replies || [],
    pendingReplies.filter((reply) => !reply.uri || !shownUris.has(reply.uri)),
    sort,
    activeDeltas,
  );
  const remaining = COMMENT_LIMIT - graphemeLength(draft);
  // The two possible bylines the submit button can show — the real name and the
  // pseudonym — so it can reserve room for the wider and not resize (shoving the
  // checkbox) when "Hide my name" flips between them. Until identity loads both
  // are just "Comment".
  const realNameByline = identity?.name || identity?.pseudonym || null;
  const pseudonymByline = identity?.pseudonym || null;
  const bylineLabel = (who: string | null) =>
    who ? `Comment as ${truncateByline(who)}` : "Comment";

  // The like control is the same on the root and every reply; the discussion
  // owns the state so they all read and update one shared source.
  const likeContext: PostLikeContext = {
    canLike: interactive && !hasBlueskyAccount,
    likedUris,
    deltas: activeDeltas,
    onToggle: toggleLike,
  };

  return (
    <section
      ref={sectionRef}
      style={sectionStyle}
      aria-live="polite"
      // Any click, tap or scroll gesture on the section counts as activity and
      // resets the polling cadence to the base interval.
      onPointerDown={markInteraction}
    >
      <h2 style={{ margin: "0 0 0.5rem" }}>Discussion</h2>
      <style>
        {"@keyframes bsky-spin{to{transform:rotate(360deg)}}" +
          // Keyboard focus gets a clean inset ring in the callout blue, clipped
          // to the card's rounded corners; a mouse click paints nothing (the
          // default outline's bottom edge showed as a dashed line on the band).
          ".bsky-callout:focus{outline:none}" +
          ".bsky-callout:focus-visible{outline:2px solid #2563eb;outline-offset:-2px}"}
      </style>

      {root && (
        <div style={announcementCardStyle}>
          <PostCard bare like={likeContext} post={root} variant="root" />

          {root.bskyUrl && (
            <a
              className="bsky-callout"
              href={root.bskyUrl}
              rel="noopener noreferrer"
              style={calloutFooterStyle}
              target="_blank"
            >
              <span>
                {hasBlueskyAccount
                  ? `🦋 You're on Bluesky as @${blueskyHandle} — post and like directly there`
                  : "🦋 View or join this discussion on Bluesky"}
              </span>
              <span aria-hidden="true" style={{ fontSize: "1.1rem" }}>
                →
              </span>
            </a>
          )}
        </div>
      )}

      {interactive && !hasBlueskyAccount && (
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

          {/* One row: submit on the left, then the checkbox it drives right
              beside it (with the "name is hidden" note tucked under the
              checkbox), and the counter alone on the far right. */}
          <div
            style={{
              display: "flex",
              // Top-aligned: when the "name is hidden" note appears under the
              // checkbox the column grows downward without re-centering (and so
              // jumping) the button and checkbox.
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "0.5rem 0.75rem",
              marginTop: "0.5rem",
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            {/* The section is a polite live region, so the button's byline is
                announced when "Hide my name" toggles it. */}
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
                whiteSpace: "nowrap",
              }}
              type="submit"
            >
              {/* Both bylines occupy one grid cell so the button reserves the
                  wider width and does not resize (shoving the checkbox) when
                  "Hide my name" flips which one shows; "Posting…" overlays while
                  submitting. Only the active label is visible/announced. */}
              <span style={{ display: "grid" }}>
                <span
                  style={{
                    gridArea: "1 / 1",
                    visibility: submitting || anonymous ? "hidden" : "visible",
                  }}
                >
                  {bylineLabel(realNameByline)}
                </span>
                <span
                  style={{
                    gridArea: "1 / 1",
                    visibility: submitting || !anonymous ? "hidden" : "visible",
                  }}
                >
                  {bylineLabel(pseudonymByline)}
                </span>
                {submitting && (
                  <span style={{ gridArea: "1 / 1" }}>Posting…</span>
                )}
              </span>
            </button>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.15rem",
              }}
            >
              <label
                style={{
                  display: "inline-flex",
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

              {anonymous && (
                <small style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Your name is hidden from readers, not from conference
                  organizers.
                </small>
              )}
            </div>

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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem 0.75rem",
          margin: "0.9rem 0 0.2rem",
        }}
      >
        {replies.length > 1 && (
          <SortToggle
            onChange={(next) => {
              markInteraction();
              setSort(next);
            }}
            sort={sort}
          />
        )}

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

      <ReplyList like={likeContext} maxDepth={maxDepth} replies={replies} />
    </section>
  );
}

const sectionStyle: CSSProperties = {
  marginTop: "2.5rem",
};

/**
 * The announcement and the Bluesky callout share one bordered box; `overflow`
 * clips the callout's shaded footer band to the rounded bottom corners.
 */
const announcementCardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "0.6rem",
  overflow: "hidden",
  backgroundColor: "#f9fafb",
  marginBottom: "0.75rem",
};

/** The "join on Bluesky" callout, as a shaded footer band of the card above. */
const calloutFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.7rem 0.9rem",
  borderTop: "1px solid #bfdbfe",
  // The site's prose links carry a dashed border-bottom (.content a); this is a
  // full-width link, so without this it draws a dashed rule across the band.
  borderBottom: "none",
  backgroundColor: "#eff6ff",
  color: "#1e3a8a",
  fontWeight: 600,
  fontSize: "0.9rem",
  textDecoration: "none",
};
