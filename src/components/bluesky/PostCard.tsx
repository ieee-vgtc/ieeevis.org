/**
 * One post: author, text, attachments, and a footer of counts.
 *
 * The author's name and handle only link out to bsky.app for posts made from a
 * real account — guest comments all share one bridge account, so their
 * pseudonym must not lead to that profile. The timestamp links to the post
 * itself whenever it has a real URI, which a just-submitted comment does not
 * yet have.
 */

import type { CSSProperties } from "react";
import Avatar from "./Avatar";
import { EmbedCard, EmbedImages } from "./Embeds";
import {
  displayPost,
  formatRelativeTime,
  likeCountOf,
  postUrl,
  profileUrl,
} from "./format";
import type { ShapedPost } from "./types";

/**
 * Everything the per-post 🍩 like control needs, lifted to the discussion so
 * the root and every reply read and update one shared like state.
 *
 *  - `likedUris` — the posts the reader has liked, updated optimistically.
 *  - `deltas` — transient count adjustments applied on top of the server total
 *    while an optimistic toggle is in flight; cleared when fresh data arrives.
 *  - `canLike` — whether this reader may toggle likes at all (a service thread,
 *    a valid token, and no linked Bluesky account of their own).
 *  - `onToggle` — like/unlike the given post URI.
 */
export interface PostLikeContext {
  canLike: boolean;
  likedUris: Set<string>;
  deltas: Map<string, number>;
  onToggle: (postUri: string) => void;
}

interface PostCardProps {
  post: ShapedPost;
  /** "root" is the post a thread hangs off; "reply" is everything below it. */
  variant?: "root" | "reply";
  like?: PostLikeContext;
  /**
   * Drop the card's own border, corners and background so it can sit inside
   * another bordered container (e.g. the announcement + Bluesky-callout box).
   */
  bare?: boolean;
}

const linkStyle = { color: "inherit", textDecoration: "none" } as const;

/** The donut chip's shared shape; the button and the read-only count share it. */
const likeChipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.25rem 0.7rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  fontSize: "0.82rem",
};

/**
 * The 🍩 like control for one post.
 *
 * The announcement root shows its Bluesky like count read-only — guests like
 * the discussion's replies, not the announcement itself. Every reply, whether a
 * guest comment or a native Bluesky reply, is an interactive donut once it is a
 * real post and the reader may post; otherwise (a read-only viewer, a reader on
 * Bluesky already, or a not-yet-read-back comment) it is a matching read-only
 * chip, so the icon and count stay consistent without a control that does
 * nothing.
 */
function LikeControl({
  post,
  isRoot,
  like,
}: {
  post: ShapedPost;
  isRoot: boolean;
  like?: PostLikeContext;
}) {
  if (isRoot) {
    // Bluesky's own like count for the announcement, read-only; we do not offer
    // guest likes here and never sort by them.
    return (
      <span
        aria-label={`${post.likeCount} likes on Bluesky`}
        style={{
          ...likeChipStyle,
          backgroundColor: "transparent",
          color: "#6b7280",
        }}
        title="Likes on Bluesky"
      >
        🍩 {post.likeCount}
      </span>
    );
  }

  // A just-posted comment not yet read back has a placeholder URI, so there is
  // nothing real to like yet.
  const isRealPost = post.uri.startsWith("at://");
  const liked = like?.likedUris.has(post.uri) ?? false;
  const count = likeCountOf(post) + (like?.deltas.get(post.uri) ?? 0);
  const interactive = Boolean(like?.canLike) && isRealPost;

  if (interactive) {
    return (
      <button
        aria-label={`${liked ? "Unlike" : "Like"} this reply (${count})`}
        aria-pressed={liked}
        onClick={() => like?.onToggle(post.uri)}
        style={{
          ...likeChipStyle,
          backgroundColor: liked ? "#eff6ff" : "#fff",
          color: liked ? "#2563eb" : "inherit",
          cursor: "pointer",
        }}
        title={liked ? "Unlike" : "Like"}
        type="button"
      >
        🍩 {count}
      </button>
    );
  }

  return (
    <span
      aria-label={`${count} likes`}
      style={{
        ...likeChipStyle,
        backgroundColor: liked ? "#eff6ff" : "transparent",
        color: liked ? "#2563eb" : "#6b7280",
      }}
      title="Likes"
    >
      🍩 {count}
    </span>
  );
}

export default function PostCard({
  post,
  variant = "reply",
  like,
  bare = false,
}: PostCardProps) {
  const isRoot = variant === "root";
  const { name, body } = displayPost(post);
  const profile = post.guest ? null : profileUrl(post.author);
  // Guest comments are real posts in the shared bridge repo, so their bsky.app
  // permalink is valid too; only a not-yet-read-back placeholder URI has none.
  const permalink = postUrl(post.uri);
  const time = formatRelativeTime(post.createdAt);
  const timeTitle = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : undefined;
  const reposts = post.repostCount || 0;

  return (
    <article
      style={{
        border: bare ? "none" : "1px solid #e5e7eb",
        borderRadius: bare ? 0 : "0.6rem",
        padding: isRoot ? "0.9rem" : "0.75rem",
        backgroundColor: bare ? "transparent" : isRoot ? "#f9fafb" : "#fff",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <Avatar size={isRoot ? 40 : 36} src={post.author?.avatar ?? null} />
        <div style={{ lineHeight: 1.2 }}>
          {profile ? (
            <a
              href={profile}
              rel="noopener noreferrer"
              style={{ ...linkStyle, fontWeight: 600 }}
              target="_blank"
            >
              {name}
            </a>
          ) : (
            <span style={{ fontWeight: 600 }}>{name}</span>
          )}
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            {post.guest
              ? "VIS attendee"
              : `@${post.author?.handle || post.author?.did || "unknown"}`}
            {time && " · "}
            {time && permalink ? (
              <a
                href={permalink}
                rel="noopener noreferrer"
                style={{ color: "#2563eb", textDecoration: "none" }}
                target="_blank"
                title={timeTitle}
              >
                {time}
              </a>
            ) : (
              <span title={timeTitle}>{time}</span>
            )}
          </div>
        </div>
      </header>

      <p
        style={{
          margin: isRoot ? "0.5rem 0" : "0.4rem 0",
          whiteSpace: "pre-wrap",
        }}
      >
        {body}
      </p>
      <EmbedImages images={post.embedImages} />
      <EmbedCard embed={post.embed} />

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.82rem",
          color: "#6b7280",
          marginTop: isRoot ? "0.6rem" : "0.5rem",
        }}
      >
        <LikeControl isRoot={isRoot} like={like} post={post} />
        {!isRoot && reposts > 0 && (
          <span>
            {reposts} {reposts === 1 ? "repost" : "reposts"}
          </span>
        )}
      </footer>
    </article>
  );
}
