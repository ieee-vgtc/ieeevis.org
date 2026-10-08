/**
 * The signed-in attendee's profile: what the site knows about them, plus a
 * form to add or change the Bluesky handle we tag when their paper goes live.
 *
 * The profile is read from the ID token alone, with no request: `name` and
 * `email`, plus `company` and `bsky_handle`, which the Auth0 Login Action
 * copies into the token from `user_metadata` (see `getAttendeeProfile`).
 * Saving a handle goes to bsky-api's `POST /api/me/bsky-handle`
 * (`lib/bskyApi.ts`), which checks the handle exists on Bluesky, then changes
 * only `user_metadata.bsky_handle` (read, then write); the token is refreshed
 * afterwards so the claim catches up. If saving turns out to be unavailable
 * (service down, no Auth0 credentials, not an attendee), the form is greyed
 * out rather than left to fail again.
 *
 * The saved handle is the same one the paper-page discussions read (through
 * the `bsky_handle` ID token claim), so saving it here gives the reader the
 * discussion's one-click "Log in as @handle". The page also offers that
 * Bluesky login itself (`useBlueskySession`, shared with the discussions):
 * logging in here signs the browser in for those pages too, and a logged-in
 * account the profile does not carry yet is offered for saving.
 */

import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  currentPagePath,
  getAttendeeProfile,
  login,
  type AttendeeProfile,
} from "../lib/auth0Client";
import {
  isSaveUnavailable,
  saveBskyHandle,
  saveHandleErrorMessage,
} from "../lib/bskyApi";
import { normalizeBskyHandle, isBskyHandle } from "../utils/bskyHandle";
import MyProgramList, { type TimeIndex } from "./MyProgramList";
import BlueskyLoginSection from "./bluesky/BlueskyLoginSection";
import {
  disabledButtonStyle,
  errorTextStyle,
  hintTextStyle,
  primaryButtonStyle,
} from "./bluesky/styles";
import { useBlueskySession } from "./bluesky/useBlueskySession";

type Profile = AttendeeProfile;

/** "Add one?" / "Update your handle?": a link-like button after the handle. */
const toggleLinkStyle: CSSProperties = {
  marginLeft: "0.5rem",
  padding: 0,
  border: "none",
  background: "none",
  color: "var(--color-primary)",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.9rem",
  textDecoration: "underline",
};

/** A warning-coloured note: amber, like the Experimental Feature tag. */
const warningNoteStyle: CSSProperties = {
  margin: "0.4rem 0",
  padding: "0.35rem 0.6rem",
  borderRadius: "0.4rem",
  backgroundColor: "#fef3c7",
  border: "1px solid #fcd34d",
  color: "#78350f",
  fontSize: "0.85rem",
};

const dividerStyle: CSSProperties = {
  margin: "1.5rem 0",
  border: 0,
  borderTop: "1px solid var(--color-gray-300)",
};

export default function ProfileView({ times }: { times?: TimeIndex }) {
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [input, setInput] = useState("");
  const [showHandleForm, setShowHandleForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Set once a save shows saving cannot work here; greys the form out.
  const [saveUnavailable, setSaveUnavailable] = useState<string | null>(null);
  // The Bluesky login used by the paper-page discussions; logging in here
  // signs this browser in for those too.
  const bluesky = useBlueskySession();

  useEffect(() => {
    let cancelled = false;
    getAttendeeProfile()
      .then((loaded) => {
        if (!cancelled) setProfile(loaded);
      })
      .catch((error: unknown) => {
        // The sign-in itself could not be read (e.g. no connection while the
        // token needed refreshing): a bigger problem than one missing field.
        console.error("Unable to read the profile from the ID token:", error);
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    // The papers list has its own route, so it can still load when the
    // profile does not.
    return (
      <>
        <p style={errorTextStyle}>
          Your profile could not be loaded. Please try again later.
        </p>
        <hr style={dividerStyle} />
        <MyProgramList times={times} />
      </>
    );
  }
  if (profile === undefined) {
    return <p aria-live="polite">Loading your profile…</p>;
  }
  if (profile === null) {
    return (
      <>
        <p>Sign in to see your profile.</p>
        <button
          type="button"
          style={primaryButtonStyle}
          onClick={() => void login(currentPagePath())}
        >
          Sign in
        </button>
      </>
    );
  }

  const handle = normalizeBskyHandle(input);
  const unchanged = handle === (profile.bskyHandle ?? "");
  const submitDisabled =
    saving || unchanged || !handle || saveUnavailable !== null;

  const save = async (newHandle: string) => {
    setSaving(true);
    setFormError(null);
    try {
      const savedHandle = await saveBskyHandle(newHandle);
      setProfile({ ...profile, bskyHandle: savedHandle });
      setInput("");
    } catch (error) {
      console.error("Could not save the Bluesky handle:", error);
      if (isSaveUnavailable(error)) {
        setSaveUnavailable(saveHandleErrorMessage(error));
      } else {
        setFormError(saveHandleErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isBskyHandle(handle)) {
      setFormError(
        "That does not look like a Bluesky handle, e.g. you.bsky.social.",
      );
      return;
    }
    await save(handle);
  };

  // Comes back to this page after the Bluesky login; the callback page needs
  // the full path, base included, like the discussion's own login.
  const signInWithBluesky = (input: string) => {
    const { pathname, search } = window.location;
    void bluesky.signIn(input, `${pathname}${search}`);
  };

  const rows: [string, string | null | undefined][] = [
    ["Name", profile.name],
    ["Email", profile.email],
    ["Company", profile.company],
  ];

  // Hidden when the handle claim could not be read: whether this is an Add or
  // an Update is then unknown.
  const canEditHandle = profile.bskyHandle !== undefined;

  return (
    <>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="mb-3">
            <dt className="font-bold">{label}</dt>
            <dd>
              {value || (
                <span style={hintTextStyle}>
                  {value === undefined ? "Unable to fetch" : "Not provided"}
                </span>
              )}
            </dd>
          </div>
        ))}
        <div className="mb-3">
          <dt className="font-bold">Bluesky handle</dt>
          <dd>
            {/* Announced when a save changes it: the only confirmation. */}
            <span aria-live="polite">
              {profile.bskyHandle ? (
                `@${profile.bskyHandle}`
              ) : (
                <span style={hintTextStyle}>
                  {profile.bskyHandle === undefined
                    ? "Unable to fetch"
                    : "Not provided."}
                </span>
              )}
            </span>
            {canEditHandle && (
              <button
                type="button"
                aria-expanded={showHandleForm}
                aria-controls="bsky-handle-form"
                onClick={() => setShowHandleForm((open) => !open)}
                style={toggleLinkStyle}
              >
                {profile.bskyHandle ? "Update your handle?" : "Add one?"}
                <i
                  className="material-icons"
                  aria-hidden="true"
                  style={{ fontSize: "1.1em", verticalAlign: "-0.2em" }}
                >
                  {showHandleForm ? "expand_less" : "expand_more"}
                </i>
              </button>
            )}
            {canEditHandle && showHandleForm && (
              <div id="bsky-handle-form">
                <form onSubmit={(event) => void onSubmit(event)} noValidate>
                  <label htmlFor="bsky-handle" className="sr-only">
                    {profile.bskyHandle ? "New" : "Your"} Bluesky handle
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      margin: "0.25rem 0",
                      padding: "0.5rem 0",
                    }}
                  >
                    <input
                      id="bsky-handle"
                      type="text"
                      value={input}
                      disabled={saveUnavailable !== null}
                      placeholder="you.bsky.social"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-describedby="bsky-handle-hint"
                      onChange={(event) => setInput(event.target.value)}
                      style={{
                        flex: "1 1 auto",
                        maxWidth: "24rem",
                        padding: "0.35rem 0.6rem",
                        border: "1px solid var(--color-gray-400)",
                        borderRadius: "0.5rem",
                        ...(saveUnavailable !== null && {
                          backgroundColor: "var(--color-gray-100)",
                          color: "var(--color-gray-500)",
                          cursor: "not-allowed",
                        }),
                      }}
                    />
                    <button
                      type="submit"
                      disabled={submitDisabled}
                      style={
                        submitDisabled
                          ? disabledButtonStyle
                          : primaryButtonStyle
                      }
                    >
                      {saving
                        ? "Saving…"
                        : profile.bskyHandle
                          ? "Update"
                          : "Add"}
                    </button>
                  </div>
                  <p id="bsky-handle-hint" style={hintTextStyle}>
                    <b>Why provide your Bluesky handle?</b> If you are an
                    author, we will tag you on Bluesky when your paper goes
                    live!
                  </p>
                  <p role="note" style={warningNoteStyle}>
                    This action does not log you in to Bluesky. To log in,
                    please use the log in button below.
                  </p>
                  {saveUnavailable ? (
                    <p role="status" style={errorTextStyle}>
                      {saveUnavailable}
                    </p>
                  ) : (
                    formError && (
                      <p role="alert" style={errorTextStyle}>
                        {formError}
                      </p>
                    )
                  )}
                </form>
              </div>
            )}
          </dd>
        </div>
      </dl>

      <hr style={dividerStyle} />

      <BlueskyLoginSection
        boxed={false}
        bluesky={bluesky}
        linkedHandle={profile.bskyHandle}
        onSignIn={signInWithBluesky}
        onSaveHandle={(newHandle) => void save(newHandle)}
        saveDisabled={saving || saveUnavailable !== null}
      />

      <hr style={dividerStyle} />

      <MyProgramList times={times} />
    </>
  );
}
