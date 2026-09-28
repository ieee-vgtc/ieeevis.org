export type ProgramPaperCard = {
  id: string;
  title: string;
  authorNames: string[];
  keywordsLabel: string;
  abstractText: string;
  /** Stable event category used for filtering and colors. */
  presentationType?: string;
  /** Human-readable event category. */
  presentationLabel: string;
  /** Stable event prefix used when a paper is not assigned to one session. */
  eventKey: string | null;
  /** Human-readable event name used by event-level searches. */
  eventLabel: string;
  /** Stable session slug used for exact filtering. */
  sessionKey: string | null;
  sessionLabel: string;
  scheduleLabel: string;
  startMs: number;
  doiUrl: string | null;
  preprintUrl: string | null;
  supplementalUrl: string | null;
  sessionUrl: string | null;
  award: string | null;
  // Journal-first TVCG paper presented at the conference.
  isTvcg?: boolean;
};

export type ProgramPapersBrowserProps = {
  papers: ProgramPaperCard[];
  storageKeyPrefix?: string;
  itemType: string;
};
