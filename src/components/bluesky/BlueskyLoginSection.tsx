/**
 * Log in to or out of Bluesky (`useBlueskySession`), shared by the account
 * page and the paper-page discussions so both look and behave the same. The
 * session lives in the browser, so logging in at either one logs the reader
 * in at the other too.
 *
 * The caller owns the session hook and the sign-in (each returns the reader to
 * its own page), and decides whether to offer saving the logged-in account's
 * handle to the VIS profile.
 */

import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { BLUESKY_ENTRYWAY } from "./oauth";
import {
  disabledButtonStyle,
  errorTextStyle,
  hintTextStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "./styles";
import type { BlueskyLoginState } from "./useBlueskySession";
import { normalizeBskyHandle } from "../../utils/bskyHandle";
import { ExperimentalHeading } from "../ExperimentalBadge";

interface BlueskyLoginSectionProps {
  bluesky: BlueskyLoginState;
  /** The handle on the reader's VIS profile, for one-click "Log in as". */
  linkedHandle?: string | null;
  /** Start the login, with a handle or a server URL. */
  onSignIn: (input: string) => void;
  /**
   * Offer to save the logged-in account to the VIS profile when it differs
   * from `linkedHandle`. Leave out to not offer it here.
   */
  onSaveHandle?: (handle: string) => void;
  saveDisabled?: boolean;
  headingLevel?: "h2" | "h3";
  /** Draw the dashed box (the discussion) or a plain section (the account page). */
  boxed?: boolean;
  /** More of the section, below the login (the account page's handle). */
  children?: ReactNode;
}

export default function BlueskyLoginSection({
  bluesky,
  linkedHandle,
  onSignIn,
  onSaveHandle,
  saveDisabled = false,
  headingLevel = "h2",
  boxed = true,
  children,
}: BlueskyLoginSectionProps) {
  const headingId = useId();
  const loggedInHandle =
    bluesky.session.status === "signed-in"
      ? normalizeBskyHandle(bluesky.session.writer.profile.handle)
      : null;

  return (
    <section aria-labelledby={headingId} style={boxed ? boxStyle : undefined}>
      <ExperimentalHeading as={headingLevel} id={headingId}>
        Bluesky sign-in
      </ExperimentalHeading>
      {loggedInHandle ? (
        <>
          <p
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem 0.75rem",
            }}
          >
            <span>You are signed in to Bluesky as @{loggedInHandle}.</span>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => void bluesky.signOut()}
            >
              Sign out of Bluesky
            </button>
          </p>
          {onSaveHandle && loggedInHandle !== linkedHandle && (
            <p style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button
                type="button"
                disabled={saveDisabled}
                style={saveDisabled ? disabledButtonStyle : primaryButtonStyle}
                onClick={() => onSaveHandle(loggedInHandle)}
              >
                Save @{loggedInHandle} to your profile
              </button>
            </p>
          )}
        </>
      ) : bluesky.session.status === "none" ? (
        <>
          {!linkedHandle && (
            <p className="mb-0 font-bold">Do you have a Bluesky account?</p>
          )}
          <p style={hintTextStyle}>
            Sign in to comment and like from your own account instead of as a
            VIS attendee.
          </p>
          <p style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {linkedHandle && (
              <button
                type="button"
                disabled={bluesky.busy}
                style={primaryButtonStyle}
                onClick={() => onSignIn(linkedHandle)}
              >
                {bluesky.busy
                  ? "Opening Bluesky…"
                  : `Sign in as @${linkedHandle}`}
              </button>
            )}
            <button
              type="button"
              disabled={bluesky.busy}
              style={linkedHandle ? secondaryButtonStyle : primaryButtonStyle}
              onClick={() => onSignIn(BLUESKY_ENTRYWAY)}
            >
              {linkedHandle ? "Use another account" : "Sign in with Bluesky"}
            </button>
          </p>
          {bluesky.error && <p style={errorTextStyle}>{bluesky.error}</p>}
        </>
      ) : (
        <p style={hintTextStyle}>Checking your Bluesky sign-in…</p>
      )}
      {children}
    </section>
  );
}

/** The box of the site's other sign-in prompt (AuthGate), so the two match. */
const boxStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  border: "1px dashed var(--color-gray-400)",
  borderRadius: "6px",
  backgroundColor: "var(--color-gray-100)",
  color: "var(--color-gray-800)",
  fontSize: "0.9rem",
};
