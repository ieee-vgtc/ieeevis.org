import fs from "node:fs";
import path from "node:path";

/**
 * Maps a rendered URL pathname back to the file under src/pages that produced
 * it, so the footer's "file a bug" / "suggest a fix" links point at a file that
 * actually exists on GitHub.
 *
 * This has to be looked up rather than guessed: pages are backed by .astro as
 * well as .md files, and directory routes such as /blog come from
 * src/pages/blog/index.astro rather than src/pages/blog.md.
 *
 * The page list is read off disk rather than with import.meta.glob on purpose.
 * A glob would make every page a dependency of this module -- and so of
 * DefaultLayout -- which in dev leaks each page's scoped <style> into every
 * other page. src/pages/index.astro sets `html { display: none }` to hide its
 * redirect stub, so that leak blanks the entire site.
 */

const PAGES_DIR = path.join("src", "pages");
const PAGE_EXTENSIONS = new Set([".astro", ".md", ".mdx", ".html"]);

function collect_page_files(dir: string, root: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entry_path = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collect_page_files(entry_path, root));
    } else if (PAGE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(path.relative(root, entry_path).split(path.sep).join("/"));
    }
  }
  return files;
}

/** src/pages/blog/index.astro -> /blog, src/pages/index.astro -> / */
function route_for_page_file(file_path: string): string {
  const route = file_path
    .slice("src/pages".length)
    .replace(/\.(astro|md|mdx|html)$/, "")
    .replace(/\/index$/, "");
  return route === "" ? "/" : route;
}

let cached_routes: Map<string, string> | null = null;

function route_map(): Map<string, string> {
  // Re-read in dev so pages added while the server is running are picked up.
  if (cached_routes && import.meta.env.PROD) {
    return cached_routes;
  }
  const root = process.cwd();
  const pages_dir = path.join(root, PAGES_DIR);
  const routes = new Map<string, string>();
  if (fs.existsSync(pages_dir)) {
    for (const file_path of collect_page_files(pages_dir, root)) {
      routes.set(route_for_page_file(file_path), file_path);
    }
  }
  cached_routes = routes;
  return routes;
}

/** Strip the configured base path and any trailing slash off a pathname. */
function normalize_route(pathname: string): string {
  let base = import.meta.env.BASE_URL || "/";
  if (!base.startsWith("/")) {
    base = `/${base}`;
  }
  base = base.replace(/\/+$/, "");

  let route = pathname.trim().replace(/\/+/g, "/");
  if (base && (route === base || route.startsWith(`${base}/`))) {
    route = route.slice(base.length);
  }
  route = route.replace(/\/+$/, "");
  return route === "" ? "/" : route;
}

/** Match a route like /program/paper/v-full-1234 against /program/paper/[paperId]. */
function matches_dynamic_route(
  candidate_segments: string[],
  segments: string[],
): boolean {
  for (let i = 0; i < candidate_segments.length; i++) {
    const candidate = candidate_segments[i];
    if (candidate.startsWith("[...")) {
      // A rest parameter swallows every remaining segment (possibly none).
      return true;
    }
    if (i >= segments.length) {
      return false;
    }
    if (candidate.startsWith("[")) {
      continue;
    }
    if (candidate !== segments[i]) {
      return false;
    }
  }
  return candidate_segments.length === segments.length;
}

/**
 * Returns the repo-relative source file for a pathname (e.g.
 * "src/pages/blog/index.astro"), or null when no page file produced it.
 */
export function source_file_for_pathname(pathname: string): string | null {
  const routes = route_map();
  const route = normalize_route(pathname);

  const exact = routes.get(route);
  if (exact) {
    return exact;
  }

  const segments = route.split("/").filter(Boolean);
  for (const [candidate, file_path] of routes) {
    const candidate_segments = candidate.split("/").filter(Boolean);
    if (!candidate_segments.some((segment) => segment.startsWith("["))) {
      continue;
    }
    if (matches_dynamic_route(candidate_segments, segments)) {
      return file_path;
    }
  }

  return null;
}
