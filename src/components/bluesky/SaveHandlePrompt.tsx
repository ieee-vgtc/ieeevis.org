/**
 * After a Bluesky login, offer to put the handle on the reader's VIS profile.
 *
 * Shown only when the site knows the reader (they have a site session) and
 * the profile does not already carry this handle. Saving is the reader's
 * choice: the handle on the profile is what marks their Bluesky replies as
 * theirs on this site even when they are not logged in to Bluesky here, and
 * it is what the login band fills in next time. "Not now" is remembered per
 * handle so the question is asked once, not on every page.
 */

import { useState } from "react";
import type { CSSProperties } from "react";

const DISMISSED_KEY = "vis2026:bsky-handle-prompt-dismissed";

export function isHandlePromptDismissed(handle: string): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === handle;
  } catch {
    return false;
  }
}

function dismissHandlePrompt(handle: string) {
  try {
    window.localStorage.setItem(DISMISSED_KEY, handle);
  } catch {
    // Without storage the prompt simply comes back on the next page.
  }
}

interface SaveHandlePromptProps {
  handle: string;
  onSaved: (handle: string) => void;
  onDismiss: () => void;
}

export default function SaveHandlePrompt({
  handle,
  onSaved,
  onDismiss,
}: SaveHandlePromptProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${base}/auth/bluesky-handle`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      if (!response.ok) {
        throw new Error(`The site returned ${response.status}.`);
      }
      dismissHandlePrompt(handle);
      onSaved(handle);
    } catch (err) {
      console.error("Could not save the Bluesky handle:", err);
      setError("The handle could not be saved. You can try again later.");
    } finally {
      setSaving(false);
    }
  };

  const dismiss = () => {
    dismissHandlePrompt(handle);
    onDismiss();
  };

  return (
    <div role="note" style={promptStyle}>
      <span>
        Save @{handle} to your VIS profile? This site then knows which Bluesky
        replies are yours, also when you are not logged in to Bluesky here.
      </span>
      <span style={actionsStyle}>
        <button
          disabled={saving}
          onClick={() => void save()}
          style={primaryButtonStyle}
          type="button"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          disabled={saving}
          onClick={dismiss}
          style={buttonStyle}
          type="button"
        >
          Not now
        </button>
      </span>
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

const promptStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "0.5rem 0.75rem",
  margin: "0 0 0.75rem",
  padding: "0.6rem 0.9rem",
  border: "1px solid #fcd34d",
  borderRadius: "0.6rem",
  backgroundColor: "#fffbeb",
  color: "#78350f",
  fontSize: "0.88rem",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const errorStyle: CSSProperties = {
  flexBasis: "100%",
  color: "#b91c1c",
  fontSize: "0.82rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.3rem 0.8rem",
  borderRadius: "0.5rem",
  border: "1px solid #d1d5db",
  backgroundColor: "#fff",
  color: "inherit",
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
