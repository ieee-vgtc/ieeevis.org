import { SPACES, VENUE_TIME_ZONE } from "../data/venue";
import { withBaseURL } from "./withBaseURL";

const weekday = new Intl.DateTimeFormat("en-US", {
  timeZone: VENUE_TIME_ZONE,
  weekday: "short",
});

/**
 * The venue page's floor plan with this room selected on the session's day,
 * or null when the room isn't on the map (off-site or to be announced).
 */
export function venueRoomHref(
  roomId: string,
  timeStart?: string,
): string | null {
  const space = SPACES.find((sp) => sp.roomId === roomId);
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
