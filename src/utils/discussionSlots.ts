import type { ProgramSessionList, ProgramTimeSlot } from "../types/program";

/** The invited talks the announce bot posts about. Mirrors INVITED_TALKS in
 *  conferentech's `supabase/functions/_shared/conference.ts`: each word is both
 *  the `paper_type` the program import writes and the `slot_id` fallback. */
const INVITED_TALK_KINDS = ["keynote", "capstone", "visions"] as const;
export type InvitedTalkKind = (typeof INVITED_TALK_KINDS)[number];

function hasInvitedTalkType(slot: ProgramTimeSlot, kind: InvitedTalkKind) {
  return slot.paper_type?.trim().toLowerCase() === kind;
}

/**
 * Whether the slot may be this invited talk. The bot goes by `paper_type` and
 * reads `slot_id` only for a slot with no `paper_type` at all. This side cannot
 * tell those apart, because the site fills an empty `paper_type` with the
 * event's default, so it accepts either.
 */
function isInvitedTalk(slot: ProgramTimeSlot, kind: InvitedTalkKind) {
  return (
    hasInvitedTalkType(slot, kind) ||
    (slot.slot_id?.toLowerCase() ?? "").includes(kind)
  );
}

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
  return (
    slot.paper_type?.toLowerCase() === "panel" ||
    INVITED_TALK_KINDS.some((kind) => isInvitedTalk(slot, kind))
  );
}

/**
 * The slots whose announcements carry the discussions of an invited talk, for
 * the invited speaker pages. Unlike a session page, which shows a slot that
 * slipped through as nothing, these pages show every slot they get, so this
 * picks the ones the bot posts about:
 *
 *   - Slots whose `paper_type` names the talk win over slots that only spell
 *     it in their `slot_id`.
 *   - A talk with a paper (the VISions talks) is posted per paper.
 *   - A talk without one is posted once, from its lowest `slot_id`.
 */
export function invitedTalkSlots(
  sessionList: ProgramSessionList,
  kind: InvitedTalkKind,
): ProgramTimeSlot[] {
  const candidates = Object.values(sessionList)
    .flatMap((event) => event.sessions)
    .flatMap((session) => session.time_slots)
    .filter((slot) => isInvitedTalk(slot, kind));
  const typed = candidates.filter((slot) => hasInvitedTalkType(slot, kind));
  const slots = (typed.length > 0 ? typed : candidates)
    .slice()
    // Code-unit order, as the bot compares them: `conf-Capstone2` sorts
    // before `conf-capstone1`.
    .sort((a, b) =>
      a.slot_id < b.slot_id ? -1 : a.slot_id > b.slot_id ? 1 : 0,
    );

  const papers = slots.filter(
    (slot, index) =>
      slot.uid && slots.findIndex((other) => other.uid === slot.uid) === index,
  );
  const firstWithoutPaper = slots.find((slot) => !slot.uid);
  return firstWithoutPaper ? [...papers, firstWithoutPaper] : papers;
}

/** The id the discussion service knows a slot's thread by. */
export function discussionId(slot: ProgramTimeSlot): string {
  return slot.uid || slot.slot_id;
}
