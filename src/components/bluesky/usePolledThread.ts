/**
 * Polls a thread and keeps the last good answer on screen.
 *
 * The loading flag is only ever true before the first answer arrives, so a
 * refresh never blanks the thread. Failures back off exponentially and are
 * reported as a note beside the stale data rather than replacing it.
 *
 * Polling is gated three ways so a session room full of open paper pages does
 * not poll all afternoon:
 *
 *   - It pauses while the tab is hidden and refetches the moment it is shown.
 *   - It pauses while the discussion is scrolled out of view (an
 *     IntersectionObserver on the section) and refetches when it returns.
 *   - While visible and on-screen it polls at the base interval, but the
 *     interval grows (5s → 10s → … → ~120s) across polls that bring no new
 *     content and no user activity, and snaps back to the base interval the
 *     instant content changes, the reader interacts, or the section becomes
 *     visible again.
 *
 * The content/activity backoff and the consecutive-failure backoff are separate
 * mechanisms: the first sets the cadence, the second holds off after an error.
 */

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `force` is the reader asking: it jumps the backoff wait and supersedes a poll
 * in flight. `uncached` is a read-after-write: only it may skip the shared
 * server cache, which otherwise runs the page ahead of what every other reader
 * can see.
 */
interface RefreshOptions {
  force?: boolean;
  uncached?: boolean;
}

interface PolledThreadOptions<T> {
  /** Must be stable (`useCallback`); a new identity restarts the polling. */
  load: (signal: AbortSignal, uncached: boolean) => Promise<T>;
  /** Base interval, in ms. 0 loads once and never refreshes. */
  refreshMs: number;
  pauseWhenHidden?: boolean;
  /** Cap for the consecutive-failure backoff. */
  maxBackoffMs?: number;
  /** Cap for the no-new-content inactivity backoff. */
  maxInactiveMs?: number;
  /**
   * Fingerprint of a result, used to tell a poll that changed something from
   * one that did not. A changed fingerprint resets the interval to the base.
   */
  signature?: (data: T) => string;
}

interface PolledThread<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: RefreshOptions) => Promise<void>;
  /** ms timestamp of the last successful fetch, or null before the first. */
  lastUpdatedAt: number | null;
  /** Attach to the section element to gate polling on its visibility. */
  sectionRef: (element: Element | null) => void;
  /** Reader touched the section: reset the interval to the base. */
  markInteraction: () => void;
}

/** Doublings are clamped here; `maxInactiveMs` still caps the actual wait. */
const MAX_INACTIVE_LEVEL = 8;

export function usePolledThread<T>({
  load,
  refreshMs,
  pauseWhenHidden = true,
  maxBackoffMs = 300_000,
  maxInactiveMs = 120_000,
  signature,
}: PolledThreadOptions<T>): PolledThread<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const hasLoadedOnceRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const nextRequestAtRef = useRef(0);
  const lastSignatureRef = useRef<string | null>(null);
  const refreshRef = useRef<(options?: RefreshOptions) => Promise<void>>(
    async () => {},
  );
  const markInteractionRef = useRef<() => void>(() => {});

  // On-screen truth shared between the observer (which writes it) and the
  // polling effect (which reads it in `canPoll`). Defaults to true so polling
  // works even when no section element is attached.
  const onScreenRef = useRef(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onScreenChangeRef = useRef<((onScreen: boolean) => void) | null>(null);

  const sectionRef = useCallback((element: Element | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Start a little before the section reaches the viewport so content is
        // fresh by the time the reader gets to it.
        const onScreen = entries.some((entry) => entry.isIntersecting);
        onScreenRef.current = onScreen;
        onScreenChangeRef.current?.(onScreen);
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(element);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    let disposed = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;
    let isFetching = false;
    let inactiveLevel = 0;
    // A superseded fetch must not clear state owned by its replacement.
    let requestId = 0;

    function isVisible() {
      return !pauseWhenHidden || document.visibilityState === "visible";
    }
    function canPoll() {
      return isVisible() && onScreenRef.current;
    }

    function inactiveIntervalMs() {
      return Math.min(refreshMs * 2 ** inactiveLevel, maxInactiveMs);
    }

    function clearTimer() {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    }

    function scheduleNext() {
      clearTimer();
      if (disposed || refreshMs <= 0 || !canPoll()) {
        return;
      }
      // Honour the error backoff too: whichever wait is longer wins.
      const backoffWait = nextRequestAtRef.current - Date.now();
      const delay = Math.max(inactiveIntervalMs(), backoffWait, 0);
      timerId = setTimeout(onTick, delay);
    }

    async function onTick() {
      timerId = null;
      if (canPoll()) {
        await refresh();
      }
      scheduleNext();
    }

    async function refresh({ force, uncached }: RefreshOptions = {}) {
      if (disposed) {
        return;
      }
      // A reader's own refresh supersedes a poll in flight rather than being
      // dropped, so the click always produces an answer.
      if (isFetching) {
        if (!force) {
          return;
        }
        controller?.abort();
      }
      if (!force && Date.now() < nextRequestAtRef.current) {
        return;
      }

      const id = ++requestId;
      isFetching = true;
      const showLoading = !hasLoadedOnceRef.current;
      if (showLoading) {
        setLoading(true);
      }
      controller = new AbortController();

      try {
        const result = await load(controller.signal, Boolean(uncached));
        if (disposed) {
          return;
        }

        const firstLoad = !hasLoadedOnceRef.current;
        const nextSignature = signature ? signature(result) : null;
        const changed =
          nextSignature !== null &&
          lastSignatureRef.current !== null &&
          nextSignature !== lastSignatureRef.current;
        if (nextSignature !== null) {
          lastSignatureRef.current = nextSignature;
        }

        setData(result);
        hasLoadedOnceRef.current = true;
        consecutiveFailuresRef.current = 0;
        nextRequestAtRef.current = 0;
        setError(null);
        setLastUpdatedAt(Date.now());

        // A reader's own refresh counts as activity, so it resets the cadence.
        if (firstLoad || changed || force) {
          inactiveLevel = 0;
        } else {
          inactiveLevel = Math.min(inactiveLevel + 1, MAX_INACTIVE_LEVEL);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError" || disposed) {
          return;
        }

        consecutiveFailuresRef.current += 1;
        const backoffMs = Math.min(
          refreshMs * 2 ** (consecutiveFailuresRef.current - 1),
          maxBackoffMs,
        );
        nextRequestAtRef.current = Date.now() + backoffMs;

        const message = (err as Error).message || "Could not load the thread.";
        setError(
          hasLoadedOnceRef.current
            ? `Live updates paused (${message}). Retrying in ${Math.ceil(backoffMs / 1000)}s.`
            : message,
        );
      } finally {
        if (id === requestId) {
          if (!disposed && showLoading) {
            setLoading(false);
          }
          isFetching = false;
          controller = null;
        }
      }
    }

    // Reset the cadence and refetch straight away — used when the section
    // becomes visible or scrolls back into view.
    function resumeNow() {
      if (disposed) {
        return;
      }
      inactiveLevel = 0;
      clearTimer();
      void refresh();
      scheduleNext();
    }

    refreshRef.current = refresh;
    // A reader interaction resets the cadence without forcing a fetch.
    markInteractionRef.current = () => {
      inactiveLevel = 0;
      scheduleNext();
    };
    onScreenChangeRef.current = (onScreen) => {
      if (onScreen) {
        resumeNow();
      } else {
        clearTimer();
      }
    };

    // The first load is never gated on visibility, so the thread is ready to
    // show the moment the reader arrives.
    void refresh();
    scheduleNext();

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        resumeNow();
      } else {
        clearTimer();
      }
    }

    if (pauseWhenHidden) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      disposed = true;
      clearTimer();
      if (pauseWhenHidden) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      onScreenChangeRef.current = null;
      controller?.abort();
    };
  }, [
    load,
    maxBackoffMs,
    maxInactiveMs,
    pauseWhenHidden,
    refreshMs,
    signature,
  ]);

  const refresh = useCallback(
    (options?: RefreshOptions) => refreshRef.current(options),
    [],
  );
  const markInteraction = useCallback(() => markInteractionRef.current(), []);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdatedAt,
    sectionRef,
    markInteraction,
  };
}
