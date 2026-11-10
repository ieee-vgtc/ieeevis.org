import type { ProgramTimeSlot } from "../types/program";

/** The paper_type, or a word in the slot_id, that marks an invited talk — the
 *  keynote, the capstone, a VISions talk. Mirrors INVITED_TALKS in
 *  conferentech's announce bot, which checks paper_type first. */
const INVITED_TALK_WORDS = ["keynote", "capstone", "visions"];

/**
 * Whether this slot's Bluesky discussion belongs on the session page.
 *
 * A paper talk has a paper page, and that is where its discussion lives. The
 * slots left over are the ones the announce bot posts about but the site builds
 * no page for: panels and invited talks.
 *
 * Deciding it here rather than asking the service about every slot keeps the
 * opening remarks, the awards and the breaks from polling an endpoint that will
 * only ever answer "unknown" for them. A slot that slips through anyway costs
 * nothing: the embed renders nothing for an id the service does not know.
 */
export function hasOwnDiscussion(slot: ProgramTimeSlot): boolean {
  if (slot.uid) return false; // its discussion is on the paper page
  const slotId = slot.slot_id?.toLowerCase() ?? "";
  const paperType = slot.paper_type?.trim().toLowerCase() ?? "";
  return (
    paperType === "panel" ||
    INVITED_TALK_WORDS.some(
      (word) => paperType === word || slotId.includes(word),
    )
  );
}

/** Mirrors SESSION_DISCUSSIONS in conferentech's
 *  `supabase/functions/_shared/conference.ts`. Keep the two lists in step.
 *  `threads` maps a plenary session's page id to the thread it uses: the parts
 *  of the Practitioner Summit share the thread of part 1. */
const SESSION_DISCUSSIONS: {
  eventTypes: string[];
  threads: Record<string, string>;
} = {
  eventTypes: ["workshop", "tutorial", "meetup", "challenge"],
  threads: {
    "conf-conference1": "conf-conference1", // Practitioner Summit, part 1
    "conf-conference2": "conf-conference1", // Practitioner Summit, part 2
    "conf-conference4": "conf-conference1", // Practitioner Summit, part 3
    "conf-townhall1": "conf-townhall1",
    "a-visap-conference11": "a-visap-conference11", // VISAP exhibition opening and keynote
  },
};

/**
 * The id of the session's Bluesky discussion as a whole, if it has one. The
 * announce bot posts once for such a session and not for the slots in it that
 * have no paper.
 */
export function sessionDiscussionId(
  eventType: string,
  sessionPageId: string,
): string | null {
  if (SESSION_DISCUSSIONS.threads[sessionPageId]) {
    return SESSION_DISCUSSIONS.threads[sessionPageId];
  }
  return SESSION_DISCUSSIONS.eventTypes.includes(eventType.trim().toLowerCase())
    ? sessionPageId
    : null;
}
