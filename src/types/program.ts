export type NullableString = string | null;

export interface ProgramPerson {
  name: string;
  email?: NullableString;
  affiliation?: string;
}

export interface ProgramTimeSlot {
  slot_id: string;
  session_id: string;
  title: string;
  contributors: string[] | null;
  paper_type: string;
  presentation_mode: string;
  time_stamp: string;
  time_start: string;
  time_end: string;
  authors: ProgramPerson[];
  abstract: NullableString;
  uid: string;
  keywords: string[] | null;
  preprint_link: NullableString;
  has_pdf: boolean;
  paper_award: NullableString;
  doi: NullableString;
  fno: NullableString;
  open_access_supplemental_question?: NullableString;
  open_access_supplemental_link?: NullableString;
}

export interface ProgramSession {
  title: string;
  session_id: string;
  event_prefix: string;
  track: string;
  room_name: string;
  chair: string[];
  time_start: string;
  time_end: string;
  discord_link: NullableString;
  youtube_url: NullableString;
  time_slots: ProgramTimeSlot[];
}

export interface ProgramEventDefinition {
  event: string;
  long_name: string;
  event_type: string;
  event_prefix: string;
  event_description: string;
  event_url: string;
  organizers: string[];
  sessions: ProgramSession[];
}

export type ProgramSessionList = Record<string, ProgramEventDefinition>;

export interface ProgramSubmission {
  id: string;
  event_prefix: string;
  title: string;
  contributors: ProgramPerson[];
  authors: ProgramPerson[];
  abstract: NullableString;
  keywords: string[] | null;
  doi: NullableString;
  fno: NullableString;
  pmu_upload_link: NullableString;
  pmu_retrieve_link: NullableString;
  has_pdf: boolean;
  has_image: boolean;
  has_ff: boolean;
  open_access_supplemental_question: NullableString;
  open_access_supplemental_link: NullableString;
  preprint_link: NullableString;
  accessible_pdf: NullableString;
  practitioners_statement: NullableString;
  award: NullableString;
  created_at: string;
  updated_at: string;
  program_paper_id: string;
  pdf_url: NullableString;
  discord_url: NullableString;
  authors_bak: ProgramPerson[] | null;
  contributors_bak: ProgramPerson[] | null;
}

export type ProgramPaper = ProgramSubmission;
export type ProgramPoster = ProgramSubmission;
export type ProgramPaperList = ProgramPaper[];
export type ProgramPosterList = ProgramPoster[];
