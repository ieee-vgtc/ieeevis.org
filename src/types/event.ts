import type { Session } from "./session";

export interface Event {
  id: string;

  abstract: string;
  calendarICS: string;
  description: string;
  ff_playlist: string;
  ff_playlist_id: string;
  long_name: string;
  organizers: string[];
  sessions: Session[];
  title: string;
  type: string;
  url: string;
}
