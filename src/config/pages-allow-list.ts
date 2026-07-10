/**
 * Feature flags for the IEEE VIS website
 * Control which features are enabled/disabled
 */

export const features = {
  weekOfVis: {
    enabled: false,
    showcaseEnabled: false,
    useLocalSources: true,
    sources: {
      paper:
        "https://raw.githubusercontent.com/ieee-vgtc/vis-virtual-website/vis2025/sitedata/2025/paper_list.json",
      session:
        "https://raw.githubusercontent.com/ieee-vgtc/vis-virtual-website/vis2025/sitedata/2025/session_list.json",
      poster:
        "https://raw.githubusercontent.com/ieee-vgtc/vis-virtual-website/vis2025/sitedata/2025/poster_list.json",
    },
    localSources: {
      paper: "/src/data/program_test/paper_list.json",
      session: "/src/data/program_test/session_list.json",
      poster: "/src/data/program_test/poster_list.json",
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
    // for working on the program pages, we want to disable the program page until it's ready
    "/program",
  ],
} as const;

export type Features = typeof features;
