import type { ProgramTimeSlot } from "../types/program";

/** Slot_id words that mark an invited talk — the keynote, the capstone, a
 *  VISions talk. Mirrors INVITED_TALKS in conferentech's announce bot. */
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
  return (
    slot.paper_type?.toLowerCase() === "panel" ||
    INVITED_TALK_WORDS.some((word) => slotId.includes(word))
  );
}
