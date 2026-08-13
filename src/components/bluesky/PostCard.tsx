/**
 * One post: author, text, attachments, and a footer of counts.
 *
 * The author's name and handle only link out to bsky.app for posts made from a
 * real account — guest comments all share one bridge account, so their
 * pseudonym must not lead to that profile. The timestamp links to the post
 * itself whenever it has a real URI, which a just-submitted comment does not
 * yet have.
 */

import type { ReactNode } from "react";
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

interface PostCardProps {
  post: ShapedPost;
  /** "root" is the post a thread hangs off; "reply" is everything below it. */
  variant?: "root" | "reply";
  /** Replaces the default counts, e.g. with a like button on the root post. */
  footer?: ReactNode;
}

const linkStyle = { color: "inherit", textDecoration: "none" } as const;

export default function PostCard({
  post,
  variant = "reply",
  footer,
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
  const likes = likeCountOf(post);
  const reposts = post.repostCount || 0;

  return (
    <article
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.6rem",
        padding: isRoot ? "0.9rem" : "0.75rem",
        backgroundColor: isRoot ? "#f9fafb" : "#fff",
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
        {footer ?? (
          <span>
            {likes} {likes === 1 ? "like" : "likes"}
            {reposts > 0 &&
              ` · ${reposts} ${reposts === 1 ? "repost" : "reposts"}`}
          </span>
        )}
      </footer>
    </article>
  );
}
