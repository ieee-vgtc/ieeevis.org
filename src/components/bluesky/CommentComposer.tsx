/**
 * The comment box: a textarea, a submit button that names who the comment is
 * credited to, the "Hide my name" option for guest comments, and a counter.
 *
 * The discussion shows one under the announcement and one inline under a reply
 * the reader answers. Each keeps its own draft; the "Hide my name" choice is
 * the discussion's, so it carries over between them.
 */

import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { hintTextStyle, secondaryButtonStyle } from "./styles";

// How much of the byline the "Comment as …" button shows before ellipsis, so a
// long name cannot blow the button off its row.
const BYLINE_LIMIT = 22;

/** Count the way the API does, so the counter and the 400 agree. */
function graphemeLength(text: string): number {
  const Segmenter = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (!Segmenter) {
    return [...text].length;
  }
  let n = 0;
  for (const _ of new Segmenter("en", { granularity: "grapheme" }).segment(
    text,
  )) {
    n++;
  }
  return n;
}

/** Clip a byline to `BYLINE_LIMIT` code points, adding an ellipsis if cut. */
function truncateByline(name: string): string {
  const chars = Array.from(name);
  return chars.length > BYLINE_LIMIT
    ? `${chars.slice(0, BYLINE_LIMIT - 1).join("")}…`
    : name;
}

interface CommentComposerProps {
  id: string;
  /** Shown in the empty textarea and read out as its label. */
  placeholder: string;
  verb: "Comment" | "Reply";
  limit: number;
  /** The Bluesky account the comment is posted from, or null for a guest. */
  nativeHandle: string | null;
  realNameByline: string | null;
  pseudonymByline: string | null;
  anonymous: boolean;
  onAnonymousChange: (anonymous: boolean) => void;
  onActivity: () => void;
  /**
   * Posts the text and calls `clearDraft` once the post exists. A thrown
   * error's message is shown to the reader.
   */
  onSubmit: (text: string, clearDraft: () => void) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  style?: CSSProperties;
}

export default function CommentComposer({
  id,
  placeholder,
  verb,
  limit,
  nativeHandle,
  realNameByline,
  pseudonymByline,
  anonymous,
  onAnonymousChange,
  onActivity,
  onSubmit,
  onCancel,
  autoFocus = false,
  style,
}: CommentComposerProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = limit - graphemeLength(draft);
  const bylineLabel = (who: string | null) =>
    who ? `${verb} as ${truncateByline(who)}` : verb;

  const submit = async (event: FormEvent) => {
    const text = draft.trim();
    event.preventDefault();
    if (!text || submitting) {
      return;
    }
    if (graphemeLength(text) > limit) {
      setError(`Comments are limited to ${limit} characters.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(text, () => setDraft(""));
    } catch (err) {
      setError((err as Error).message || "Your comment could not be posted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} style={style}>
      <label htmlFor={id} style={{ display: "none" }}>
        {placeholder}
      </label>
      <textarea
        autoFocus={autoFocus}
        disabled={submitting}
        id={id}
        onChange={(event) => {
          onActivity();
          setDraft(event.target.value);
        }}
        onFocus={onActivity}
        placeholder={placeholder}
        rows={3}
        style={{
          width: "100%",
          padding: "0.6rem",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          fontFamily: "inherit",
          fontSize: "0.95rem",
          resize: "vertical",
        }}
        value={draft}
      />

      {/* One row: submit on the left, then the checkbox it drives right
          beside it (with the "name is hidden" note tucked under the
          checkbox), and the counter alone on the far right. */}
      <div
        style={{
          display: "flex",
          // Top-aligned: when the "name is hidden" note appears under the
          // checkbox the column grows downward without re-centering (and so
          // jumping) the button and checkbox.
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.5rem 0.75rem",
          marginTop: "0.5rem",
          fontSize: "0.85rem",
          color: "#6b7280",
        }}
      >
        {/* The section is a polite live region, so the button's byline is
            announced when "Hide my name" toggles it. */}
        <button
          disabled={submitting || !draft.trim() || remaining < 0}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "0.5rem",
            border: "1px solid #2563eb",
            backgroundColor: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
          }}
          type="submit"
        >
          {/* Both bylines occupy one grid cell so the button reserves the
              wider width and does not resize (shoving the checkbox) when
              "Hide my name" flips which one shows; "Posting…" overlays while
              submitting. Only the active label is visible/announced. A
              Bluesky login has one byline: the account. */}
          <span style={{ display: "grid" }}>
            <span
              style={{
                gridArea: "1 / 1",
                visibility: submitting || anonymous ? "hidden" : "visible",
              }}
            >
              {nativeHandle
                ? `${verb} as @${truncateByline(nativeHandle)}`
                : bylineLabel(realNameByline)}
            </span>
            {!nativeHandle && (
              <span
                style={{
                  gridArea: "1 / 1",
                  visibility: submitting || !anonymous ? "hidden" : "visible",
                }}
              >
                {bylineLabel(pseudonymByline)}
              </span>
            )}
            {submitting && <span style={{ gridArea: "1 / 1" }}>Posting…</span>}
          </span>
        </button>

        {onCancel && (
          <button
            disabled={submitting}
            onClick={onCancel}
            style={secondaryButtonStyle}
            type="button"
          >
            Cancel
          </button>
        )}

        {/* A comment from the reader's own Bluesky account is signed by
            that account, so there is no name to hide. */}
        {nativeHandle ? (
          <small style={hintTextStyle}>Posted from your Bluesky account.</small>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.15rem",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                cursor: submitting ? "default" : "pointer",
              }}
            >
              <input
                checked={anonymous}
                disabled={submitting}
                onChange={(event) => {
                  onActivity();
                  onAnonymousChange(event.target.checked);
                }}
                type="checkbox"
              />
              Hide my name
            </label>

            {anonymous && (
              <small style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Your name is hidden from readers, not from conference
                organizers.
              </small>
            )}
          </div>
        )}

        <small
          style={{
            marginLeft: "auto",
            color: remaining < 0 ? "#b91c1c" : "#6b7280",
          }}
        >
          {remaining}
        </small>
      </div>

      {error && (
        <p style={{ color: "#b91c1c", margin: "0.5rem 0 0" }}>{error}</p>
      )}
    </form>
  );
}
