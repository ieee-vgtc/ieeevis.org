/**
 * Type definitions for VIS paper data
 * Based on the paper_list.json structure from VIS 2025
 */

export interface Author {
  name: string;
  email: string | null;
  affiliation?: string;
}

export interface Contributor {
  name: string;
  email: string;
}

export interface Paper {
  id: string;
  event_prefix: "v-full" | "v-short" | "a-visap" | "v-tvcg";
  title: string;
  contributors: Contributor[];
  authors: Author[];
  abstract: string;
  keywords: string[];
  doi: string | null;
  fno: string | null;

  // Paper links
  pdf_url: string | null;
  preprint_link: string | null;
  open_access_supplemental_link: string | null;
  discord_url: string | null;

  // Media flags
  has_pdf: boolean;
  has_image: boolean;
  has_ff: boolean; // Fast forward video

  // Upload/Retrieve links
  pmu_upload_link: string | null;
  pmu_retrieve_link: string | null;

  // Additional info
  accessible_pdf: string | null;
  practitioners_statement: string | null;
  award: "best" | "honorable" | null;

  // Metadata
  program_paper_id: string;
  created_at: string;
  updated_at: string;

  // Session info (if available)
  event_id?: string;
  event_title?: string;
  session_id?: string;
  session_title?: string;
  session_room?: string;
  session_room_id?: string;
  time_stamp?: string;

  // Video IDs (if available)
  prerecorded_video_id?: string;
  session_youtube_ff_id?: string;
  session_bunny_ff_link?: string;
  session_bunny_ff_subtitles?: string;
  session_youtube_url?: string;
  session_youtube_prerecorded_id?: string;
  session_bunny_prerecorded_link?: string;
  session_bunny_prerecorded_subtitles?: string;
}

export interface PaperListResponse {
  papers: Paper[];
}

// Helper function to get paper image URL
export function getPaperImageUrl(
  paper: Paper,
  baseUrl = "https://cdn.tech.ieeevis.org/vis2025",
): string {
  return `${baseUrl}/${paper.event_prefix}/${paper.program_paper_id}.png`;
}

// Helper function to get paper type display name
export function getPaperTypeDisplayName(eventPrefix: string): string {
  const typeMap: Record<string, string> = {
    "v-full": "Full Paper",
    "v-short": "Short Paper",
    "a-visap": "VisAP",
    "v-tvcg": "TVCG",
  };
  return typeMap[eventPrefix] || eventPrefix;
}
