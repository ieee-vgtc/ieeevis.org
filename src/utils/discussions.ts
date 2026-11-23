import { readFile } from "node:fs/promises";
import type { ProgramTimeSlot } from "../types/program";

/** A posted row of the `bsky_threads` table. */
interface BskyThread {
  slot_id: string;
  paper_uuid: string | null;
  post_uri: string;
}

/** Sessions without a thread of their own that use another session's thread:
 *  the later parts of the Practitioner Summit share the thread of part 1.
 *  Mirrors SESSION_DISCUSSIONS in conferentech's
 *  `supabase/functions/_shared/conference.ts`. */
const SHARED_SESSION_THREADS: Record<string, string> = {
  "conf-conference2": "conf-conference1",
  "conf-conference4": "conf-conference1",
};

// Program data is downloaded separately and may be absent in preview/PR builds.
async function readThreads(): Promise<BskyThread[]> {
  try {
    const data: unknown = JSON.parse(
      await readFile("./src/data/program/bsky_thread_list.json", "utf8"),
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Error reading Bluesky thread data:", error);
    }
    return [];
  }
}

const postsBySlotId = new Map<string, string>();
const postsByPaperId = new Map<string, string>();
for (const thread of await readThreads()) {
  if (!thread.post_uri) continue;
  postsBySlotId.set(thread.slot_id, thread.post_uri);
  if (thread.paper_uuid) postsByPaperId.set(thread.paper_uuid, thread.post_uri);
}

/** The `at://` URI of the paper's Bluesky discussion post, if it has one. */
export function paperDiscussionUri(paperId: string): string | undefined {
  return postsByPaperId.get(paperId);
}

/**
 * The page id of the session whose thread discusses this session as a whole,
 * if there is one. Workshops, tutorials and other session-level events have
 * such a thread; it is keyed by the session page id.
 */
export function sessionDiscussionPageId(
  sessionPageId: string,
): string | undefined {
  const threadPageId = SHARED_SESSION_THREADS[sessionPageId] ?? sessionPageId;
  return postsBySlotId.has(threadPageId) ? threadPageId : undefined;
}

/**
 * The `at://` URI of the Bluesky discussion on a session page: the thread of
 * the session as a whole, or else the thread of a slot without a paper page,
 * such as a panel or an invited talk. A paper's thread is on its paper page.
 */
export function sessionDiscussionUri(
  sessionPageId: string,
  slots: ProgramTimeSlot[],
): string | undefined {
  const threadPageId = sessionDiscussionPageId(sessionPageId);
  if (threadPageId) return postsBySlotId.get(threadPageId);
  return slots
    .filter((slot) => !slot.uid && slot.slot_id)
    .map((slot) => postsBySlotId.get(slot.slot_id))
    .find(Boolean);
}
