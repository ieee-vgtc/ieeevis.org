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
import ExperimentalBadge from "../ExperimentalBadge";

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
  /** Draw the tinted box (the discussion) or a plain section (the account page). */
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
  headingLevel: Heading = "h2",
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
      <Heading id={headingId} className="font-bold">
        Bluesky login
      </Heading>
      <ExperimentalBadge />
      {loggedInHandle ? (
        <>
          <p>You are logged in to Bluesky as @{loggedInHandle}.</p>
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
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={() => void bluesky.signOut()}
          >
            Log out of Bluesky
          </button>
        </>
      ) : bluesky.session.status === "none" ? (
        <>
          <p className="mb-0 font-bold">
            {linkedHandle
              ? `You have a Bluesky account, @${linkedHandle}.`
              : "Do you have a Bluesky account?"}
          </p>
          <p style={hintTextStyle}>
            Log in to comment and like from your own account instead of as a VIS
            attendee.
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
                  : `Log in as @${linkedHandle}`}
              </button>
            )}
            <button
              type="button"
              disabled={bluesky.busy}
              style={linkedHandle ? secondaryButtonStyle : primaryButtonStyle}
              onClick={() => onSignIn(BLUESKY_ENTRYWAY)}
            >
              {linkedHandle ? "Use another account" : "Log in with Bluesky"}
            </button>
          </p>
          {bluesky.error && <p style={errorTextStyle}>{bluesky.error}</p>}
        </>
      ) : (
        <p style={hintTextStyle}>Checking your Bluesky login…</p>
      )}
      {children}
    </section>
  );
}

/** The tinted box of the old discussion login band (BlueskyLogin's bandStyle). */
const boxStyle: CSSProperties = {
  padding: "0.7rem 0.9rem",
  border: "1px solid var(--color-gray-300)",
  borderRadius: "0.6rem",
  backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, white)",
  color: "var(--color-accent)",
  fontSize: "0.9rem",
};
