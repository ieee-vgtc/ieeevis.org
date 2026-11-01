/**
 * The Westin Copley Place: the floors and rooms VIS uses, and where
 * registration is. The page at src/pages/venue.astro reads this together with
 * the program, so a room's sessions come from the program data, not from here.
 *
 * Map shapes: each floor SVG (src/assets/venue/floor-*.svg) names its room
 * shapes `room-<shape>` and their highlight outlines `hl-<shape>`, using the
 * shape ids below. Registration and speaker prep are `marker-<id>` with
 * outlines `hl-<id>`. The SVGs are final and edited by hand.
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
  /** An event area rather than a session room, listed only on days it's used. */
  area?: boolean;
  /** Drawn on the map only on days it's used. */
  whenUsed?: boolean;
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
    name: "St. George A–D",
    floor: "3",
    shapes: ["st-george-a-b", "st-george-c-d"],
    combined: true,
  },
  {
    roomId: "staffordshire",
    name: "Staffordshire",
    floor: "3",
    shapes: ["staffordshire"],
    area: true,
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
  {
    roomId: "luncheon",
    name: "Luncheon, outside Staffordshire",
    floor: "3",
    shapes: ["luncheon"],
    area: true,
    whenUsed: true,
  },
];

// Sessions held somewhere other than the room the program lists.
const SESSION_ROOMS = [
  { title: /^catered luncheon$/i, room: "staffordshire", to: "luncheon" },
];

/** The venue room a session is actually in. */
export function venueRoomOf(room: string, title: string): string {
  return (
    SESSION_ROOMS.find((o) => o.room === room && o.title.test(title.trim()))
      ?.to ?? room
  );
}

/** Off-site program rooms, shown as cards instead of on a floor plan. */
export const OFFSITE_ROOM_IDS = ["mit_museum", "met_warehouse"];

/** Name and full address of off-site rooms, overriding the program entry. */
export const OFFSITE_ADDRESSES: Record<string, string> = {
  mit_museum: "MIT Museum, 314 Main St, Cambridge, MA 02142",
  met_warehouse:
    "MET Warehouse, MIT, 134 Massachusetts Ave, Cambridge, MA 02139",
};

/** Google Maps links for off-site rooms; others link to a search for the address. */
export const OFFSITE_MAP_URLS: Record<string, string> = {
  mit_museum: "https://maps.app.goo.gl/dtu3nCQkQSeYoj2u7",
  met_warehouse: "https://maps.app.goo.gl/xhuAT2xCc1qqzQpQ6",
};

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
