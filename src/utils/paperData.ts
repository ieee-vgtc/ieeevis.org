import { features } from "../config/pages-allow-list";
import type { Paper } from "../types/paper";
import type {
  NullableString,
  ProgramEventDefinition,
  ProgramPerson,
  ProgramSession,
  ProgramSessionList,
  ProgramTimeSlot,
} from "../types/program";
import type { Poster } from "../types/poster";
import { readFile } from "fs/promises";

type SourceKey = keyof (typeof features)["weekOfVis"]["prodSource"];

/** Row of the `events` table. */
interface RawEvent {
  event_prefix: string;
  event: string;
  long_name: NullableString;
  event_type: string;
  event_description: NullableString;
  event_url: string;
  organizers: string[] | null;
  slot_type_default: NullableString;
}

/** Row of the `sessions2` table. */
interface RawSession {
  session_id: string;
  session_title: string;
  event_prefix: string;
  room_id: string;
  timeblock_id: string;
  session_chairs: string[] | null;
  session_youtube_url: NullableString;
  discord_url: NullableString;
  virtual: boolean;
}

/** Row of the `rooms` table. */
interface RawRoom {
  room_id: string;
  room_name: NullableString;
}

/** Row of the `timeblocks` table. */
interface RawTimeblock {
  time_id: string;
  start: string;
  end: string;
}

/** Row of the `slots` table. Times are minute offsets from the timeblock start. */
interface RawSlot {
  slot_id: string;
  session_id: string;
  paper_id: NullableString;
  title: string;
  contributors: string[] | null;
  presenters: string[] | null;
  paper_type: NullableString;
  offset_start: number | null;
  offset_end: number | null;
}

export const fetchAllPapers = async () => fetchAll<Paper>("paper");
export const fetchAllPosters = async () => fetchAll<Poster>("poster");

async function readSource(type: SourceKey): Promise<unknown> {
  if (!features.weekOfVis.enabled) {
    return [];
  }
  const folder =
    features.weekOfVis.sourceType === "prod"
      ? features.weekOfVis.prodSource
      : features.weekOfVis.localTestSources;
  try {
    const data = await readFile(`.${folder[type]}`, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(
      `Error reading local ${type} data from ${folder[type]}:`,
      error,
    );
    return [];
  }
}

export async function fetchAll<T>(type: SourceKey): Promise<T[]> {
  const data = await readSource(type);
  return Array.isArray(data) ? (data as T[]) : [];
}

export async function fetchAllSessions(): Promise<ProgramSessionList> {
  const sessions = await readSource("session");
  // The localTest sources are a snapshot of an already-merged program, keyed by
  // event prefix; the prod sources are the raw `sessions2` rows and need joining.
  if (!Array.isArray(sessions)) {
    return (sessions ?? {}) as ProgramSessionList;
  }
  const [events, rooms, timeblocks, slots, papers] = await Promise.all([
    fetchAll<RawEvent>("event"),
    fetchAll<RawRoom>("room"),
    fetchAll<RawTimeblock>("timeblock"),
    fetchAll<RawSlot>("slot"),
    fetchAll<Paper>("paper"),
  ]);
  return buildSessionList({
    events,
    sessions: sessions as RawSession[],
    rooms,
    timeblocks,
    slots,
    papers,
  });
}

const addMinutes = (iso: string, minutes: number) =>
  new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();

const byName = (name: string): ProgramPerson => ({ name, email: null });

function buildSessionList({
  events,
  sessions,
  rooms,
  timeblocks,
  slots,
  papers,
}: {
  events: RawEvent[];
  sessions: RawSession[];
  rooms: RawRoom[];
  timeblocks: RawTimeblock[];
  slots: RawSlot[];
  papers: Paper[];
}): ProgramSessionList {
  const roomsById = new Map(rooms.map((room) => [room.room_id, room]));
  const timeblocksById = new Map(
    timeblocks.map((timeblock) => [timeblock.time_id, timeblock]),
  );
  const papersById = new Map(papers.map((paper) => [paper.id, paper]));
  const slotsBySession = slots.reduce<Record<string, RawSlot[]>>(
    (acc, slot) => {
      (acc[slot.session_id] = acc[slot.session_id] || []).push(slot);
      return acc;
    },
    {},
  );

  const eventList: ProgramSessionList = {};
  const eventForPrefix = (prefix: string): ProgramEventDefinition => {
    if (!eventList[prefix]) {
      // Sessions can reference an event that is missing from the events table;
      // keep them in the program rather than dropping them on the floor.
      eventList[prefix] = {
        event: prefix,
        long_name: prefix,
        event_type: "other",
        event_prefix: prefix,
        event_description: "",
        event_url: "",
        organizers: [],
        sessions: [],
      };
    }
    return eventList[prefix];
  };

  events.forEach((event) => {
    eventList[event.event_prefix] = {
      event: event.event,
      long_name: event.long_name || event.event,
      event_type: event.event_type,
      event_prefix: event.event_prefix,
      event_description: event.event_description || "",
      event_url: event.event_url,
      organizers: event.organizers || [],
      sessions: [],
    };
  });

  const slotTypeDefaults = new Map(
    events.map((event) => [event.event_prefix, event.slot_type_default]),
  );

  sessions.forEach((session) => {
    const event = eventForPrefix(session.event_prefix);
    const timeblock = timeblocksById.get(session.timeblock_id);
    if (!timeblock) {
      console.warn(
        `Session ${session.session_id} references unknown timeblock ${session.timeblock_id}`,
      );
    }
    event.sessions.push({
      title: session.session_title,
      session_id: session.session_id,
      event_prefix: session.event_prefix,
      track: session.room_id,
      room_name: roomsById.get(session.room_id)?.room_name || session.room_id,
      chair: session.session_chairs || [],
      time_start: timeblock?.start || "",
      time_end: timeblock?.end || "",
      discord_link: session.discord_url,
      youtube_url: session.session_youtube_url,
      time_slots: buildTimeSlots({
        session,
        slots: slotsBySession[session.session_id] || [],
        timeblock,
        papersById,
        slotTypeDefault: slotTypeDefaults.get(session.event_prefix) || null,
      }),
    });
  });

  Object.values(eventList).forEach((event) => {
    event.sessions.sort(sortByStart);
  });

  return eventList;
}

function sortByStart(a: ProgramSession, b: ProgramSession) {
  return (
    (Date.parse(a.time_start) || 0) - (Date.parse(b.time_start) || 0) ||
    a.session_id.localeCompare(b.session_id)
  );
}

function buildTimeSlots({
  session,
  slots,
  timeblock,
  papersById,
  slotTypeDefault,
}: {
  session: RawSession;
  slots: RawSlot[];
  timeblock: RawTimeblock | undefined;
  papersById: Map<string, Paper>;
  slotTypeDefault: NullableString;
}): ProgramTimeSlot[] {
  return slots
    .slice()
    .sort((a, b) => (a.offset_start ?? 0) - (b.offset_start ?? 0))
    .map((slot) => {
      const paper = slot.paper_id ? papersById.get(slot.paper_id) : undefined;
      const start =
        timeblock && slot.offset_start != null
          ? addMinutes(timeblock.start, slot.offset_start)
          : timeblock?.start || "";
      const end =
        timeblock && slot.offset_end != null
          ? addMinutes(timeblock.start, slot.offset_end)
          : timeblock?.end || "";
      return {
        slot_id: slot.slot_id,
        session_id: slot.session_id,
        title: slot.title || paper?.title || "",
        // The program shows who is presenting, not the full author list.
        contributors: slot.presenters || null,
        paper_type: slot.paper_type || slotTypeDefault || "",
        presentation_mode: session.virtual ? "Virtual" : "Premise",
        time_stamp: start,
        time_start: start,
        time_end: end,
        authors: paper?.authors || (slot.contributors || []).map(byName),
        abstract: paper?.abstract || null,
        uid: slot.paper_id || "",
        keywords: paper?.keywords || null,
        preprint_link: paper?.preprint_link || null,
        has_pdf: paper?.has_pdf ?? false,
        paper_award: paper?.award || null,
        doi: paper?.doi || null,
        fno: paper?.fno || null,
        open_access_supplemental_question:
          paper?.open_access_supplemental_question || null,
        open_access_supplemental_link:
          paper?.open_access_supplemental_link || null,
      };
    });
}
