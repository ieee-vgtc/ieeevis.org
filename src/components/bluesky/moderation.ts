/**
 * What we drop from a thread read straight from the public Bluesky AppView.
 *
 * Anyone on Bluesky can reply under a conference announcement and so land on a
 * paper page. The discussion service already filters those replies out before it
 * answers; the AppView filters nothing — it hands back moderated and
 * threadgate-hidden replies alike and expects the client to do the work. So the
 * direct source has to apply the same rules here.
 *
 * This MIRRORS the service: vis-bsky-bot's `_shared/conference.ts` and
 * `bsky-api/lib/threads.ts`. The names are deliberately identical so the two
 * sides stay easy to diff — keep them in step, and change both together.
 */

/** A single label as a post view carries it (com.atproto.label.defs#label). */
export interface Label {
  val?: string;
  src?: string;
  /** A negation retracting a previously applied label — ignore it. */
  neg?: boolean;
}

/**
 * The default Bluesky Trust & Safety labeler. Its DID goes in the
 * `atproto-accept-labelers` header on getPostThread so its labels (spam, hate,
 * the adult-content set, …) are actually applied to the post views we read —
 * without opting in, the AppView attaches only self-labels. This is the same
 * labeler every stock Bluesky client trusts by default.
 */
export const MODERATION_LABELER_DID = "did:plc:ar7c4by46qjdydhdevvrndac";

/**
 * Label values that cause us to drop a reply (and its whole subtree) from a
 * rendered thread. A label counts only when it is not negated (`neg !== true`).
 *
 *   - "!hide" / "!no-unauthenticated": global takedown / logged-out opt-out. We
 *     read the thread logged-out, so "!no-unauthenticated" opt-outs bind us.
 *   - "porn" / "sexual" / "nudity" / "graphic-media": the global adult-content
 *     set — never appropriate on a conference page.
 *   - "spam" / "hate": from the default T&S labeler above.
 *
 * The announcement ROOT is always kept regardless of labels — it is ours. Only
 * replies are filtered.
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

/** The root post's threadgate view — the only place hidden replies are listed. */
export interface ThreadgateView {
  record?: { hiddenReplies?: string[] };
}

/** A node whose root post may carry a threadgate. */
interface GatedNode {
  post?: { threadgate?: ThreadgateView };
}

/** Whether any non-negated label on this list is in HIDE_LABELS. */
export function hasHideLabel(labels: Label[] | undefined): boolean {
  if (!Array.isArray(labels)) {
    return false;
  }
  return labels.some(
    (label) => label?.neg !== true && HIDE_LABELS.has(label?.val ?? ""),
  );
}

/**
 * Whether a reply must be dropped from the rendered thread — and with it its
 * whole subtree, since the caller never recurses into a hidden node. A reply is
 * hidden when either moderation source says so:
 *
 *   1. LABELER LABELS — a hide-worthy label on the post OR its author.
 *   2. HIDDEN URIS — the OP's threadgate `hiddenReplies`, plus any denylist the
 *      caller passes in.
 *
 * Only ever called on replies. The root is normalized unconditionally (it is
 * ours) and is never passed here.
 */
export function shouldHide(
  node: LabeledNode,
  hiddenUris: ReadonlySet<string>,
): boolean {
  const post = node?.post;
  // Let the caller turn a blocked or deleted node (one without a post) into null
  // on its own terms; it is not a moderation decision.
  if (!post) {
    return false;
  }
  if (post.uri && hiddenUris.has(post.uri)) {
    return true;
  }
  return hasHideLabel(post.labels) || hasHideLabel(post.author?.labels);
}

/**
 * The at-uris an organizer marked "hide reply" on, read from the root post's
 * threadgate view (`app.bsky.feed.threadgate.hiddenReplies`). Empty when the OP
 * has no threadgate or has hidden nothing. Only the root post carries this, so
 * it is read once and then applies to every depth of the thread.
 */
export function threadgateHiddenReplies(node: GatedNode | undefined): string[] {
  const hidden = node?.post?.threadgate?.record?.hiddenReplies;
  return Array.isArray(hidden)
    ? hidden.filter((uri): uri is string => typeof uri === "string")
    : [];
}
