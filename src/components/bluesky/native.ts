/**
 * Writes from a reader's own Bluesky account, straight to their PDS.
 *
 * These are the counterparts of the guest writes in `service.ts`: a reply to
 * the announcement and a like. Not a removal: deleting posts would widen the
 * permission the login asks for, and a reader can delete their own reply on
 * Bluesky. Nothing here touches the discussion service; the reader's PDS
 * answers, and the thread picks the change up on its next poll. `@atproto/api` is imported on demand
 * for the same reason as the OAuth client (see `oauth.ts`).
 *
 * A like is a record in the reader's repository, so unliking needs the
 * record's URI. The writer keeps those, and which posts it has already asked
 * Bluesky about, so the discussion only holds the set of liked posts.
 */

import type { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-browser";
import { restoreSession } from "./oauth";

export interface BlueskyProfile {
  did: string;
  handle: string;
  displayName: string | null;
  avatar: string | null;
}

/** A post by URI and content hash, which is what a reply or a like refers to. */
export interface PostRef {
  uri: string;
  cid: string;
}

export interface NativeWriter {
  profile: BlueskyProfile;
  /** Reply to the announcement itself; the composer takes no parent. */
  reply(root: PostRef, text: string): Promise<PostRef>;
  setLike(post: PostRef, liked: boolean): Promise<void>;
  /**
   * Which of the given posts this account has liked. Bluesky is asked once
   * per set of posts; a like toggled here is recorded without asking again.
   */
  syncLikes(postUris: string[]): Promise<Set<string>>;
}

/** Bluesky's own limit on a post; native replies carry no name prefix. */
export const NATIVE_TEXT_LIMIT = 300;

/** `app.bsky.feed.getPosts` takes at most this many URIs per call. */
const GET_POSTS_BATCH = 25;

/**
 * The AppView reports what the account has liked as viewer state when the
 * request is authenticated, so this reads the posts back rather than the
 * account's like feed. Returns post URI → like record URI.
 */
async function fetchLikeRecords(
  agent: Agent,
  postUris: string[],
): Promise<Map<string, string>> {
  const batches = [];
  for (let start = 0; start < postUris.length; start += GET_POSTS_BATCH) {
    batches.push(
      agent.getPosts({ uris: postUris.slice(start, start + GET_POSTS_BATCH) }),
    );
  }
  const likes = new Map<string, string>();
  for (const { data } of await Promise.all(batches)) {
    for (const post of data.posts) {
      if (post.viewer?.like) {
        likes.set(post.uri, post.viewer.like);
      }
    }
  }
  return likes;
}

function createWriter(agent: Agent, profile: BlueskyProfile): NativeWriter {
  const likeRecords = new Map<string, string>();
  const syncedKeys = new Set<string>();

  return {
    profile,

    async reply(root, text) {
      const { RichText } = await import("@atproto/api");
      const richText = new RichText({ text });
      await richText.detectFacets(agent);
      return agent.post({
        text: richText.text,
        facets: richText.facets,
        reply: { root, parent: root },
        createdAt: new Date().toISOString(),
      });
    },

    async setLike(post, liked) {
      if (liked) {
        const { uri } = await agent.like(post.uri, post.cid);
        likeRecords.set(post.uri, uri);
        return;
      }
      // A like made on Bluesky itself, or before the last read, has no
      // record here yet.
      const likeUri =
        likeRecords.get(post.uri) ??
        (await fetchLikeRecords(agent, [post.uri])).get(post.uri);
      if (likeUri) {
        await agent.deleteLike(likeUri);
      }
      likeRecords.delete(post.uri);
    },

    async syncLikes(postUris) {
      const key = [...postUris].sort().join("\n");
      if (!syncedKeys.has(key)) {
        const records = await fetchLikeRecords(agent, postUris);
        for (const uri of postUris) {
          likeRecords.delete(uri);
        }
        for (const [uri, likeUri] of records) {
          likeRecords.set(uri, likeUri);
        }
        syncedKeys.add(key);
      }
      return new Set(postUris.filter((uri) => likeRecords.has(uri)));
    },
  };
}

let writerPromise: Promise<NativeWriter | null> | null = null;

/**
 * The writer for the stored session, or null when there is none. Shared by
 * every discussion on the page: one agent, one profile read. Never reset: a
 * sign-out ends the session, and a new login arrives on a fresh page.
 */
export function restoreWriter(): Promise<NativeWriter | null> {
  writerPromise ??= (async () => {
    const session = await restoreSession();
    return session ? createWriterForSession(session) : null;
  })();
  return writerPromise;
}

async function createWriterForSession(
  session: OAuthSession,
): Promise<NativeWriter> {
  const { Agent } = await import("@atproto/api");
  const agent = new Agent(session);
  const { data } = await agent.getProfile({ actor: session.did });
  return createWriter(agent, {
    did: data.did,
    handle: data.handle,
    displayName: data.displayName || null,
    avatar: data.avatar || null,
  });
}
