import type { ProgramTimeSlot } from "./program";

export interface Session {
  title: string;
  id: string;
  event_prefix: string;
  track: string;
  room_name: string;
  chair: string[];
  time_start: string;
  time_end: string;
  discord_link: string | null;
  youtube_url: string | null;
  time_slots: ProgramTimeSlot[];
}
