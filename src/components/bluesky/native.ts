/**
 * Writes from a reader's own Bluesky account, straight to their PDS.
 *
 * These are the counterparts of the guest writes in `service.ts`: a reply to
 * the announcement, a like, taking one of their own posts down. Nothing here
 * touches the discussion service; the reader's PDS answers, and the thread
 * picks the change up on its next poll. `@atproto/api` is imported on demand
 * for the same reason as the OAuth client (see `oauth.ts`).
 */

import type { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-browser";

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

/** Bluesky's own limit on a post; native replies carry no name prefix. */
export const NATIVE_TEXT_LIMIT = 300;

/** `app.bsky.feed.getPosts` takes at most this many URIs per call. */
const GET_POSTS_BATCH = 25;

export async function createAgent(session: OAuthSession): Promise<Agent> {
  const { Agent } = await import("@atproto/api");
  return new Agent(session);
}

export async function fetchProfile(
  agent: Agent,
  did: string,
): Promise<BlueskyProfile> {
  const { data } = await agent.getProfile({ actor: did });
  return {
    did: data.did,
    handle: data.handle,
    displayName: data.displayName || null,
    avatar: data.avatar || null,
  };
}

/** Reply to the announcement itself; the composer takes no parent. */
export async function postReply(
  agent: Agent,
  root: PostRef,
  text: string,
): Promise<PostRef> {
  const { RichText } = await import("@atproto/api");
  const richText = new RichText({ text });
  await richText.detectFacets(agent);
  return agent.post({
    text: richText.text,
    facets: richText.facets,
    reply: { root, parent: root },
    createdAt: new Date().toISOString(),
  });
}

export function deletePost(agent: Agent, postUri: string): Promise<void> {
  return agent.deletePost(postUri);
}

/** Returns the URI of the like record, which is what unliking needs. */
export async function likePost(agent: Agent, post: PostRef): Promise<string> {
  const { uri } = await agent.like(post.uri, post.cid);
  return uri;
}

export function unlikePost(agent: Agent, likeUri: string): Promise<void> {
  return agent.deleteLike(likeUri);
}

/**
 * Which of the given posts this account has liked, as post URI → like URI.
 * The AppView reports it as viewer state when the request is authenticated,
 * so this reads the posts back rather than the account's like feed.
 */
export async function fetchMyLikes(
  agent: Agent,
  postUris: string[],
): Promise<Map<string, string>> {
  const likes = new Map<string, string>();
  for (let start = 0; start < postUris.length; start += GET_POSTS_BATCH) {
    const uris = postUris.slice(start, start + GET_POSTS_BATCH);
    const { data } = await agent.getPosts({ uris });
    for (const post of data.posts) {
      if (post.viewer?.like) {
        likes.set(post.uri, post.viewer.like);
      }
    }
  }
  return likes;
}
