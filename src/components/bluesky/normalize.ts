/**
 * Turns either source's payload into the shaped thread of `types.ts`.
 *
 * The AppView side reshapes `app.bsky.feed.getPostThread` (only the parts the
 * cards render — text, images, link cards, quotes, counts); the service side
 * only fills in defaults, since it shapes the thread already. Both are
 * defensive: a field that is missing or the wrong type must degrade to an empty
 * rendering, never throw, because a live poll would then keep failing.
 */

import { postUrl } from "./format";
import type { Label, ThreadgateView } from "./moderation";
import { shouldHide, threadgateHiddenReplies } from "./moderation";
import type {
  EmbedImage,
  PostEmbed,
  RootPost,
  ShapedAuthor,
  ShapedPost,
  ThreadResponse,
} from "./types";

// ─── app.bsky.feed.getPostThread ─────────────────────────────────────────────

interface AppViewAuthor {
  did?: string;
  handle?: string;
  displayName?: string;
  avatar?: string;
  labels?: Label[];
}

interface AppViewEmbed {
  $type?: string;
  images?: Array<{ thumb?: string; fullsize?: string; alt?: string }>;
  external?: {
    uri?: string;
    title?: string;
    description?: string;
    thumb?: string;
  };
  record?: {
    uri?: string;
    author?: AppViewAuthor;
    value?: { text?: string };
  };
  media?: AppViewEmbed;
}

interface AppViewPost {
  uri?: string;
  cid?: string;
  indexedAt?: string;
  author?: AppViewAuthor;
  record?: { text?: string; createdAt?: string };
  embed?: AppViewEmbed;
  likeCount?: number;
  repostCount?: number;
  labels?: Label[];
  threadgate?: ThreadgateView;
}

/** A node of the thread tree. Blocked and deleted posts arrive without `post`. */
interface AppViewThread {
  post?: AppViewPost;
  replies?: AppViewThread[];
}

function normalizeAuthor(author?: AppViewAuthor): ShapedAuthor {
  return {
    did: author?.did,
    handle: author?.handle,
    displayName: author?.displayName || null,
    avatar: author?.avatar || null,
  };
}

function normalizeImages(embed?: AppViewEmbed): EmbedImage[] {
  const images =
    embed?.$type === "app.bsky.embed.images#view"
      ? embed.images
      : embed?.$type === "app.bsky.embed.recordWithMedia#view"
        ? embed.media?.images
        : undefined;

  return (images || [])
    .map((image) => ({
      thumb: image.thumb || image.fullsize || "",
      fullsize: image.fullsize || image.thumb || "",
      alt: image.alt || "",
    }))
    .filter((image) => image.thumb);
}

function normalizeEmbed(embed?: AppViewEmbed): PostEmbed | null {
  if (embed?.$type === "app.bsky.embed.external#view" && embed.external?.uri) {
    return {
      kind: "external",
      uri: embed.external.uri,
      title: embed.external.title || embed.external.uri,
      description: embed.external.description || "",
      thumb: embed.external.thumb || null,
    };
  }

  const quote =
    embed?.$type === "app.bsky.embed.record#view" ||
    embed?.$type === "app.bsky.embed.recordWithMedia#view"
      ? embed.record
      : undefined;

  if (quote?.uri) {
    return {
      kind: "record",
      uri: quote.uri,
      author: quote.author?.handle || quote.author?.did || "unknown",
      text: quote.value?.text || "",
    };
  }

  return null;
}

function normalizeNode(
  node: AppViewThread,
  hiddenUris: ReadonlySet<string>,
): ShapedPost | null {
  const post = node?.post;
  if (!post?.uri) {
    return null;
  }

  return {
    uri: post.uri,
    cid: post.cid,
    author: normalizeAuthor(post.author),
    text: post.record?.text || "",
    guest: false,
    pseudonym: null,
    likeCount: post.likeCount || 0,
    // The AppView has no guest likes, so the total is the post's own count.
    guestLikeCount: 0,
    totalLikeCount: post.likeCount || 0,
    repostCount: post.repostCount || 0,
    createdAt: post.record?.createdAt || post.indexedAt || null,
    embedImages: normalizeImages(post.embed),
    embed: normalizeEmbed(post.embed),
    replies: normalizeNodes(node.replies, hiddenUris),
  };
}

/** Filtering before the recursion is what takes a hidden reply's subtree with it. */
function normalizeNodes(
  nodes: AppViewThread[] | undefined,
  hiddenUris: ReadonlySet<string>,
): ShapedPost[] {
  if (!Array.isArray(nodes)) {
    return [];
  }
  return nodes
    .filter((node) => !shouldHide(node, hiddenUris))
    .map((node) => normalizeNode(node, hiddenUris))
    .filter((post): post is ShapedPost => post !== null);
}

/**
 * The AppView knows nothing about guests, so the merged like counts collapse to
 * the post's own: `totalLikeCount` is what the reader sees either way.
 *
 * The root is never filtered — it is our announcement, and dropping it would
 * blank the discussion.
 */
export function normalizeAppViewThread(payload: unknown): ThreadResponse {
  const thread = (payload as { thread?: AppViewThread } | null)?.thread;
  const hiddenUris = new Set(threadgateHiddenReplies(thread));
  const root = thread ? normalizeNode(thread, hiddenUris) : null;

  if (!root) {
    return { state: "unavailable" };
  }

  const post: RootPost = {
    ...root,
    bskyUrl: postUrl(root.uri) || "https://bsky.app",
  };

  return { state: "open", post };
}

// ─── discussion service ──────────────────────────────────────────────────────

function withDefaults(post: ShapedPost): ShapedPost {
  return {
    ...post,
    author: post.author || { displayName: null, avatar: null },
    text: post.text || "",
    guest: Boolean(post.guest),
    pseudonym: post.pseudonym ?? null,
    likeCount: post.likeCount || 0,
    guestLikeCount: post.guestLikeCount || 0,
    totalLikeCount: post.totalLikeCount ?? post.likeCount ?? 0,
    createdAt: post.createdAt ?? null,
    embedImages: Array.isArray(post.embedImages) ? post.embedImages : [],
    embed: post.embed ?? null,
    replies: Array.isArray(post.replies) ? post.replies.map(withDefaults) : [],
  };
}

/** Passthrough with defaults; an unrecognized `state` counts as no thread. */
export function normalizeServiceThread(
  payload: unknown,
  paperId: string,
): ThreadResponse {
  const data = payload as Partial<ThreadResponse> | null;

  if (data?.state === "not_open") {
    return { state: "not_open", paperId, opensAt: data.opensAt ?? null };
  }

  if (data?.state === "open") {
    const post = (data as { post?: RootPost }).post;
    return {
      state: "open",
      paperId,
      post: post?.uri
        ? {
            ...withDefaults(post),
            bskyUrl: post.bskyUrl || postUrl(post.uri) || "https://bsky.app",
          }
        : undefined,
    };
  }

  return { state: "unavailable", paperId };
}
