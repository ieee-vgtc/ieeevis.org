/**
 * The Bluesky band under the announcement: log in, who is logged in, and the
 * link to the thread on bsky.app.
 *
 * Every reader is offered the login, whether or not the site knows them: a
 * reader with no site session cannot use the guest composer, but can still
 * take part from their own Bluesky account. A reader whose VIS profile carries
 * a Bluesky handle gets that handle filled in so logging in is one click.
 */

import { useId, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { BlueskySession } from "./useBlueskySession";

interface BlueskyLoginProps {
  session: BlueskySession;
  /** The handle on the reader's VIS profile, if they saved one. */
  linkedHandle: string | null;
  busy: boolean;
  error: string | null;
  onSignIn: (handle: string) => void;
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
            🦋 You are logged in to Bluesky as @{session.profile.handle}.
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
        <form onSubmit={submit} style={formStyle}>
          <label htmlFor={inputId} style={{ fontWeight: 600 }}>
            🦋 Your Bluesky handle
          </label>
          <input
            autoComplete="username"
            disabled={busy}
            id={inputId}
            onChange={(event) => setHandle(event.target.value)}
            placeholder="name.bsky.social"
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
          Bluesky asks you to approve this site, then sends you back here.
        </span>
        {error && <span style={errorStyle}>{error}</span>}
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
        {error && <span style={errorStyle}>{error}</span>}
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
              onClick={() => setShowForm(true)}
              style={buttonStyle}
              type="button"
            >
              Use another account
            </button>
          </>
        ) : (
          <button
            disabled={busy}
            onClick={() => setShowForm(true)}
            style={primaryButtonStyle}
            type="button"
          >
            Log in with Bluesky
          </button>
        )}
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

const errorStyle: CSSProperties = {
  fontWeight: 400,
  fontSize: "0.82rem",
  color: "#b91c1c",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.5rem",
};

const formStyle: CSSProperties = {
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

const buttonStyle: CSSProperties = {
  padding: "0.35rem 0.8rem",
  borderRadius: "0.5rem",
  border: "1px solid #93c5fd",
  backgroundColor: "#fff",
  color: "#1e3a8a",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  whiteSpace: "nowrap",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  border: "1px solid #2563eb",
  backgroundColor: "#2563eb",
  color: "#fff",
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
