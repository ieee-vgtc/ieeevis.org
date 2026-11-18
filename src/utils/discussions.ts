import discussions from "../data/bsky_discussions.json";

/** Sessions without a post of their own that use another session's thread:
 *  the later parts of the Practitioner Summit share the thread of part 1. */
const SHARED_SESSION_THREADS: Record<string, string> = {
  "conf-conference2": "conf-conference1",
  "conf-conference4": "conf-conference1",
};

const paperPosts: Record<string, string> = discussions.content;
const sessionPosts: Record<string, string> = discussions.session;

/** The `at://` URI of the paper's Bluesky discussion post, if it has one. */
export function paperDiscussionUri(paperId: string): string | undefined {
  return paperPosts[paperId];
}

/** The session page whose discussion this session uses, if there is one. */
export function sessionDiscussionPageId(
  sessionPageId: string,
): string | undefined {
  const threadPageId = SHARED_SESSION_THREADS[sessionPageId] ?? sessionPageId;
  return sessionPosts[threadPageId] ? threadPageId : undefined;
}

/** The `at://` URI of the session's Bluesky discussion post, if it has one. */
export function sessionDiscussionUri(
  sessionPageId: string,
): string | undefined {
  const threadPageId = sessionDiscussionPageId(sessionPageId);
  return threadPageId && sessionPosts[threadPageId];
}
