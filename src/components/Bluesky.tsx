import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

const DEFAULT_MAX_DEPTH = 5;
const DEFAULT_REFRESH_MS = 60_000;
const MAX_BACKOFF_MS = 30_000;

interface BlueskyCommentsProps {
  did?: string;
  postCid?: string;
  atUri?: string;
  maxDepth?: number;
  apiBase?: string;
  refreshMs?: number;
  pauseWhenHidden?: boolean;
}

interface Author {
  did?: string;
  handle?: string;
  displayName?: string;
  avatar?: string;
}

interface Facet {
  index?: {
    byteStart?: number;
    byteEnd?: number;
  };
  features?: Array<
    | {
        $type?: "app.bsky.richtext.facet#link";
        uri?: string;
      }
    | {
        $type?: "app.bsky.richtext.facet#mention";
        did?: string;
      }
    | {
        $type?: "app.bsky.richtext.facet#tag";
        tag?: string;
      }
  >;
}

interface PostRecord {
  text?: string;
  facets?: Facet[];
  createdAt?: string;
}

interface EmbedImage {
  thumb?: string;
  fullsize?: string;
  alt?: string;
}

interface ExternalEmbed {
  uri?: string;
  title?: string;
  description?: string;
  thumb?: string;
}

interface RecordEmbedView {
  uri?: string;
  cid?: string;
  author?: {
    did?: string;
    handle?: string;
    displayName?: string;
  };
  value?: {
    text?: string;
  };
}

interface Embed {
  $type?: string;
  images?: EmbedImage[];
  external?: ExternalEmbed;
  record?: RecordEmbedView;
  media?: Embed;
}

interface Post {
  uri?: string;
  cid?: string;
  indexedAt?: string;
  author?: Author;
  record?: PostRecord;
  embed?: Embed;
  replyCount?: number;
  likeCount?: number;
  repostCount?: number;
}

interface Thread {
  $type?: string;
  post?: Post;
  replies?: Thread[];
}

interface ThreadResponse {
  thread?: Thread;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const deltaSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units = [
    { label: "y", seconds: 31_536_000 },
    { label: "mo", seconds: 2_592_000 },
    { label: "d", seconds: 86_400 },
    { label: "h", seconds: 3_600 },
    { label: "m", seconds: 60 },
  ];

  for (const unit of units) {
    if (deltaSeconds >= unit.seconds) {
      return `${Math.floor(deltaSeconds / unit.seconds)}${unit.label}`;
    }
  }

  return "now";
}

function profileHref(author?: Author): string {
  const id = author?.handle || author?.did;
  if (!id) {
    return "https://bsky.app";
  }
  return `https://bsky.app/profile/${id}`;
}

function postHref(post?: Post): string {
  const uri = post?.uri;
  if (!uri) {
    return "https://bsky.app";
  }

  const parts = uri.split("/");
  const did = parts[2];
  const rkey = parts[4];
  if (!did || !rkey) {
    return "https://bsky.app";
  }

  return `https://bsky.app/profile/${did}/post/${rkey}`;
}

function renderText(record?: PostRecord): ReactNode {
  const text = record?.text || "";
  return <p style={{ margin: "0.4rem 0", whiteSpace: "pre-wrap" }}>{text}</p>;
}

function renderEmbed(embed?: Embed): ReactNode {
  if (!embed || !embed.$type) {
    return null;
  }

  if (embed.$type === "app.bsky.embed.images#view") {
    const images = embed.images || [];
    if (images.length === 0) {
      return null;
    }

    return (
      <div
        style={{
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          marginTop: "0.5rem",
        }}
      >
        {images.map((image, index) => (
          <a
            href={image.fullsize || image.thumb || "https://bsky.app"}
            key={`${image.fullsize || image.thumb || "img"}-${index}`}
            rel="noopener noreferrer"
            style={{ display: "block" }}
            target="_blank"
          >
            <img
              alt={image.alt || "Bluesky embed image"}
              src={image.thumb || image.fullsize}
              style={{
                width: "100%",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
              }}
            />
          </a>
        ))}
      </div>
    );
  }

  if (embed.$type === "app.bsky.embed.external#view" && embed.external) {
    const external = embed.external;
    return (
      <a
        href={external.uri || "#"}
        rel="noopener noreferrer"
        style={{
          display: "block",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          marginTop: "0.5rem",
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
        }}
        target="_blank"
      >
        {external.thumb && (
          <img
            alt={external.title || "External preview"}
            src={external.thumb}
            style={{ width: "100%", maxHeight: "180px", objectFit: "cover" }}
          />
        )}
        <div style={{ padding: "0.6rem" }}>
          <strong style={{ display: "block", marginBottom: "0.2rem" }}>
            {external.title || external.uri}
          </strong>
          {external.description && (
            <small style={{ color: "#4b5563" }}>{external.description}</small>
          )}
        </div>
      </a>
    );
  }

  if (embed.$type === "app.bsky.embed.record#view" && embed.record) {
    return (
      <a
        href={
          embed.record.uri
            ? postHref({ uri: embed.record.uri })
            : "https://bsky.app"
        }
        rel="noopener noreferrer"
        style={{
          display: "block",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "0.6rem",
          marginTop: "0.5rem",
          textDecoration: "none",
          color: "inherit",
        }}
        target="_blank"
      >
        <strong style={{ display: "block", marginBottom: "0.2rem" }}>
          Quoted post by @
          {embed.record.author?.handle || embed.record.author?.did || "unknown"}
        </strong>
        <small>
          {embed.record.value?.text || "Open quoted post on Bluesky"}
        </small>
      </a>
    );
  }

  if (embed.$type === "app.bsky.embed.recordWithMedia#view") {
    return (
      <>
        {renderEmbed(embed.media)}
        {renderEmbed({
          $type: "app.bsky.embed.record#view",
          record: embed.record,
        })}
      </>
    );
  }

  return (
    <small style={{ color: "#6b7280", display: "block", marginTop: "0.5rem" }}>
      This embed type ({embed.$type}) is not yet implemented.
    </small>
  );
}

function BlueskyReply({
  thread,
  depth,
  maxDepth,
}: {
  thread: Thread;
  depth: number;
  maxDepth: number;
}) {
  if (!thread.post) {
    return null;
  }

  const { post } = thread;
  const authorName =
    post.author?.displayName || post.author?.handle || "Unknown";

  return (
    <div
      style={{
        marginTop: "0.75rem",
        marginLeft: depth * 12,
        borderLeft: depth > 0 ? "2px solid #e5e7eb" : "none",
        paddingLeft: depth > 0 ? "0.75rem" : 0,
      }}
    >
      <article
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.6rem",
          padding: "0.75rem",
          backgroundColor: "#fff",
        }}
      >
        <header
          style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
        >
          {post.author?.avatar && (
            <img
              alt={`${authorName} avatar`}
              src={post.author.avatar}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9999px",
                objectFit: "cover",
                border: "1px solid #e5e7eb",
              }}
            />
          )}
          <div style={{ lineHeight: 1.2 }}>
            <a
              href={profileHref(post.author)}
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
              target="_blank"
            >
              {authorName}
            </a>
            <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              @{post.author?.handle || post.author?.did || "unknown"}
              {" · "}
              <a
                href={postHref(post)}
                rel="noopener noreferrer"
                style={{ color: "#2563eb", textDecoration: "none" }}
                target="_blank"
              >
                {formatRelativeTime(post.record?.createdAt || post.indexedAt)}
              </a>
            </div>
          </div>
        </header>

        {renderText(post.record)}
        {renderEmbed(post.embed)}

        <footer
          style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: "0.5rem" }}
        >
          {post.likeCount || 0} likes · {post.replyCount || 0} replies ·{" "}
          {post.repostCount || 0} reposts
        </footer>
      </article>

      {depth < maxDepth &&
        thread.replies?.map((reply, index) => (
          <BlueskyReply
            depth={depth + 1}
            key={reply.post?.uri || `${depth}-${index}`}
            maxDepth={maxDepth}
            thread={reply}
          />
        ))}

      {depth >= maxDepth && (thread.replies?.length || 0) > 0 && (
        <small
          style={{ display: "block", marginTop: "0.4rem", color: "#6b7280" }}
        >
          View more replies on Bluesky.
        </small>
      )}
    </div>
  );
}

function buildAtUri({ atUri, did, postCid }: BlueskyCommentsProps): string {
  if (atUri) {
    return atUri;
  }

  if (!did || !postCid) {
    return "";
  }

  return `at://${did}/app.bsky.feed.post/${postCid}`;
}

export default function BlueskyComments(props: BlueskyCommentsProps) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const nextRequestAtRef = useRef(0);

  const maxDepth = props.maxDepth ?? DEFAULT_MAX_DEPTH;
  const apiBase = props.apiBase || "https://public.api.bsky.app";
  const refreshMs = props.refreshMs ?? DEFAULT_REFRESH_MS;
  const pauseWhenHidden = props.pauseWhenHidden ?? true;

  const uri = useMemo(
    () => buildAtUri(props),
    [props.atUri, props.did, props.postCid],
  );

  useEffect(() => {
    if (!uri) {
      setLoading(false);
      setError(
        "Missing Bluesky post identifier. Provide atUri or did + postCid.",
      );
      return;
    }

    let disposed = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let currentController: AbortController | null = null;
    let isFetching = false;

    async function fetchThread() {
      if (disposed || isFetching) {
        return;
      }
      if (Date.now() < nextRequestAtRef.current) {
        return;
      }

      isFetching = true;
      const shouldShowLoading = !hasLoadedOnceRef.current;
      if (shouldShowLoading) {
        setLoading(true);
      }
      currentController = new AbortController();

      try {
        const endpoint = `${apiBase}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=100`;
        const response = await fetch(endpoint, {
          signal: currentController.signal,
        });
        if (!response.ok) {
          throw new Error(`Bluesky API returned ${response.status}`);
        }

        const data = (await response.json()) as ThreadResponse;
        if (disposed) {
          return;
        }
        setThread(data.thread || null);
        hasLoadedOnceRef.current = true;
        consecutiveFailuresRef.current = 0;
        nextRequestAtRef.current = 0;
        setError(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        if (disposed) {
          return;
        }

        consecutiveFailuresRef.current += 1;
        const backoffMs = Math.min(
          refreshMs * 2 ** (consecutiveFailuresRef.current - 1),
          MAX_BACKOFF_MS,
        );
        nextRequestAtRef.current = Date.now() + backoffMs;

        const message = (err as Error).message || "Could not load comments.";
        if (!hasLoadedOnceRef.current) {
          setError(message);
        } else {
          setError(
            `Live update failed (${message}). Retrying in ${Math.ceil(backoffMs / 1000)}s.`,
          );
        }
      } finally {
        if (!disposed && shouldShowLoading) {
          setLoading(false);
        }
        isFetching = false;
        currentController = null;
      }
    }

    fetchThread();

    if (refreshMs > 0) {
      intervalId = setInterval(() => {
        if (pauseWhenHidden && document.visibilityState !== "visible") {
          return;
        }
        fetchThread();
      }, refreshMs);
    }

    function onVisibilityChange() {
      if (!pauseWhenHidden || document.visibilityState !== "visible") {
        return;
      }
      fetchThread();
    }

    if (pauseWhenHidden) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      disposed = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (pauseWhenHidden) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      currentController?.abort();
    };
  }, [apiBase, pauseWhenHidden, refreshMs, uri]);

  const rootPost = thread?.post;
  const replies = thread?.replies || [];

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

      {rootPost && (
        <p style={{ marginTop: 0, marginBottom: "1rem" }}>
          Join the conversation on{" "}
          <a
            href={postHref(rootPost)}
            rel="noopener noreferrer"
            target="_blank"
          >
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

      {!loading && !error && replies.length === 0 && (
        <p>No replies yet. Be the first one on Bluesky.</p>
      )}

      {!loading &&
        replies.map((reply, index) => (
          <BlueskyReply
            depth={0}
            key={reply.post?.uri || `root-${index}`}
            maxDepth={maxDepth}
            thread={reply}
          />
        ))}
    </section>
  );
}
