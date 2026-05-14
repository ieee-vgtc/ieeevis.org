import { useEffect, useMemo, useState } from "react";
import { withBaseURL } from "../utils/withBaseURL";

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

type SearchField = "any" | "title" | "keyword" | "author" | "session";
type SortMode = "title" | "bookmarked" | "visited" | "schedule";

const parseStoredSet = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

type ProgramPapersBrowserProps = {
  papers: ProgramPaperCard[];
  storageKeyPrefix?: string;
  itemType: string;
};

export default function ProgramPapersBrowser({
  papers,
  storageKeyPrefix = "program-papers",
  itemType,
}: ProgramPapersBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("any");
  const [sortMode, setSortMode] = useState<SortMode>("title");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const bookmarkKey = `${storageKeyPrefix}-bookmarks`;

  useEffect(() => {
    setBookmarkedIds(parseStoredSet(bookmarkKey));

    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("search") || "");
    setSearchField((params.get("filter") as SearchField) || "any");
    setSortMode((params.get("sort") as SortMode) || "title");
  }, [bookmarkKey]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentSearch = searchQuery.trim();

    if (currentSearch) {
      params.set("search", currentSearch);
    } else {
      params.delete("search");
    }

    if (searchField !== "any") {
      params.set("filter", searchField);
    } else {
      params.delete("filter");
    }

    if (sortMode !== "title") {
      params.set("sort", sortMode);
    } else {
      params.delete("sort");
    }

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    history.replaceState(null, "", nextUrl);
  }, [searchQuery, searchField, sortMode]);

  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const getFieldValue = (paper: ProgramPaperCard): string => {
      if (searchField === "any") {
        return [
          paper.title.toLowerCase(),
          paper.authorNames.join(" ").toLowerCase(),
          paper.keywordsLabel.toLowerCase(),
          paper.scheduleLabel.toLowerCase(),
        ].join(" ");
      }
      if (searchField === "title") return paper.title.toLowerCase();
      if (searchField === "author")
        return paper.authorNames.join(" ").toLowerCase();
      if (searchField === "keyword") return paper.keywordsLabel.toLowerCase();
      return paper.scheduleLabel.toLowerCase();
    };

    const visible = papers.filter((paper) => {
      const haystack = getFieldValue(paper);
      return query.length === 0 || haystack.includes(query);
    });

    visible.sort((a, b) => {
      if (sortMode === "bookmarked") {
        const delta =
          Number(bookmarkedIds.has(b.id)) - Number(bookmarkedIds.has(a.id));
        if (delta !== 0) return delta;
      }

      if (sortMode === "schedule" && a.startMs !== b.startMs) {
        return a.startMs - b.startMs;
      }

      return a.title.localeCompare(b.title);
    });

    return visible;
  }, [papers, searchQuery, searchField, sortMode, bookmarkedIds]);

  const toggleBookmark = (paperId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(paperId)) {
        next.delete(paperId);
      } else {
        next.add(paperId);
      }
      localStorage.setItem(bookmarkKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const paperTypeToNameMap: Record<string, string> = {
    full: "Full VIS Paper",
    short: "VIS Short Paper",
    poster: "Poster",
    demo: "Demo",
    "workshop paper": "Workshop Paper",
  };

  return (
    <section
      className="program-papers grid gap-3"
      data-local-storage-key-prefix={storageKeyPrefix}
    >
      {/* header */}
      <div className="flex flex-wrap justify-between gap-4 rounded-lg border border-gray-300 bg-linear-to-br from-primary/10 to-secondary/10 p-4">
        <div>
          <p className="m-0 p-0 mb-0 font-display font-bold leading-none text-accent text-xl">
            VIS {itemType}s
          </p>
          <p className="text-base text-gray-700">
            Browse accepted {itemType}s by title, author, keyword, and session
            information.
          </p>
          <p className="mt-2 text-base text-gray-700">
            Note: bookmarks are stored locally in your browser and are not
            shared across devices.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 items-end gap-3 md:grid-cols-3 md:gap-4 xl:w-auto">
          <label className="grid gap-1 text-sm font-semibold text-gray-700">
            Find
            <div className="flex min-w-0 items-center overflow-hidden rounded-md border border-gray-400 bg-white">
              <input
                id="papers-search"
                className="w-full border-0 bg-transparent px-2 py-2 text-base text-gray-900 outline-none"
                type="search"
                placeholder={`Search ${itemType}s`}
                aria-label={`Search ${itemType}s`}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button
                id="papers-search-clear"
                className="cursor-pointer border-0 border-l border-gray-300 bg-white px-2 py-2 text-sm text-gray-600"
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
              >
                x
              </button>
            </div>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-gray-700">
            Search by
            <select
              id="papers-search-field"
              className="w-full rounded-md border border-gray-400 bg-white px-2 py-2 text-base text-gray-800"
              value={searchField}
              onChange={(event) =>
                setSearchField(event.target.value as SearchField)
              }
            >
              <option value="any">any</option>
              <option value="title">title</option>
              <option value="keyword">keyword</option>
              <option value="author">author</option>
              <option value="session">session</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-gray-700">
            Sort by
            <select
              id="papers-sort"
              className="w-full rounded-md border border-gray-400 bg-white px-2 py-2 text-base text-gray-800"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
            >
              <option value="title">title</option>
              <option value="bookmarked">bookmarked first</option>
              <option value="schedule">schedule</option>
            </select>
          </label>
        </div>
      </div>

      {/* cards */}
      <div className="flex flex-wrap justify-between gap-3" id="papers-grid">
        {filteredAndSorted.map((paper) => {
          const isBookmarked = bookmarkedIds.has(paper.id);

          return (
            <article
              key={paper.id}
              className={`relative flex w-full flex-col gap-3 rounded-lg border bg-white shadow-sm transition-colors md:w-96 md:flex-none md:min-h-96 ${
                isBookmarked ? "border-accent shadow-md" : "border-gray-300"
              } `}
              data-paper-card
              data-paper-id={paper.id}
              data-title={paper.title.toLowerCase()}
              data-authors={paper.authorNames.join(",").toLowerCase()}
              data-keywords={paper.keywordsLabel.toLowerCase()}
              data-session={paper.sessionLabel.toLowerCase()}
              data-start-ms={paper.startMs}
            >
              <div className="bg-accent-secondaryBackground p-4 h-1/2 min-h-1/2">
                <button
                  className="absolute right-1.5 top-1.5 cursor-pointer border-0 bg-transparent p-1 leading-none text-accent"
                  type="button"
                  data-bookmark-toggle
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  data-bookmarked={isBookmarked ? "true" : "false"}
                  onClick={() => toggleBookmark(paper.id)}
                >
                  <i className="material-icons" data-bookmark-icon>
                    {isBookmarked ? "bookmark" : "bookmark_border"}
                  </i>
                </button>

                <a
                  className="m-0 pr-6 font-display leading-tight !text-black text-xl cursor-pointer   decoration-primary-200 decoration-dotted "
                  href={withBaseURL(`/program/${itemType}/${paper.id}`)}
                  data-paper-link
                >
                  {paper.title}
                </a>
              </div>
              <div className="px-4 h-full flex flex-col">
                <p className="m-0  font-extrabold uppercase tracking-wide text-accent">
                  {paperTypeToNameMap[paper.presentationLabel.toLowerCase()] ||
                    paper.presentationLabel}
                </p>
                {paper.award && (
                  <p className="m-0 text-sm font-bold leading-snug text-secondary-700">
                    Award: {paper.award}
                  </p>
                )}

                <p className="m-0 text-sm leading-snug text-gray-700">
                  {paper.authorNames.length > 0
                    ? paper.authorNames.map((authorName, authorIndex) => (
                        <span key={`${paper.id}-${authorName}-${authorIndex}`}>
                          {authorIndex > 0 && <span>, </span>}
                          <a
                            className="text-primary underline decoration-primary-200 decoration-dotted underline-offset-3 hover:text-primary-700 focus-visible:text-primary-700"
                            href={withBaseURL(
                              `/program/papers?filter=authors&search=${encodeURIComponent(authorName)}`,
                            )}
                          >
                            {authorName}
                          </a>
                        </span>
                      ))
                    : "Author list unavailable"}
                </p>

                <p className="m-0 mt-auto text-sm font-bold leading-snug text-primary-800 float-bottom">
                  {paper.sessionUrl ? (
                    <a
                      className="text-primary underline decoration-primary-200 decoration-dotted underline-offset-3 hover:text-primary-700 focus-visible:text-primary-700"
                      href={paper.sessionUrl}
                      data-visit-link
                    >
                      {paper.scheduleLabel}
                    </a>
                  ) : (
                    paper.scheduleLabel
                  )}
                </p>

                <p className="hidden">{paper.abstractText}</p>
              </div>
            </article>
          );
        })}
      </div>

      <p
        id="papers-empty"
        className="m-0 rounded-lg border border-dashed border-gray-400 bg-white p-4 text-center font-semibold text-gray-700"
        hidden={filteredAndSorted.length > 0}
      >
        No papers match the current filters.
      </p>
    </section>
  );
}
