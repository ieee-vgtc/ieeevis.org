/** Presentation helpers for the shaped thread: dates, bsky.app links, and who
 *  to credit for a post. */

import type { RootPost, ShapedAuthor, ShapedPost } from "./types";

export function formatRelativeTime(dateString?: string | null): string {
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

/** "Sat, Nov 10, 09:00 EST" in the reader's own timezone. */
export function formatOpensAt(opensAt?: string | null): string {
  if (!opensAt) {
    return "";
  }

  const date = new Date(opensAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function profileUrl(author?: ShapedAuthor): string | null {
  const id = author?.handle || author?.did;
  return id ? `https://bsky.app/profile/${id}` : null;
}

/**
 * The bsky.app permalink for an `at://did/app.bsky.feed.post/rkey` URI. Null
 * for anything else, which includes the placeholder URIs of comments that have
 * been posted but not yet read back from the service.
 */
export function postUrl(uri?: string): string | null {
  const parts = (uri || "").split("/");
  const did = parts[2];
  const rkey = parts[4];
  if (!uri?.startsWith("at://") || !did || !rkey) {
    return null;
  }
  return `https://bsky.app/profile/${did}/post/${rkey}`;
}

/**
 * Who to credit. Guest replies all live in one Bluesky account, so their
 * attribution is baked into the post text as "💬 Ada Lovelace: …" — that is what
 * readers on Bluesky itself see — and is stripped here so it is not shown twice.
 * Replies whose author hid their name also carry `pseudonym`, which the service
 * reads from our authorship log rather than by parsing text; prefer it when it
 * is there.
 */
export function displayPost(post: ShapedPost): { name: string; body: string } {
  const text = post.text || "";

  if (post.guest) {
    const match = /^💬\s*([^:]{1,80}):\s*/.exec(text);
    return {
      name: post.pseudonym || match?.[1]?.trim() || "VIS attendee",
      body: match ? text.slice(match[0].length) : text,
    };
  }

  return {
    name: post.author?.displayName || post.author?.handle || "Unknown",
    body: text,
  };
}

/** Replies carry a plain `likeCount`; only the root has merged totals. */
export function likeCountOf(post: ShapedPost | RootPost): number {
  return "totalLikeCount" in post ? post.totalLikeCount : post.likeCount || 0;
}
