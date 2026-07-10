import type { ProgramPerson } from "./program";
import type { NullableString } from "./program";

export interface Poster {
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
  open_access_supplemental_question?: NullableString;
  open_access_supplemental_link?: NullableString;
  preprint_link?: NullableString;
  accessible_pdf?: NullableString;
  practitioners_statement?: NullableString;
  award?: NullableString;
  created_at: string;
  updated_at: string;
  program_paper_id: string;
  pdf_url?: NullableString;
  discord_url?: NullableString;
}
