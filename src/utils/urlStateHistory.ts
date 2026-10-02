/**
 * Mirrors client-side filter state into the query string so that views can be
 * linked to and the Back/Forward buttons step through them.
 *
 * Each distinct change pushes a history entry. Changes tagged with the same
 * `burst` key in quick succession (e.g. keystrokes in a search box) are folded
 * into a single entry so typing a word doesn't take a dozen Back presses.
 */
const BURST_IDLE_MS = 1000;

export type UrlStateWriteOptions = {
  /** Overwrite the current entry instead of adding one (e.g. on page load). */
  replace?: boolean;
  /** Fold consecutive writes with the same key into one history entry. */
  burst?: string;
};

export function createUrlStateHistory(
  restore: (params: URLSearchParams) => void,
) {
  let activeBurst: string | null = null;
  let burstTimer: ReturnType<typeof setTimeout> | undefined;
  let restoring = false;

  window.addEventListener("popstate", () => {
    activeBurst = null;
    restoring = true;
    try {
      restore(new URLSearchParams(window.location.search));
    } finally {
      restoring = false;
    }
  });

  const write = (
    params: URLSearchParams,
    options: UrlStateWriteOptions = {},
  ) => {
    // Re-rendering after Back/Forward must not add new entries.
    if (restoring) return;

    const { pathname, search, hash } = window.location;
    const query = params.toString();
    const nextUrl = `${pathname}${query ? `?${query}` : ""}${hash}`;
    const isContinuingBurst =
      options.burst !== undefined && options.burst === activeBurst;

    if (nextUrl !== `${pathname}${search}${hash}`) {
      if (options.replace || isContinuingBurst) {
        history.replaceState(history.state, "", nextUrl);
      } else {
        history.pushState(null, "", nextUrl);
      }
    }

    clearTimeout(burstTimer);
    activeBurst = options.burst ?? null;
    if (activeBurst !== null) {
      burstTimer = setTimeout(() => {
        activeBurst = null;
      }, BURST_IDLE_MS);
    }
  };

  return { write };
}
