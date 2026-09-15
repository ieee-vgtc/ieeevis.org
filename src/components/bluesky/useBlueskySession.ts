/**
 * The reader's Bluesky login, for a discussion on the page.
 *
 * Starts as "unknown" on both server and client so the first render agrees,
 * then either settles on "none" — nothing stored, so nothing to load — or
 * restores the stored session and reads the account's profile, which is what
 * the composer signs comments with. A session that cannot be restored (revoked,
 * expired past refresh, Bluesky unreachable) counts as none: the reader is
 * simply offered the login again.
 */

import { useCallback, useEffect, useState } from "react";
import type { Agent } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-browser";
import type { BlueskyProfile } from "./native";
import { createAgent, fetchProfile } from "./native";
import { hasStoredSession, restoreSession, startLogin } from "./oauth";

export type BlueskySession =
  | { status: "unknown" }
  | { status: "none" }
  | { status: "restoring" }
  | {
      status: "signed-in";
      session: OAuthSession;
      agent: Agent;
      profile: BlueskyProfile;
    };

export interface BlueskyLoginState {
  session: BlueskySession;
  /** A login attempt is under way (resolving the handle, then navigating). */
  busy: boolean;
  error: string | null;
  /** Send the reader to Bluesky to log in; `returnTo` is where they come back. */
  signIn: (handle: string, returnTo: string) => Promise<void>;
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
        const restored = await restoreSession();
        if (!restored) {
          if (!cancelled) setSession({ status: "none" });
          return;
        }
        const agent = await createAgent(restored);
        const profile = await fetchProfile(agent, restored.did);
        if (!cancelled) {
          setSession({
            status: "signed-in",
            session: restored,
            agent,
            profile,
          });
        }
      } catch (err) {
        console.warn("Could not restore the Bluesky session:", err);
        if (!cancelled) setSession({ status: "none" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (handle: string, returnTo: string) => {
    setBusy(true);
    setError(null);
    try {
      await startLogin(handle, returnTo);
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
