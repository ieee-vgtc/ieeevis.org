import { useEffect, useRef, useState } from "react";
import { isPathInactive } from "../config/pages-allow-list";
import { withBaseURL } from "../utils/withBaseURL";

type SearchResult = {
  url: string;
  excerpt: string;
  meta: {
    title?: string;
    image?: string;
  };
};

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
    /* @vite-ignore */ `${import.meta.env.BASE_URL}pagefind/pagefind.js`
  )) as NonNullable<Window["pagefind"]>;

  window.pagefind = pagefind;

  return pagefind;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const timeout = useRef<number>();

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
        setResults(data.filter((result) => !isPathInactive(result.url)));
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => window.clearTimeout(timeout.current);
  }, [query]);

  const showDropdown = query.trim().length >= 2;

  return (
    <div className="w-full py-4 border-b-2 border-primary-200 px-8 md:border-0 md:py-6 md:px-2 lg:py-6 lg:px-4 md:w-56 md:flex md:items-center">
      <div className="relative w-full">
        <i className="material-icons pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg! text-gray-400">
          search
        </i>

        <input
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full bg-white py-2 pl-8 pr-3 text-sm text-secondary placeholder-gray-400 outline-none ring-1 ring-primary-200 focus:ring-2 focus:ring-primary"
        />

        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg bg-white text-left shadow-lg ring-1 ring-black/5 md:w-80">
            {loading && (
              <p className="px-4 py-3 text-sm text-gray-500">Searching…</p>
            )}

            {!loading && results.length === 0 && (
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
