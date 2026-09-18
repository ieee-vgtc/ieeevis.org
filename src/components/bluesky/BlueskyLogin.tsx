/**
 * The Bluesky band under the announcement: log in, who is logged in, and the
 * link to the thread on bsky.app.
 *
 * Every reader is offered the login, whether or not the site knows them: a
 * reader with no site session cannot use the guest composer, but can still
 * take part from their own Bluesky account.
 *
 * The button goes straight to the bsky.social login page, where nearly every
 * account lives, so nobody has to type a handle first. A reader whose VIS
 * profile carries a handle logs in as that account in one click — the handle
 * finds the account's server, wherever it is. The handle form is only for an
 * account hosted somewhere other than bsky.social.
 */

import { useId, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { BLUESKY_ENTRYWAY } from "./oauth";
import {
  errorTextStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "./styles";
import type { BlueskySession } from "./useBlueskySession";

interface BlueskyLoginProps {
  session: BlueskySession;
  /** The handle on the reader's VIS profile, if they saved one. */
  linkedHandle: string | null;
  busy: boolean;
  error: string | null;
  /** Start the login, with a handle or a server URL. */
  onSignIn: (input: string) => void;
  onSignOut: () => void;
  bskyUrl: string;
}

export default function BlueskyLogin({
  session,
  linkedHandle,
  busy,
  error,
  onSignIn,
  onSignOut,
  bskyUrl,
}: BlueskyLoginProps) {
  const [showForm, setShowForm] = useState(false);
  const [handle, setHandle] = useState("");
  const inputId = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (handle.trim()) {
      onSignIn(handle);
    }
  };

  const viewLink = (
    <a
      href={bskyUrl}
      rel="noopener noreferrer"
      style={viewLinkStyle}
      target="_blank"
    >
      View on Bluesky →
    </a>
  );

  if (session.status === "signed-in") {
    return (
      <div style={bandStyle}>
        <span style={messageStyle}>
          <span>
            🦋 You are logged in to Bluesky as @{session.writer.profile.handle}.
          </span>
          <span style={reasonStyle}>
            Your comments and likes are posted from your own account.
          </span>
        </span>
        <span style={actionsStyle}>
          <button onClick={onSignOut} style={buttonStyle} type="button">
            Log out
          </button>
          {viewLink}
        </span>
      </div>
    );
  }

  if (session.status !== "none") {
    return (
      <div style={bandStyle}>
        <span style={messageStyle}>
          {session.status === "restoring"
            ? "🦋 Restoring your Bluesky login…"
            : "🦋 This discussion is also on Bluesky."}
        </span>
        {viewLink}
      </div>
    );
  }

  if (showForm) {
    return (
      <div
        style={{ ...bandStyle, flexDirection: "column", alignItems: "stretch" }}
      >
        <form onSubmit={submit} style={actionsStyle}>
          <label htmlFor={inputId} style={{ fontWeight: 600 }}>
            🦋 Your handle
          </label>
          <input
            autoComplete="username"
            disabled={busy}
            id={inputId}
            onChange={(event) => setHandle(event.target.value)}
            placeholder="name.example.com"
            style={inputStyle}
            type="text"
            value={handle}
          />
          <button
            disabled={busy || !handle.trim()}
            style={primaryButtonStyle}
            type="submit"
          >
            {busy ? "Opening Bluesky…" : "Continue"}
          </button>
          <button
            disabled={busy}
            onClick={() => setShowForm(false)}
            style={buttonStyle}
            type="button"
          >
            Cancel
          </button>
        </form>
        <span style={reasonStyle}>
          For an account that is not on bsky.social. The handle finds your
          server, which asks you to approve this site and sends you back here.
        </span>
        {error && <span style={errorTextStyle}>{error}</span>}
      </div>
    );
  }

  return (
    <div style={bandStyle}>
      <span style={messageStyle}>
        <span>
          {linkedHandle
            ? `🦋 You have a Bluesky account, @${linkedHandle}.`
            : "🦋 Do you have a Bluesky account?"}
        </span>
        <span style={reasonStyle}>
          Log in to comment and like from your own account instead of as a VIS
          attendee.
        </span>
        {error && <span style={errorTextStyle}>{error}</span>}
      </span>
      <span style={actionsStyle}>
        {linkedHandle ? (
          <>
            <button
              disabled={busy}
              onClick={() => onSignIn(linkedHandle)}
              style={primaryButtonStyle}
              type="button"
            >
              {busy ? "Opening Bluesky…" : `Log in as @${linkedHandle}`}
            </button>
            <button
              disabled={busy}
              onClick={() => onSignIn(BLUESKY_ENTRYWAY)}
              style={buttonStyle}
              type="button"
            >
              Use another account
            </button>
          </>
        ) : (
          <button
            disabled={busy}
            onClick={() => onSignIn(BLUESKY_ENTRYWAY)}
            style={primaryButtonStyle}
            type="button"
          >
            {busy ? "Opening Bluesky…" : "Log in with Bluesky"}
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => setShowForm(true)}
          style={textButtonStyle}
          type="button"
        >
          My account is not on bsky.social
        </button>
        {viewLink}
      </span>
    </div>
  );
}

/** The shaded footer band of the announcement card. */
const bandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "0.5rem 0.75rem",
  padding: "0.7rem 0.9rem",
  borderTop: "1px solid #bfdbfe",
  backgroundColor: "#eff6ff",
  color: "#1e3a8a",
  fontSize: "0.9rem",
};

const messageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.15rem",
  fontWeight: 600,
};

const reasonStyle: CSSProperties = {
  fontWeight: 400,
  fontSize: "0.82rem",
  color: "#1e40af",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.5rem",
};

const inputStyle: CSSProperties = {
  flex: "1 1 12rem",
  padding: "0.35rem 0.6rem",
  border: "1px solid #93c5fd",
  borderRadius: "0.5rem",
  fontFamily: "inherit",
  fontSize: "0.9rem",
};

/** The secondary button, in the band's own blue. */
const buttonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  border: "1px solid #93c5fd",
  color: "#1e3a8a",
};

/** A link-like button for the rare case, so it does not compete with the real one. */
const textButtonStyle: CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  color: "#1e40af",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.82rem",
  textDecoration: "underline",
};

// The site's prose links carry a dashed border-bottom (.content a); this one
// sits in a band, so it draws none.
const viewLinkStyle: CSSProperties = {
  color: "#1e3a8a",
  fontWeight: 600,
  textDecoration: "none",
  borderBottom: "none",
  whiteSpace: "nowrap",
};
