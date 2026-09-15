/**
 * The reader's Bluesky login, for a discussion on the page.
 *
 * Starts as "unknown" on both server and client so the first render agrees,
 * then either settles on "none" — nothing stored, so nothing to load — or
 * restores the stored session as a writer for the account. A session that
 * cannot be restored (revoked, expired past refresh, Bluesky unreachable)
 * counts as none: the reader is simply offered the login again.
 */

import { useCallback, useEffect, useState } from "react";
import type { OAuthSession } from "@atproto/oauth-client-browser";
import type { NativeWriter } from "./native";
import { restoreWriter } from "./native";
import { hasStoredSession, restoreSession, startLogin } from "./oauth";

export type BlueskySession =
  | { status: "unknown" }
  | { status: "none" }
  | { status: "restoring" }
  | { status: "signed-in"; session: OAuthSession; writer: NativeWriter };

export interface BlueskyLoginState {
  session: BlueskySession;
  /** A login attempt is under way (resolving the handle, then navigating). */
  busy: boolean;
  error: string | null;
  /**
   * Send the reader to log in, at a server URL or as a handle; `returnTo` is
   * where they come back.
   */
  signIn: (input: string, returnTo: string) => Promise<void>;
  signOut: () => Promise<void>;
}

function loginErrorMessage(err: unknown): string {
  const message = (err as Error)?.message || "";
  if (/resolve|handle|not found|invalid/i.test(message)) {
    return "That Bluesky handle could not be found. Check it and try again.";
  }
  return "Bluesky could not be reached. You can still comment as a VIS attendee.";
}

export function useBlueskySession(): BlueskyLoginState {
  const [session, setSession] = useState<BlueskySession>({
    status: "unknown",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasStoredSession()) {
      setSession({ status: "none" });
      return;
    }

    let cancelled = false;
    setSession({ status: "restoring" });
    void (async () => {
      try {
        const [restored, writer] = await Promise.all([
          restoreSession(),
          restoreWriter(),
        ]);
        if (cancelled) {
          return;
        }
        setSession(
          restored && writer
            ? { status: "signed-in", session: restored, writer }
            : { status: "none" },
        );
      } catch (err) {
        console.warn("Could not restore the Bluesky session:", err);
        if (!cancelled) setSession({ status: "none" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (input: string, returnTo: string) => {
    setBusy(true);
    setError(null);
    try {
      await startLogin(input, returnTo);
    } catch (err) {
      setError(loginErrorMessage(err));
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (session.status !== "signed-in") {
      return;
    }
    setError(null);
    try {
      await session.session.signOut();
    } catch (err) {
      // The local session is gone either way; a failed revoke only leaves a
      // token Bluesky will expire on its own.
      console.warn("Bluesky sign-out did not complete:", err);
    }
    setSession({ status: "none" });
  }, [session]);

  return { session, busy, error, signIn, signOut };
}
