/**
 * The attendee's papers and sessions, from bsky-api's `GET /api/me/program`:
 * the program items whose emails match the one in the attendee's verified ID
 * token, or an author email that the registration sync or an organizer
 * linked to the account. The lookup has to run there, server-side: the
 * program tables that hold authors' emails are not readable from the browser.
 *
 * Below the list, `GET /api/me/link-suggestions` offers program entries under
 * the attendee's name but another email (authorship, chairing, presenting).
 * Linking one (`POST /api/me/links`) applies at once; an organizer reviews it
 * afterwards on the dashboard, and a rejected link drops off by itself.
 */

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getCurrentUser } from "../lib/auth0Client";
import { BskyApiError, bskyApiFetch } from "../lib/bskyApi";
import { siteBase } from "../utils/withBaseURL";
import ExperimentalBadge from "./ExperimentalBadge";
import {
  disabledButtonStyle,
  errorTextStyle,
  hintTextStyle,
  primaryButtonStyle,
} from "./bluesky/styles";

/** Where attendees ask about a missing paper or session. */
const CONTACT_EMAIL = "tech@ieeevis.org";

/** `GET /api/me/program`; paths are relative to the site's base. */
type MyProgram = {
  papers: {
    id: string;
    title: string;
    role: "Author" | "Contributor";
    sessionPath?: string;
    sessionTitle?: string;
  }[];
  sessions: {
    path: string;
    title: string;
    /** Why it is listed: chairing it, presenting in it, or a paper in it. */
    roles: ("Chair" | "Presenter" | "Author" | "Contributor")[];
  }[];
};

/** When and where, by session path and by paper id; built from the program. */
type Times = Record<string, { start: string; end: string; room: string }>;
export type TimeIndex = { sessions: Times; papers: Times };

const CONFERENCE_TIME_ZONE = "US/Eastern";
const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CONFERENCE_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CONFERENCE_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});
const zoneFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CONFERENCE_TIME_ZONE,
  timeZoneName: "short",
});

/** "Mon, Nov 2 · 10:30 AM – 11:45 AM EST · Room 2", or null with no time. */
function whenAndWhere(
  when: { start: string; end: string; room: string } | undefined,
): string | null {
  const start = when && new Date(when.start);
  if (!when || !start || Number.isNaN(start.getTime())) {
    return null;
  }
  const end = new Date(when.end);
  const zone = zoneFormat
    .formatToParts(start)
    .find((part) => part.type === "timeZoneName")?.value;
  const time = Number.isNaN(end.getTime())
    ? timeFormat.format(start)
    : `${timeFormat.format(start)} – ${timeFormat.format(end)}`;
  return [
    dateFormat.format(start),
    `${time}${zone ? ` ${zone}` : ""}`,
    when.room,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * `GET /api/me/link-suggestions`: one person in the program under the
 * attendee's name but another email, with the papers and sessions that
 * linking them would add. `key` is opaque, sent back as is to link.
 */
type LinkSuggestion = {
  key: string;
  kind: "author" | "chair" | "presenter";
  name: string;
  affiliation: string | null;
  papers: MyProgram["papers"];
  sessions: MyProgram["sessions"];
};

const loadMyProgram = () => bskyApiFetch<MyProgram>("/api/me/program");

const loadLinkSuggestions = () =>
  bskyApiFetch<{ suggestions: LinkSuggestion[] }>("/api/me/link-suggestions");

const linkToAccount = (key: string) =>
  bskyApiFetch<{ linked: true }>("/api/me/links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key }),
  });

/** What to tell the attendee when linking a suggestion failed. */
function linkErrorMessage(error: unknown): string {
  const status = error instanceof BskyApiError ? error.status : 0;
  if (status === 422) {
    return "This match is no longer available. Please reload the page.";
  }
  if (status === 409) {
    return `This is already linked to another account. If it is yours, contact ${CONTACT_EMAIL}.`;
  }
  if (status === 429) {
    return "You have reached today's limit for linking. Please try again tomorrow.";
  }
  return "Linking is not available right now. Please try again later.";
}

const suggestionStyle: CSSProperties = {
  marginBottom: "1rem",
  padding: "0.7rem 0.9rem",
  border: "1px solid var(--color-gray-300)",
  borderRadius: "0.6rem",
};

/**
 * Items in the order they happen; anything with no known time goes last,
 * by title, so the list stays stable.
 */
function byStart<T extends { title: string }>(
  items: T[],
  startOf: (item: T) => string | undefined,
): T[] {
  const time = (item: T) => {
    const parsed = Date.parse(startOf(item) ?? "");
    return Number.isNaN(parsed) ? Infinity : parsed;
  };
  return [...items].sort(
    (a, b) => time(a) - time(b) || a.title.localeCompare(b.title),
  );
}

/**
 * The subtitle row under a list item: the attendee's roles first, then for a
 * paper the session it is in (a link), then date, time and room. Nothing when
 * none of these is known.
 */
function WhenAndWhere({
  text,
  roles,
  session,
}: {
  text: string | null;
  roles?: string[];
  session?: { path: string; title: string };
}) {
  const parts = [
    roles && roles.length > 0 && `Role: ${roles.join(", ")}`,
    session && (
      <a key="session" href={`${siteBase()}${session.path}`}>
        {session.title}
      </a>
    ),
    text,
  ].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return (
    <div style={hintTextStyle}>
      {parts.flatMap((part, index) => (index > 0 ? [" · ", part] : [part]))}
    </div>
  );
}

/**
 * When and where a paper is: its own slot, else its session's (a paper that
 * no slot holds, which bsky-api places in its event's only session).
 */
function paperTime(paper: MyProgram["papers"][number], times?: TimeIndex) {
  return (
    times?.papers[paper.id] ??
    (paper.sessionPath ? times?.sessions[paper.sessionPath] : undefined)
  );
}

/**
 * Papers in the order they happen, laid out like the sessions: the role, then
 * the session it is in and its time.
 */
function PaperList({
  papers,
  times,
}: {
  papers: MyProgram["papers"];
  times?: TimeIndex;
}) {
  return (
    <ul className="mb-3 list-disc pl-6">
      {byStart(papers, (paper) => paperTime(paper, times)?.start).map(
        (paper) => (
          <li key={paper.id}>
            <a href={`${siteBase()}/program/paper/${paper.id}`}>
              {paper.title}
            </a>
            <WhenAndWhere
              roles={[paper.role]}
              text={whenAndWhere(paperTime(paper, times))}
              session={
                paper.sessionPath && paper.sessionTitle
                  ? { path: paper.sessionPath, title: paper.sessionTitle }
                  : undefined
              }
            />
          </li>
        ),
      )}
    </ul>
  );
}

/** Sessions in the order they happen, each with the roles and time. */
function SessionList({
  sessions,
  times,
}: {
  sessions: MyProgram["sessions"];
  times?: TimeIndex;
}) {
  return (
    <ul className="mb-3 list-disc pl-6">
      {byStart(sessions, (session) => times?.sessions[session.path]?.start).map(
        (session) => (
          <li key={session.path}>
            <a href={`${siteBase()}${session.path}`}>{session.title}</a>
            <WhenAndWhere
              roles={session.roles}
              text={whenAndWhere(times?.sessions[session.path])}
            />
          </li>
        ),
      )}
    </ul>
  );
}

/** One suggested match, with what it would add and its own Link button. */
function SuggestionCard({
  suggestion,
  times,
  onLinked,
}: {
  suggestion: LinkSuggestion;
  times?: TimeIndex;
  onLinked: (key: string) => Promise<void>;
}) {
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = async () => {
    setLinking(true);
    setError(null);
    try {
      await linkToAccount(suggestion.key);
      await onLinked(suggestion.key);
    } catch (err) {
      console.error("Could not link the suggestion:", err);
      setError(linkErrorMessage(err));
      setLinking(false);
    }
  };

  return (
    <li style={suggestionStyle}>
      <p className="mb-2">
        <b>{suggestion.name}</b>
        {suggestion.affiliation && (
          <span style={hintTextStyle}> · {suggestion.affiliation}</span>
        )}
      </p>
      {suggestion.papers.length > 0 && (
        <PaperList papers={suggestion.papers} times={times} />
      )}
      {suggestion.sessions.length > 0 && (
        <SessionList sessions={suggestion.sessions} times={times} />
      )}
      <button
        type="button"
        disabled={linking}
        style={linking ? disabledButtonStyle : primaryButtonStyle}
        onClick={() => void link()}
      >
        {linking ? "Linking…" : "Link to my account"}
      </button>
      {error && (
        <p role="alert" className="mt-2 mb-0" style={errorTextStyle}>
          {error}
        </p>
      )}
    </li>
  );
}

export default function MyProgramList({ times }: { times?: TimeIndex }) {
  const [program, setProgram] = useState<MyProgram | undefined>();
  const [loadError, setLoadError] = useState(false);
  // Undefined while loading; null when they could not be loaded.
  const [suggestions, setSuggestions] = useState<
    LinkSuggestion[] | null | undefined
  >();
  // From the sign-in itself, so it shows even when the profile route fails.
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((user) => {
      if (!cancelled) setEmail(user?.email ?? null);
    });
    loadMyProgram()
      .then((loaded) => {
        if (!cancelled) setProgram(loaded);
      })
      .catch((error: unknown) => {
        console.error("Unable to load your papers and sessions:", error);
        if (!cancelled) setLoadError(true);
      });
    loadLinkSuggestions()
      .then((loaded) => {
        if (!cancelled) setSuggestions(loaded.suggestions);
      })
      .catch((error: unknown) => {
        console.warn("Unable to load link suggestions:", error);
        if (!cancelled) setSuggestions(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The link applies at once: show the new papers and sessions, and drop the
  // suggestion. A failed reload keeps the old list rather than an error.
  const onLinked = useCallback(async (key: string) => {
    setSuggestions((current) => current?.filter((s) => s.key !== key));
    try {
      setProgram(await loadMyProgram());
    } catch (error) {
      console.error(
        "Linked, but could not reload your papers and sessions:",
        error,
      );
    }
  }, []);

  return (
    <section aria-labelledby="my-program-heading">
      <h2 id="my-program-heading" className="font-bold">
        Your papers and sessions
      </h2>
      <ExperimentalBadge />
      <p style={hintTextStyle}>
        Papers and sessions are automatically matched based on the email used to
        register (shown above) and any author emails we've collected that are
        linked to your account.
      </p>

      {loadError ? (
        <p style={errorTextStyle}>
          Your papers and sessions could not be loaded. Please try again later.
        </p>
      ) : program === undefined ? (
        <p aria-live="polite">Loading your papers and sessions…</p>
      ) : (
        <>
          <h3 className="font-bold">Papers</h3>
          {program.papers.length === 0 ? (
            <p style={hintTextStyle}>
              No papers associated with {email ?? "your email"} or your linked
              author emails.
            </p>
          ) : (
            <PaperList papers={program.papers} times={times} />
          )}
          <h3 className="font-bold">Sessions</h3>
          {program.sessions.length === 0 ? (
            <p style={hintTextStyle}>
              No sessions associated with {email ?? "your email"} or your linked
              author emails.
            </p>
          ) : (
            <SessionList sessions={program.sessions} times={times} />
          )}
        </>
      )}

      <h3 className="font-bold">Potential matches</h3>
      {suggestions === undefined ? (
        <p style={hintTextStyle}>Looking for potential matches…</p>
      ) : suggestions === null ? (
        <p style={hintTextStyle}>
          Potential matches could not be loaded. Please try again later.
        </p>
      ) : suggestions.length === 0 ? (
        <p style={hintTextStyle}>No potential matches found.</p>
      ) : (
        <>
          <p style={hintTextStyle}>
            We found matches for authorship, chairing or presenting that are not
            linked to your account because the emails don&apos;t match. If one
            is you, click <b>Link to my account</b>. It shows up right away, and
            an organizer will review it.
          </p>
          <ul aria-live="polite">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.key}
                suggestion={suggestion}
                times={times}
                onLinked={onLinked}
              />
            ))}
          </ul>
        </>
      )}
      <p style={hintTextStyle}>
        If you don&apos;t see your paper or session, reach out to us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to get it
        linked.
      </p>
    </section>
  );
}
