/**
 * Converts the planning-committee schedule export
 * (src/data/early_program/vis26-tues-fri-final-schedule.json) into the
 * already-merged program shape used by the `localTest` sources in
 * src/config/pages-allow-list.ts (src/data/program_test/*).
 *
 * Writes session_list.json and paper_list.json. poster_list.json is left
 * alone because the schedule export has no posters.
 *
 * Usage: npm run convert-early-program
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import type { Paper } from "../types/paper";
import type {
  ProgramEventDefinition,
  ProgramSession,
  ProgramSessionList,
  ProgramTimeSlot,
} from "../types/program";

const SOURCE = "src/data/early_program/vis26-tues-fri-final-schedule.json";
const TUTORIALS = "src/data/early_program/tutorials_list.tsv";
const PAPERS = "src/data/early_program/papers_list.tsv";
const PANELS = "src/data/early_program/panels_list.json";
// The export has no workshops; their times and details live in these pages.
const WEEK_AT_A_GLANCE = "src/pages/info/program/week-at-a-glance.md";
const WORKSHOPS = "src/pages/info/program/workshops.md";
const OUT_DIR = "src/data/program_test";
const YEAR_URL = "https://ieeevis.org/year/2026";
const CREATED_AT = new Date().toISOString();

// The export's block timestamps are wrong: "tues" is dated Nov 9 (the Monday)
// and blocks are 75 minutes. Dates and times come from here instead, matching
// week-at-a-glance.md and the times in panels_list.json.
const CONFERENCE_DATES: Record<string, string> = {
  mon: "2026-11-09",
  tues: "2026-11-10",
  wed: "2026-11-11",
  thur: "2026-11-12",
  fri: "2026-11-13",
};
// Block number -> Eastern start/end. The "X" blocks run alongside block 1.
const BLOCK_TIMES: Record<string, [string, string]> = {
  X: ["08:00", "09:30"],
  "1": ["08:00", "09:30"],
  "2": ["10:00", "11:30"],
  "3": ["13:00", "14:30"],
  "4": ["15:00", "16:30"],
};
const EASTERN_OFFSET = "-05:00";

const easternToIso = (date: string, time: string) =>
  new Date(`${date}T${time}:00${EASTERN_OFFSET}`).toISOString();

interface SourceBlock {
  session_id: string;
  start: string;
  end: string;
}

interface SourcePaper {
  paper_id: string;
  title: string;
  authors: string[];
  presenters: string[];
  type: string;
}

interface SourceEvent {
  name: string;
  chair: string;
  session_id: string;
  session: string;
  track: string;
  length: number;
  papers: SourcePaper[];
}

interface Source {
  sessions: SourceBlock[];
  tracks: string[];
  events: SourceEvent[];
}

/** How each schedule item type maps onto a program event. */
const PAPER_EVENTS: Record<
  string,
  { prefix: string; event: string; eventType: string; paperType: string }
> = {
  Full: {
    prefix: "v-full",
    event: "VIS Full Papers",
    eventType: "full",
    paperType: "Full",
  },
  Short: {
    prefix: "v-short",
    event: "VIS Short Papers",
    eventType: "short",
    paperType: "Short",
  },
  "CG&A": {
    prefix: "v-cga",
    event: "CG&A Invited Partnership Presentations",
    eventType: "invited",
    paperType: "CG&A",
  },
  VISAP: {
    prefix: "a-visap",
    event: "VIS Arts Program",
    eventType: "visap",
    paperType: "VISAP",
  },
};

const PANEL_EVENT = {
  prefix: "v-panels",
  event: "VIS Panels",
  eventType: "panel",
  url: `${YEAR_URL}/info/program/panels`,
};

const CONF_EVENT = {
  prefix: "conf",
  event: "Conference Events",
  eventType: "vis",
};

// The export has a few names that were saved as Mac Roman / Latin-1 and then
// read back as UTF-8.
const MOJIBAKE_FIXES: [string, string][] = [
  ["Ò", "“"],
  ["Ó", "”"],
  ["Ÿ", "ü"],
  ["Bšrner", "Börner"],
  ["Jšrg", "Jörg"],
  ["Ã§", "ç"],
  // A non-breaking space, e.g. trailing "TVCG-2025-03-0212¬†".
  ["¬†", " "],
];

const fixText = (value: string) =>
  MOJIBAKE_FIXES.reduce(
    (text, [bad, good]) => text.split(bad).join(good),
    value,
  ).trim();

// Session names carry planning annotations such as "[Paris, HM]".
const cleanSessionTitle = (name: string) =>
  fixText(name).replace(/\s*\[[^\]]*\]\s*$/, "");

const splitNames = (value: string) =>
  fixText(value)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

/** "Hyeon Jeon, Soohyun Lee, and Jinwook Seo" -> ["Hyeon Jeon", ...] */
const splitAuthors = (value: string) =>
  fixText(value)
    .split(/\s*,\s*(?:and\s+)?|\s+and\s+/)
    .filter(Boolean);

// "America north (300)" -> "America North" and "St. George A-B" ->
// "St. George (A+B)", matching the detail files.
const roomName = (track: string) =>
  track === "SWAP COLUMN"
    ? "TBA"
    : track
        .replace(/\s*\(\d+\)\s*$/, "")
        .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
        .replace(/\b([A-Z])-([A-Z])$/, "($1+$2)");

/** Stable UUID-shaped id so regenerating keeps paper URLs unchanged. */
function stableId(key: string) {
  const hex = createHash("sha1").update(`vis2026:${key}`).digest("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    ((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) +
      hex.slice(18, 20),
    hex.slice(20, 32),
  ].join("-");
}

/** "VIS 1499" -> "1499", "TVCG.2026.3671259" stays as is. */
const programPaperId = (paperId: string) =>
  paperId.replace(/^(VIS|Short|VISAP)\s+/, "");

function paperDoi(paperId: string) {
  if (paperId.startsWith("10.")) return paperId;
  if (/^TVCG\.\d{4}\.\d+$/.test(paperId)) return `10.1109/${paperId}`;
  return null;
}

const addMinutes = (iso: string, minutes: number) =>
  new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();

function loadTsv(file: string): Record<string, string>[] {
  const [header, ...rows] = readFileSync(file, "utf-8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split("\t"));
  return rows.map((row) =>
    Object.fromEntries(header.map((key, i) => [key, row[i]?.trim() ?? ""])),
  );
}

function loadTutorials() {
  return new Map(
    loadTsv(TUTORIALS).map((record) => [record.tutorial_title, record]),
  );
}

/** A row of papers_list.tsv, plus its position in the file. */
interface PaperDetails {
  paper_type: string;
  title: string;
  authors: string;
  session_id: string;
  session_chair_name: string;
  location: string;
  zulu_start: string;
  room_name: string;
  track_id: string;
  abstract: string;
  order: number;
}

/**
 * Rows of papers_list.tsv keyed by paper id. The rows are in presentation
 * order within each session, which the export does not keep.
 */
function loadPaperDetails() {
  return new Map(
    loadTsv(PAPERS).map((record, order): [string, PaperDetails] => [
      fixText(record.paper_id),
      {
        paper_type: record.paper_type,
        title: record.title,
        authors: record.authors,
        session_id: record.session_id,
        session_chair_name: record.session_chair_name,
        location: record.location,
        zulu_start: record.zulu_start,
        room_name: record.room_name,
        track_id: record.track_id,
        // Named like the panel and tutorial files, or plainly.
        abstract: record.description_abstract || record.abstract || "",
        order,
      },
    ]),
  );
}

// Where the talk is given; Paris and Tianjin are satellite venues.
const presentationMode = (location: string | undefined) => {
  if (!location || location === "Boston") return "Premise";
  if (/pre-?recorded/i.test(location)) return "Pre-recorded";
  return `Satellite (${location})`;
};

interface PanelDetails {
  panel_id: string;
  panel_title: string;
  description_abstract: string;
  website: string;
  /** "Name, Affiliation" */
  organizers: string[];
  panelists: string[];
  zulu_start: string;
  zulu_end: string;
  room_name: string;
  track_id: string;
}

function loadPanels() {
  const panels: PanelDetails[] = JSON.parse(readFileSync(PANELS, "utf-8"));
  return new Map(panels.map((panel) => [panel.panel_id, panel]));
}

const withoutAffiliation = (person: string) => person.split(",")[0].trim();

function withConferenceTimes(block: SourceBlock): SourceBlock {
  const [, day, index] = block.session_id.match(/^([a-z]+)(\w+)$/) ?? [];
  const date = CONFERENCE_DATES[day];
  const times = BLOCK_TIMES[index];
  if (!date || !times) {
    throw new Error(`No conference time for block ${block.session_id}`);
  }
  return {
    ...block,
    start: easternToIso(date, times[0]),
    end: easternToIso(date, times[1]),
  };
}

/** Workshop names are written differently across pages; match on the first word. */
const workshopKey = (title: string) =>
  title
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

interface WorkshopDetails {
  title: string;
  organizers: string[];
  website: string;
  description: string;
}

function loadWorkshopDetails() {
  const details = new Map<string, WorkshopDetails>();
  const sections = readFileSync(WORKSHOPS, "utf-8").split(
    /^## <a name="[^"]*"><\/a>\s*/m,
  );
  for (const section of sections.slice(1)) {
    const [heading, ...lines] = section.split("\n");
    const body = lines.join("\n").split(/^---$/m)[0];
    const organizers = (
      body.match(/\*\*Organizers\*\*:([\s\S]*?)\*\*Contact/)?.[1] ?? ""
    )
      .split("\n")
      .map((line) => line.split(",")[0].replace(/<br>/g, "").trim())
      .filter(Boolean);
    const website = body.match(/\*\*Website\*\*:\s*\[([^\]]+)\]/)?.[1] ?? "";
    const description = body
      .split(/\*\*Website\*\*:.*$/m)[1]
      ?.trim()
      .replace(/\s*\n\s*/g, " ");
    const title = heading.trim();
    details.set(workshopKey(title), {
      title,
      organizers,
      website,
      description: description ?? "",
    });
  }
  return details;
}

/** Monday workshop blocks, e.g. "_8:00 AM - 11:30 AM (EST)_" then a list of names. */
function loadWorkshopSchedule() {
  const page = readFileSync(WEEK_AT_A_GLANCE, "utf-8");
  const monday = page.split(/^## Monday Schedule$/m)[1]?.split(/^## /m)[0];
  if (!monday) throw new Error(`No Monday schedule in ${WEEK_AT_A_GLANCE}`);

  const toIso = (time: string) => {
    const [, h, m, meridiem] = time.match(/(\d+):(\d+)\s*(AM|PM)/)!;
    const hour = (Number(h) % 12) + (meridiem === "PM" ? 12 : 0);
    return easternToIso(
      CONFERENCE_DATES.mon,
      `${String(hour).padStart(2, "0")}:${m}`,
    );
  };

  const entries: { name: string; start: string; end: string }[] = [];
  let block: { start: string; end: string } | undefined;
  for (const line of monday.split("\n")) {
    const time = line.match(/^_(\d+:\d+ [AP]M) - (\d+:\d+ [AP]M)/);
    if (time) {
      block = { start: toIso(time[1]), end: toIso(time[2]) };
      continue;
    }
    const workshop = line.match(/^\*\*\[Workshop\]\*\*\s*(.*?)\s*<br\s*\/?>/);
    if (workshop && block) entries.push({ name: workshop[1], ...block });
  }
  return entries;
}

function main() {
  const source: Source = JSON.parse(readFileSync(SOURCE, "utf-8"));
  const tutorials = loadTutorials();
  const panels = loadPanels();

  // Blocks per day in order ("wed1", "wed2", ...), so events longer than one
  // block can be spread over the following blocks. The "X" blocks are
  // parallel to block 1 and never start a multi-block event.
  const blocksById = new Map(
    source.sessions.map((b) => [b.session_id, withConferenceTimes(b)]),
  );
  const blocksForEvent = (event: SourceEvent) => {
    const match = event.session.match(/^([a-z]+)(\d+)$/);
    if (!match) throw new Error(`Unexpected session id ${event.session}`);
    const [, day, index] = match;
    return Array.from({ length: event.length }, (_, i) => {
      const id = `${day}${Number(index) + i}`;
      const block = blocksById.get(id);
      if (!block)
        throw new Error(`${event.session_id} runs into missing ${id}`);
      return block;
    });
  };

  const program: ProgramSessionList = {};
  const papers: Paper[] = [];
  const paperDetails = loadPaperDetails();
  const scheduledPaperIds = new Set<string>();

  const makePaper = (
    paperId: string,
    prefix: string,
    title: string,
    authors: Paper["authors"],
    presenters: string[],
    abstract: string,
  ): Paper => ({
    id: stableId(paperId),
    event_prefix: prefix as Paper["event_prefix"],
    title,
    contributors: presenters.map((name) => ({ name, email: "" })),
    authors,
    abstract,
    keywords: [],
    doi: paperDoi(paperId),
    fno: null,
    pdf_url: null,
    preprint_link: null,
    open_access_supplemental_link: null,
    open_access_supplemental_question: null,
    discord_url: null,
    has_pdf: false,
    has_image: false,
    has_ff: false,
    pmu_upload_link: null,
    pmu_retrieve_link: null,
    accessible_pdf: null,
    practitioners_statement: null,
    award: null,
    program_paper_id: programPaperId(paperId),
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
  });

  const ensureEvent = (
    prefix: string,
    event: string,
    eventType: string,
    extra: Partial<ProgramEventDefinition> = {},
  ) =>
    (program[prefix] ??= {
      event,
      long_name: event,
      event_type: eventType,
      event_prefix: prefix,
      event_description: "",
      event_url: `${YEAR_URL}/program/event_${prefix}.html`,
      organizers: [],
      sessions: [],
      ...extra,
    });

  const makeSession = (
    event: SourceEvent,
    prefix: string,
    block: SourceBlock,
    overrides: Partial<ProgramSession> = {},
  ): ProgramSession => ({
    title: cleanSessionTitle(event.name),
    session_id: event.session_id,
    event_prefix: prefix,
    track: slugify(roomName(event.track)),
    room_name: roomName(event.track),
    chair: splitNames(event.chair),
    time_start: block.start,
    time_end: block.end,
    discord_link: null,
    youtube_url: null,
    time_slots: [],
    ...overrides,
  });

  const makeSlot = (
    session: ProgramSession,
    fields: Partial<ProgramTimeSlot> &
      Pick<ProgramTimeSlot, "slot_id" | "title" | "paper_type">,
  ): ProgramTimeSlot => ({
    session_id: session.session_id,
    contributors: null,
    presentation_mode: "Premise",
    time_stamp: session.time_start,
    time_start: session.time_start,
    time_end: session.time_end,
    authors: [],
    abstract: null,
    uid: "",
    keywords: null,
    preprint_link: null,
    has_pdf: false,
    paper_award: null,
    doi: null,
    fno: null,
    open_access_supplemental_question: null,
    open_access_supplemental_link: null,
    ...fields,
  });

  // The same plenary is listed once per overflow room; show it once.
  const plenaries = new Map<string, ProgramSession>();

  for (const event of source.events) {
    const blocks = blocksForEvent(event);
    const itemTypes = new Set(event.papers.map((p) => p.type));
    const [firstType] = itemTypes;
    if (itemTypes.size !== 1) {
      throw new Error(
        `${event.session_id} mixes item types: ${[...itemTypes]}`,
      );
    }

    const paperEvent = PAPER_EVENTS[firstType];
    if (paperEvent) {
      const programEvent = ensureEvent(
        paperEvent.prefix,
        paperEvent.event,
        paperEvent.eventType,
      );
      // papers_list.tsv has cleaner titles/authors, rooms, and the talk order.
      const items = event.papers
        .map((item) => {
          const paperId = fixText(item.paper_id);
          return { item, paperId, details: paperDetails.get(paperId) };
        })
        .sort(
          (a, b) =>
            (a.details?.order ?? Infinity) - (b.details?.order ?? Infinity),
        );
      for (const { paperId, details } of items) {
        if (!details) continue;
        if (details.session_id !== event.session_id) {
          console.warn(
            `${paperId} is in ${event.session_id} in the schedule but ${details.session_id || "unscheduled"} in ${PAPERS}`,
          );
        }
        if (
          details.zulu_start &&
          Date.parse(details.zulu_start) !== Date.parse(blocks[0].start)
        ) {
          console.warn(
            `${paperId} starts ${details.zulu_start} in ${PAPERS} but ${blocks[0].start} in the schedule`,
          );
        }
      }
      const room = items.find(({ details }) => details?.room_name)?.details;

      const session = makeSession(event, paperEvent.prefix, blocks[0], {
        time_end: blocks[blocks.length - 1].end,
        ...(room && { room_name: room.room_name, track: room.track_id }),
      });
      const chair = items.find(({ details }) => details?.session_chair_name)
        ?.details?.session_chair_name;
      if (chair) session.chair = splitNames(chair);

      const totalMinutes =
        (Date.parse(session.time_end) - Date.parse(session.time_start)) /
        60_000;
      const slotMinutes = Math.floor(totalMinutes / items.length);

      session.time_slots = items.map(({ item, paperId, details }, i) => {
        scheduledPaperIds.add(paperId);
        const title = details?.title || fixText(item.title);
        const authors = (
          details?.authors
            ? splitAuthors(details.authors)
            : item.authors
                .map(fixText)
                .map((name) => name.replace(/^and\s+/, ""))
        ).map((name) => ({ name, email: null }));
        const presenters = item.presenters.map(fixText);
        const paper = makePaper(
          paperId,
          paperEvent.prefix,
          title,
          authors,
          presenters,
          details?.abstract ?? "",
        );
        papers.push(paper);
        const start = addMinutes(session.time_start, i * slotMinutes);
        return makeSlot(session, {
          slot_id: `${paperEvent.prefix}-${paper.program_paper_id}`,
          title,
          paper_type: paperEvent.paperType,
          contributors: presenters,
          authors,
          presentation_mode: presentationMode(details?.location),
          abstract: paper.abstract || null,
          uid: paper.id,
          doi: paper.doi,
          time_stamp: start,
          time_start: start,
          time_end: addMinutes(start, slotMinutes),
        });
      });
      programEvent.sessions.push(session);
      continue;
    }

    if (firstType === "Panel") {
      const [item] = event.papers;
      const details = panels.get(event.session_id);
      if (!details) console.warn(`No panel details for ${event.session_id}`);
      const title = details?.panel_title.trim() || fixText(item.title);
      const programEvent = ensureEvent(
        PANEL_EVENT.prefix,
        PANEL_EVENT.event,
        PANEL_EVENT.eventType,
        { event_url: PANEL_EVENT.url },
      );
      // All panels share one event, so each panel's details go on its session.
      const session = makeSession(event, PANEL_EVENT.prefix, blocks[0], {
        title,
        time_end: blocks[blocks.length - 1].end,
        description: details?.description_abstract.trim() || null,
        url: details?.website.trim() || null,
        ...(details?.room_name && {
          room_name: details.room_name,
          track: details.track_id,
        }),
      });
      if (
        details &&
        (Date.parse(details.zulu_start) !== Date.parse(session.time_start) ||
          Date.parse(details.zulu_end) !== Date.parse(session.time_end))
      ) {
        console.warn(
          `${event.session_id} is ${details.zulu_start}–${details.zulu_end} in ${PANELS} but ${session.time_start}–${session.time_end} in the schedule`,
        );
      }
      // The panel list has cleaner names than the export; fall back to it.
      const organizers =
        details?.organizers.map(withoutAffiliation) ??
        item.authors.map(fixText);
      const panelists =
        details?.panelists.map(withoutAffiliation) ??
        item.presenters.map(fixText);
      session.chair = organizers;
      session.time_slots = [
        makeSlot(session, {
          slot_id: `${PANEL_EVENT.prefix}-${event.session_id}`,
          title,
          paper_type: "Panel",
          contributors: panelists,
          authors: organizers.map((name) => ({ name, email: null })),
        }),
      ];
      programEvent.sessions.push(session);
      continue;
    }

    if (firstType === "Tutorial") {
      const [item] = event.papers;
      const title = fixText(item.title);
      const details = tutorials.get(title);
      if (!details) console.warn(`No tutorial details for "${title}"`);
      const prefix = details?.tutorial_id?.trim() || `t-${event.session_id}`;
      if (
        details?.zulu_start &&
        Date.parse(details.zulu_start) !== Date.parse(blocks[0].start)
      ) {
        console.warn(
          `${prefix} starts ${details.zulu_start} in ${TUTORIALS} but ${blocks[0].start} in the schedule`,
        );
      }
      // "Name, Affiliation; Name, Affiliation"
      const organizers = details?.organizers
        ? details.organizers.split(";").map(withoutAffiliation).filter(Boolean)
        : item.authors.map(fixText);
      const programEvent = ensureEvent(prefix, title, "tutorial", {
        event_description: details?.description_abstract?.trim() || "",
        event_url:
          details?.website?.trim() || `${YEAR_URL}/info/program/tutorials`,
        organizers,
      });
      // One session per block, suffixed "-1", "-2" like previous years.
      blocks.forEach((block, i) =>
        programEvent.sessions.push(
          makeSession(event, prefix, block, {
            title,
            session_id: `${prefix}-${i + 1}`,
            ...(details?.room_name && {
              room_name: details.room_name,
              track: details.track_id,
            }),
          }),
        ),
      );
      continue;
    }

    // Everything else is a plenary/social event with placeholder items only.
    const programEvent = ensureEvent(
      CONF_EVENT.prefix,
      CONF_EVENT.event,
      CONF_EVENT.eventType,
    );
    blocks.forEach((block, i) => {
      const title =
        cleanSessionTitle(event.name) +
        (blocks.length > 1 ? ` (Part ${i + 1})` : "");
      const key = `${title}|${block.session_id}`;
      const existing = plenaries.get(key);
      const room = roomName(event.track);
      if (existing) {
        if (!existing.room_name.split(" / ").includes(room)) {
          existing.room_name += ` / ${room}`;
          existing.track = slugify(existing.room_name);
        }
        return;
      }
      const session = makeSession(event, CONF_EVENT.prefix, block, {
        title,
        session_id:
          blocks.length > 1 ? `${event.session_id}-${i + 1}` : event.session_id,
      });
      plenaries.set(key, session);
      programEvent.sessions.push(session);
    });
  }

  // Accepted papers the schedule has not placed yet still get a paper page.
  for (const [paperId, details] of paperDetails) {
    if (scheduledPaperIds.has(paperId)) continue;
    const paperEvent = PAPER_EVENTS[details.paper_type];
    if (!paperEvent) {
      console.warn(`Unknown paper type "${details.paper_type}" for ${paperId}`);
      continue;
    }
    console.warn(`${paperId} is not in the schedule; listing it unscheduled`);
    papers.push(
      makePaper(
        paperId,
        paperEvent.prefix,
        details.title,
        splitAuthors(details.authors).map((name) => ({ name, email: null })),
        [],
        details.abstract,
      ),
    );
  }

  const missingAbstracts = papers.filter((paper) => !paper.abstract).length;
  if (missingAbstracts > 0) {
    console.warn(
      `${missingAbstracts} of ${papers.length} papers have no abstract (add a description_abstract column to ${PAPERS})`,
    );
  }

  const workshopDetails = loadWorkshopDetails();
  for (const entry of loadWorkshopSchedule()) {
    const key = workshopKey(entry.name);
    const details = workshopDetails.get(key);
    if (!details) console.warn(`No workshop details for "${entry.name}"`);
    const prefix = `w-${key}`;
    const title = details?.title ?? entry.name;
    const programEvent = ensureEvent(prefix, title, "workshop", {
      event_description: details?.description ?? "",
      event_url: details?.website || `${YEAR_URL}/info/program/workshops`,
      organizers: details?.organizers ?? [],
    });
    programEvent.sessions.push({
      title,
      session_id: `${prefix}-${programEvent.sessions.length + 1}`,
      event_prefix: prefix,
      track: "tba",
      room_name: "TBA",
      chair: [],
      time_start: entry.start,
      time_end: entry.end,
      discord_link: null,
      youtube_url: null,
      time_slots: [],
    });
  }

  for (const event of Object.values(program)) {
    event.sessions.sort(
      (a, b) =>
        Date.parse(a.time_start) - Date.parse(b.time_start) ||
        a.session_id.localeCompare(b.session_id, undefined, { numeric: true }),
    );
  }

  writeFileSync(
    `${OUT_DIR}/session_list.json`,
    `${JSON.stringify(program, null, 2)}\n`,
  );
  writeFileSync(
    `${OUT_DIR}/paper_list.json`,
    `${JSON.stringify(papers, null, 2)}\n`,
  );

  const sessionCount = Object.values(program).reduce(
    (sum, event) => sum + event.sessions.length,
    0,
  );
  console.log(
    `Wrote ${Object.keys(program).length} events, ${sessionCount} sessions, ${papers.length} papers to ${OUT_DIR}`,
  );
}

main();
