/**
 * Mirrors vis-bsky-bot's `_shared/conference.ts` and `bsky-api/lib/threads.ts`,
 * which drop the same replies server-side — change both together.
 *
 * The AppView does none of this for us: it returns labelled and
 * threadgate-hidden replies alike, and applies a labeler's labels only when we
 * ask for that labeler by DID.
 */

/** com.atproto.label.defs#label. A negated label (`neg`) has been retracted. */
export interface Label {
  val?: string;
  src?: string;
  neg?: boolean;
}

/** The default Bluesky Trust & Safety labeler, which stock clients trust too. */
export const MODERATION_LABELER_DID = "did:plc:ar7c4by46qjdydhdevvrndac";

/**
 * We read threads logged-out, so both the "!hide" takedown and the
 * "!no-unauthenticated" opt-out bind us.
 */
export const HIDE_LABELS: ReadonlySet<string> = new Set([
  "!hide",
  "!no-unauthenticated",
  "porn",
  "sexual",
  "nudity",
  "graphic-media",
  "spam",
  "hate",
]);

/** The post fields moderation reads; `normalize.ts`'s AppViewPost is a superset. */
export interface LabeledNode {
  post?: {
    uri?: string;
    labels?: Label[];
    author?: { labels?: Label[] };
  };
}

/** Only the root post carries one, listing the replies the OP hid. */
export interface ThreadgateView {
  record?: { hiddenReplies?: string[] };
}

export function hasHideLabel(labels: Label[] | undefined): boolean {
  if (!Array.isArray(labels)) {
    return false;
  }
  return labels.some(
    (label) => label?.neg !== true && HIDE_LABELS.has(label?.val ?? ""),
  );
}

/** Replies only — the announcement root is ours, and never filtered. */
export function shouldHide(
  node: LabeledNode,
  hiddenUris: ReadonlySet<string>,
): boolean {
  const post = node?.post;
  // A blocked or deleted node carries no post; that is the caller's to drop.
  if (!post) {
    return false;
  }
  if (post.uri && hiddenUris.has(post.uri)) {
    return true;
  }
  return hasHideLabel(post.labels) || hasHideLabel(post.author?.labels);
}

export function threadgateHiddenReplies(
  root: { post?: { threadgate?: ThreadgateView } } | undefined,
): string[] {
  const hidden = root?.post?.threadgate?.record?.hiddenReplies;
  return Array.isArray(hidden)
    ? hidden.filter((uri): uri is string => typeof uri === "string")
    : [];
}
