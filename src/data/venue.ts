/**
 * The Westin Copley Place: the floors and rooms VIS uses, and where
 * registration is. The page at src/pages/venue.astro reads this together with
 * the program, so a room's sessions come from the program data, not from here.
 *
 * Map shapes: each floor SVG (src/assets/venue/floor-*.svg) names its room
 * shapes `room-<shape>` and their highlight outlines `hl-<shape>`, using the
 * shape ids below. Registration and speaker prep are `marker-<id>` with
 * outlines `hl-<id>`.
 */

export type FloorId = "3" | "4" | "7";

export interface VenueFloor {
  id: FloorId;
  label: string;
  /** Shown under the tab. */
  summary: string;
}

export const FLOORS: VenueFloor[] = [
  {
    id: "3",
    label: "Floor 3",
    summary: "Essex Ballroom, St. George, Staffordshire",
  },
  { id: "4", label: "Floor 4", summary: "America Ballroom" },
  { id: "7", label: "Floor 7", summary: "Empire and meeting rooms" },
];

export interface VenueSpace {
  /** The program's room_id. */
  roomId: string;
  name: string;
  floor: FloorId;
  /** Map shapes this room covers. */
  shapes: string[];
  /** Several sections opened up into one room, listed under each section. */
  combined?: boolean;
}

export const SPACES: VenueSpace[] = [
  {
    roomId: "essex_north",
    name: "Essex North",
    floor: "3",
    shapes: ["essex-north"],
  },
  {
    roomId: "essex_center",
    name: "Essex Center",
    floor: "3",
    shapes: ["essex-center"],
  },
  {
    roomId: "essex_south",
    name: "Essex South",
    floor: "3",
    shapes: ["essex-south"],
  },
  {
    roomId: "st_george_a_b",
    name: "St. George A–B",
    floor: "3",
    shapes: ["st-george-a-b"],
  },
  {
    roomId: "st_george_c_d",
    name: "St. George C–D",
    floor: "3",
    shapes: ["st-george-c-d"],
  },
  {
    roomId: "st_george",
    name: "St. George, all four sections",
    floor: "3",
    shapes: ["st-george-a-b", "st-george-c-d"],
    combined: true,
  },
  {
    roomId: "staffordshire",
    name: "Staffordshire",
    floor: "3",
    shapes: ["staffordshire"],
  },
  {
    roomId: "america_north",
    name: "America North",
    floor: "4",
    shapes: ["america-north"],
  },
  {
    roomId: "america_center",
    name: "America Center",
    floor: "4",
    shapes: ["america-center"],
  },
  {
    roomId: "america_south",
    name: "America South",
    floor: "4",
    shapes: ["america-south"],
  },
  {
    roomId: "america",
    name: "America (Plenary)",
    floor: "4",
    shapes: ["america-north", "america-center", "america-south"],
    combined: true,
  },
  { roomId: "empire", name: "Empire", floor: "7", shapes: ["empire"] },
];

/** Off-site program rooms, shown as cards instead of on a floor plan. */
export const OFFSITE_ROOM_IDS = ["mit_museum", "met_warehouse"];

export interface RegistrationHours {
  /** Conference-local date, YYYY-MM-DD. */
  date: string;
  /** 24-hour Boston time, HH:MM. Null until the hours are set. */
  open: string | null;
  close: string | null;
  note?: string;
}

export const REGISTRATION = {
  floor: "3" as FloorId,
  where: "next to St. George",
  locationConfirmed: true,
  hours: [
    {
      date: "2026-11-08",
      open: "15:00",
      close: "18:00",
      note: "Badge pickup only, no conference program",
    },
    { date: "2026-11-09", open: "07:00", close: "17:00" },
    { date: "2026-11-10", open: "07:00", close: "17:00" },
    { date: "2026-11-11", open: "07:00", close: "17:00" },
    { date: "2026-11-12", open: "07:30", close: "17:00" },
    { date: "2026-11-13", open: "07:30", close: "13:00" },
  ] satisfies RegistrationHours[],
};

// TODO: add the speaker prep hours once they're set.
export const SPEAKER_PREP = {
  floor: "4" as FloorId,
  where: "Independence A",
};

/** Boston is on Eastern Standard Time for the whole conference week. */
export const VENUE_UTC_OFFSET = "-05:00";
export const VENUE_TIME_ZONE = "America/New_York";
