/**
 * Feature flags for the IEEE VIS website
 * Control which features are enabled/disabled
 */

export const features = {
  weekOfVis: {
    enabled: true,
    sourceType:
      //
      // "localTest",
      "prod",
    // The prod sources are raw table dumps (see src/scripts/get-data.sh); the
    // session/event/room/timeblock/slot files are merged into a program by
    // fetchAllSessions. The localTest sources are a previous year's already
    // merged program, so only paper/session/poster are present there.
    prodSource: {
      paper: "/src/data/program/paper_list.json",
      session: "/src/data/program/session_list.json",
      poster: "/src/data/program/poster_list.json",
      event: "/src/data/program/event_list.json",
      room: "/src/data/program/room_list.json",
      timeblock: "/src/data/program/timeblock_list.json",
      slot: "/src/data/program/slot_list.json",
    },
    localTestSources: {
      paper: "/src/data/program_test/paper_list.json",
      session: "/src/data/program_test/session_list.json",
      poster: "/src/data/program_test/poster_list.json",
      event: "/src/data/program_test/event_list.json",
      room: "/src/data/program_test/room_list.json",
      timeblock: "/src/data/program_test/timeblock_list.json",
      slot: "/src/data/program_test/slot_list.json",
    },
  },

  /**
   * Explicit path overrides that are active even if their parent folder is
   * listed in `inactivePathPrefixes`. These are checked first, so a match here
   * always wins and the page is served normally.
   *
   * Use exact paths (no trailing slash), e.g.:
   *   "/info/awards/best-paper-awards"
   */
  activePathOverrides: [
    // "/info/invited-speakers/keynote-speaker",
    // "/info/awards/best-paper-awards",
  ],

  /**
   * Inactive path prefixes (relative to the site base, without trailing slash).
   * Any URL whose path starts with one of these prefixes will be redirected to
   * the home page with a 302 (temporary) redirect until the content is ready.
   * Individual pages within an inactive folder can be re-enabled via
   * `activePathOverrides` above.
   *
   * Examples of matching paths for "/info/awards":
   *   /info/awards
   *   /info/awards/best-paper-awards
   */
  inactivePathPrefixes: [
    "/info/awards",
    // "/info/invited-speakers",
    "/info/local-events",
    "/info/plenary",
    // "/info/presenter-information",
    // "/info/program",
    // "/info/registration-and-travel",
    "/info/social-events",
    "/info/visinpractice/",
    // for working on the program pages, we want to disable the program page until it's ready
    // "/program",
  ],
} as const;

export type Features = typeof features;

/**
 * Strips the configured base path (e.g. "/year/2026") from a pathname so
 * `inactivePathPrefixes`/`activePathOverrides` can be written as plain paths
 * regardless of deployment base.
 */
export function stripBaseURL(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return pathname.startsWith(base)
    ? pathname.slice(base.length) || "/"
    : pathname;
}

/**
 * Whether a path (already stripped of the base URL, see `stripBaseURL`) is
 * disabled per the allow-list and should be hidden from navigation, search
 * results, etc.
 */
export function isPathInactive(pathWithoutBase: string): boolean {
  const isOverridden = (
    features.activePathOverrides as readonly string[]
  ).includes(pathWithoutBase);

  if (isOverridden) {
    return false;
  }

  return features.inactivePathPrefixes.some(
    (prefix) =>
      pathWithoutBase === prefix || pathWithoutBase.startsWith(prefix + "/"),
  );
}
