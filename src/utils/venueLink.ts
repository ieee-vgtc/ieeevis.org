import {
  SPACES,
  VENUE_TIME_ZONE,
  venueRoomOf,
  type VenueSpace,
} from "../data/venue";
import { withBaseURL } from "./withBaseURL";

const weekday = new Intl.DateTimeFormat("en-US", {
  timeZone: VENUE_TIME_ZONE,
  weekday: "short",
});

/** The venue space a session is in, or null when it isn't on the map. */
export function venueSpaceOf(roomId: string, title = ""): VenueSpace | null {
  const id = venueRoomOf(roomId, title);
  return SPACES.find((sp) => sp.roomId === id) ?? null;
}

/**
 * The venue page's floor plan with this room selected on the session's day,
 * or null when the room isn't on the map (off-site or to be announced).
 */
export function venueRoomHref(
  roomId: string,
  timeStart?: string,
  title = "",
): string | null {
  const space = venueSpaceOf(roomId, title);
  if (!space) return null;
  const params = new URLSearchParams();
  const start = timeStart ? new Date(timeStart) : null;
  if (start && !Number.isNaN(start.getTime())) {
    params.set("day", weekday.format(start).toLowerCase());
  }
  params.set("floor", space.floor);
  params.set("room", space.roomId);
  return withBaseURL(`/venue/?${params}#map`);
}
