export type ProgramPaperCard = {
  id: string;
  title: string;
  authorNames: string[];
  keywordsLabel: string;
  abstractText: string;
  presentationLabel: string;
  sessionLabel: string;
  scheduleLabel: string;
  startMs: number;
  doiUrl: string | null;
  preprintUrl: string | null;
  supplementalUrl: string | null;
  sessionUrl: string | null;
  award: string | null;
};

export type ProgramPapersBrowserProps = {
  papers: ProgramPaperCard[];
  storageKeyPrefix?: string;
  itemType: string;
};
