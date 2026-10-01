import { useEffect, useMemo, useRef, useState } from "react";
import { isPathInactive, stripBaseURL } from "../config/pages-allow-list";
import { withBaseURL } from "../utils/withBaseURL";

type SearchResult = {
  url: string;
  excerpt: string;
  meta: {
    title?: string;
    image?: string;
  };
};

export type ExternalSearchLink = {
  text: string;
  url: string;
  description?: string;
  // Extra text to match against (e.g. the nav headings it appears under).
  keywords: string;
};

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, " ");

function matchExternalLinks(links: ExternalSearchLink[], query: string) {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  return links.filter((link) => {
    const haystack = normalize(
      `${link.text} ${link.description ?? ""} ${link.keywords}`,
    );
    return terms.every((term) => haystack.includes(term));
  });
}

declare global {
  interface Window {
    pagefind?: {
      search(query: string): Promise<{
        results: {
          data(): Promise<SearchResult>;
        }[];
      }>;
    };
  }
}

async function loadPagefind() {
  if (window.pagefind) {
    return window.pagefind;
  }

  // Pagefind's bundle is an ES module (it relies on `import.meta.url` to
  // locate its wasm/index chunks), so it must be loaded via dynamic
  // `import()` rather than a plain <script> tag.
  const pagefind = (await import(
    /* @vite-ignore */ `${import.meta.env.BASE_URL}/pagefind/pagefind.js`
    // /* @vite-ignore */ `${import.meta.env.BASE_URL}pagefind/pagefind.js`
  )) as NonNullable<Window["pagefind"]>;

  window.pagefind = pagefind;

  return pagefind;
}

export default function Search({
  externalLinks = [],
}: {
  externalLinks?: ExternalSearchLink[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timeout = useRef<number | undefined>(undefined);

  const closeAndRestoreFocus = () => {
    setIsExpanded(false);

    if (window.matchMedia("(min-width: 768px)").matches) {
      window.requestAnimationFrame(() => trigger.current?.focus());
    }
  };

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    input.current?.focus();

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isExpanded]);

  useEffect(() => {
    window.clearTimeout(timeout.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    timeout.current = window.setTimeout(async () => {
      setLoading(true);

      try {
        const pagefind = await loadPagefind();

        if (!pagefind) {
          return;
        }

        const search = await pagefind.search(query);

        const data = await Promise.all(search.results.map((r) => r.data()));

        // Pagefind indexes the raw build output, so it has no notion of the
        // allow-list `middleware.ts` enforces at request time — filter those
        // pages out here so disabled/inactive pages don't surface in search.
        setResults(
          data.filter((result) => !isPathInactive(stripBaseURL(result.url))),
        );
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => window.clearTimeout(timeout.current);
  }, [query]);

  const showDropdown = query.trim().length >= 2;

  const externalResults = useMemo(
    () => (showDropdown ? matchExternalLinks(externalLinks, query) : []),
    [externalLinks, query, showDropdown],
  );

  return (
    <div
      ref={container}
      className="flex min-w-0 flex-1 justify-end py-3 pl-8 pr-2 md:w-auto md:flex-none md:items-center md:px-2 lg:pl-4"
    >
      {!isExpanded && (
        <button
          ref={trigger}
          type="button"
          className="hidden size-11 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex"
          aria-label="Open search"
          aria-expanded="false"
          aria-controls="site-search-input"
          onClick={() => setIsExpanded(true)}
        >
          <i className="material-icons" aria-hidden="true">
            search
          </i>
        </button>
      )}

      <div
        className={`relative w-full md:w-56 ${isExpanded ? "" : "md:hidden"}`}
      >
        <i
          className="material-icons pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg! text-gray-400"
          aria-hidden="true"
        >
          search
        </i>

        <input
          ref={input}
          id="site-search-input"
          type="search"
          aria-label="Search the site"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              closeAndRestoreFocus();
            }
          }}
          className="w-full rounded-full bg-white py-2 pl-8 pr-3 text-sm text-secondary placeholder-gray-400 outline-none ring-1 ring-primary-200 focus:ring-2 focus:ring-primary"
        />

        {showDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg bg-white text-left shadow-lg ring-1 ring-black/5 md:w-80">
            {externalResults.length > 0 && (
              <div className="border-b border-gray-200">
                <p className="px-4 pt-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Related sites
                </p>
                <ul className="divide-y divide-gray-100">
                  {externalResults.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 hover:bg-gray-100"
                      >
                        <strong className="block text-sm font-bold tracking-wide text-secondary">
                          {link.text}{" "}
                          <i
                            className="material-icons align-middle text-sm!"
                            aria-label="(opens external site)"
                          >
                            open_in_new
                          </i>
                        </strong>

                        {link.description && (
                          <span className="mt-1 block text-sm text-gray-600">
                            {link.description}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {loading && (
              <p className="px-4 py-3 text-sm text-gray-500">Searching…</p>
            )}

            {!loading &&
              results.length === 0 &&
              externalResults.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-500">
                  No results found.
                </p>
              )}

            {!loading && results.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {results.map((result) => (
                  <li key={result.url}>
                    <a
                      href={withBaseURL(result.url)}
                      className="block px-4 py-3 hover:bg-gray-100"
                    >
                      <strong className="block text-sm font-bold tracking-wide text-secondary">
                        {result.meta.title ?? result.url}
                      </strong>

                      <span
                        className="search-excerpt mt-1 block text-sm text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: result.excerpt,
                        }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
