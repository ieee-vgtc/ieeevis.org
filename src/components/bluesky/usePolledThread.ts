/**
 * Polls a thread and keeps the last good answer on screen.
 *
 * The loading flag is only ever true before the first answer arrives, so a
 * refresh never blanks the thread. Failures back off exponentially and are
 * reported as a note beside the stale data rather than replacing it. Polling
 * pauses while the tab is hidden and catches up as soon as it is shown again —
 * a session room full of open paper pages should not poll all afternoon.
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface PolledThreadOptions<T> {
  /** Must be stable (`useCallback`); a new identity restarts the polling. */
  load: (signal: AbortSignal, fresh: boolean) => Promise<T>;
  /** 0 loads once and never refreshes. */
  refreshMs: number;
  pauseWhenHidden?: boolean;
  maxBackoffMs?: number;
}

interface PolledThread<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** `fresh` skips the backoff wait and asks for an uncached answer. */
  refresh: (fresh?: boolean) => Promise<void>;
}

export function usePolledThread<T>({
  load,
  refreshMs,
  pauseWhenHidden = true,
  maxBackoffMs = 300_000,
}: PolledThreadOptions<T>): PolledThread<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedOnceRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const nextRequestAtRef = useRef(0);
  const refreshRef = useRef<(fresh?: boolean) => Promise<void>>(async () => {});

  useEffect(() => {
    let disposed = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let controller: AbortController | null = null;
    let isFetching = false;

    async function refresh(fresh = false) {
      if (disposed || isFetching) {
        return;
      }
      if (!fresh && Date.now() < nextRequestAtRef.current) {
        return;
      }

      isFetching = true;
      const showLoading = !hasLoadedOnceRef.current;
      if (showLoading) {
        setLoading(true);
      }
      controller = new AbortController();

      try {
        const result = await load(controller.signal, fresh);
        if (disposed) {
          return;
        }

        setData(result);
        hasLoadedOnceRef.current = true;
        consecutiveFailuresRef.current = 0;
        nextRequestAtRef.current = 0;
        setError(null);
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
        if (!disposed && showLoading) {
          setLoading(false);
        }
        isFetching = false;
        controller = null;
      }
    }

    refreshRef.current = refresh;
    void refresh();

    if (refreshMs > 0) {
      intervalId = setInterval(() => {
        if (pauseWhenHidden && document.visibilityState !== "visible") {
          return;
        }
        void refresh();
      }, refreshMs);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }

    if (pauseWhenHidden) {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      disposed = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (pauseWhenHidden) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      controller?.abort();
    };
  }, [load, maxBackoffMs, pauseWhenHidden, refreshMs]);

  const refresh = useCallback((fresh = false) => refreshRef.current(fresh), []);

  return { data, loading, error, refresh };
}
