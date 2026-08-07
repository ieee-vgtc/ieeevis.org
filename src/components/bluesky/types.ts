/**
 * The one thread shape the Bluesky components render, whichever source it came
 * from: the conference discussion service (already shaped server-side, see its
 * `/openapi.json` — keep these types in step with it) or the public Bluesky
 * AppView (shaped client-side by `normalize.ts`).
 *
 * Fields the AppView has no notion of — `guest`, `pseudonym`, `guestLikeCount`
 * — are false/null/0 there. Fields the service does not send — `embed`,
 * `repostCount` — are null/undefined in that direction. Everything else is
 * present from both.
 */

export interface ShapedAuthor {
  did?: string;
  handle?: string;
  displayName: string | null;
  avatar: string | null;
}

export interface EmbedImage {
  thumb: string;
  fullsize: string;
  alt: string;
}

/** A link card or a quoted post. Only the AppView source produces these. */
export type PostEmbed =
  | {
      kind: "external";
      uri: string;
      title: string;
      description: string;
      thumb: string | null;
    }
  | { kind: "record"; uri: string; author: string; text: string };

/** One post in the thread. Replies nest here — there is no top-level list. */
export interface ShapedPost {
  uri: string;
  cid?: string;
  author: ShapedAuthor;
  text: string;
  /** True when the post came through the guest bridge, from our authorship log. */
  guest: boolean;
  pseudonym: string | null;
  likeCount: number;
  repostCount?: number;
  createdAt: string | null;
  embedImages: EmbedImage[];
  embed?: PostEmbed | null;
  replies: ShapedPost[];
}

/** The root announcement post carries the merged counts and the Bluesky link. */
export type RootPost = ShapedPost & {
  guestLikeCount: number;
  totalLikeCount: number;
  bskyUrl: string;
};

/**
 * "not_open" is a service-only state: it knows a paper's discussion is
 * scheduled but not yet announced. A thread read straight from Bluesky is
 * either there ("open") or not ("unavailable").
 */
export type ThreadResponse =
  | { state: "open"; paperId?: string; post?: RootPost }
  | { state: "not_open"; paperId?: string; opensAt?: string | null }
  | { state: "unavailable"; paperId?: string };

/** Where a thread was read from. Guest writes need the service. */
export type ThreadSource = "service" | "direct";

export type ReplySort = "top" | "newest";
