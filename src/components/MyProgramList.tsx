/**
 * The attendee's papers and sessions, from bsky-api's `GET /api/me/program`:
 * the program items whose emails match the one in the attendee's verified ID
 * token. The lookup has to run there, server-side: the program tables that
 * hold authors' emails are not readable from the browser.
 */

import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/auth0Client";
import { bskyApiFetch } from "../lib/bskyApi";
import { siteBase } from "../utils/withBaseURL";
import ExperimentalBadge from "./ExperimentalBadge";
import { errorTextStyle, hintTextStyle } from "./bluesky/styles";

/** `GET /api/me/program`; paths are relative to the site's base. */
type MyProgram = {
  papers: {
    id: string;
    title: string;
    role: "Author" | "Contributor";
    sessionPath?: string;
    sessionTitle?: string;
  }[];
  sessions: { path: string; title: string; roles: ("Chair" | "Author")[] }[];
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

const loadMyProgram = () => bskyApiFetch<MyProgram>("/api/me/program");

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
 * The subtitle row under a list item: for a paper, the session it is in (a
 * link) first, then date, time and room. Nothing when neither is known.
 */
function WhenAndWhere({
  text,
  session,
}: {
  text: string | null;
  session?: { path: string; title: string };
}) {
  if (!text && !session) {
    return null;
  }
  return (
    <div style={hintTextStyle}>
      {session && <a href={`${siteBase()}${session.path}`}>{session.title}</a>}
      {session && text && " · "}
      {text}
    </div>
  );
}

export default function MyProgramList({ times }: { times?: TimeIndex }) {
  const [program, setProgram] = useState<MyProgram | undefined>();
  const [loadError, setLoadError] = useState(false);
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
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="my-program-heading">
      <h2 id="my-program-heading" className="font-bold">
        Your papers and sessions
      </h2>
      <ExperimentalBadge />
      <p style={hintTextStyle}>
        Papers and sessions are automatically matched based on the email used to
        register (shown above).
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
            <p className="mb-3">
              No papers associated with {email ?? "your email"}
            </p>
          ) : (
            <ul className="mb-3 list-disc pl-6">
              {byStart(
                program.papers,
                (paper) => times?.papers[paper.id]?.start,
              ).map((paper) => (
                <li key={paper.id}>
                  <a href={`${siteBase()}/program/paper/${paper.id}`}>
                    {paper.title}
                  </a>{" "}
                  <span style={hintTextStyle}>({paper.role})</span>
                  <WhenAndWhere
                    text={whenAndWhere(times?.papers[paper.id])}
                    session={
                      paper.sessionPath && paper.sessionTitle
                        ? { path: paper.sessionPath, title: paper.sessionTitle }
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          )}
          <h3 className="font-bold">Sessions</h3>
          {program.sessions.length === 0 ? (
            <p>No sessions associated with {email ?? "your email"}</p>
          ) : (
            <ul className="list-disc pl-6">
              {byStart(
                program.sessions,
                (session) => times?.sessions[session.path]?.start,
              ).map((session) => (
                <li key={session.path}>
                  <a href={`${siteBase()}${session.path}`}>{session.title}</a>{" "}
                  <span style={hintTextStyle}>
                    ({session.roles.join(", ")})
                  </span>
                  <WhenAndWhere
                    text={whenAndWhere(times?.sessions[session.path])}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
