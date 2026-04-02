import React from "react";
import type { Session } from "../types/session";

interface SessionListingProps {
  colors: Record<string, string>;
  organizers: string[];
  sessions: Session[];
  type: string;
  url: string;

  showAbstract: boolean;
  showPresenters: boolean;
  showTime: boolean;
  showTrack: boolean;
  skipEventTitle: boolean;
  useFullDate: boolean;
}

export const SessionListing: React.FC<SessionListingProps> = ({
  colors,
  organizers,
  sessions,
  type,
  url,

  showAbstract,
  showPresenters,
  showTime,
  showTrack,
  skipEventTitle,
  useFullDate,
}) => {
  return (
    <div>
      {sessions.map((session, idx) => (
        <div
          key={idx}
          className={`row py-3 session-listing-row ${session.id}`}
          id={session.id}
        >
          <div
            className={`col-10 col-md-8 session-listing ${session.id}`}
            style={{ borderColor: colors[type] }}
          >
            <span className="session-type" style={{ color: colors[type] }}>
              {type}
            </span>

            <h2 className="session-list-event">
              <a href={`session_${session.id}.html`}>{session.title}</a>
            </h2>

            {skipEventTitle && (
              <h3 className="session-list-session">
                <a href={`session_${session.id}.html`}>{session.title}</a>
              </h3>
            )}

            {url && (
              <div className="session-url">
                <span className="fas mr-1">&#xf05a;</span>
                <a href={url}>{url}</a>
              </div>
            )}

            <h3 className="session-room mt-4">{session.room_name}</h3>

            {!showTime && (
              <h4 className="session-list-date mt-3">
                <span className="fas mr-1">&#xf017;</span>
                <span
                  className={
                    useFullDate ? "format-date-span-full" : "format-date-span"
                  }
                >
                  {session.time_start} &ndash; {session.time_end}
                </span>
              </h4>
            )}

            {session.chair ? (
              <h5 className="session-list-presenter">
                <span className="fas mr-1">&#xf007;</span>
                Chair: {session.chair.join(", ")}
              </h5>
            ) : organizers ? (
              <h5 className="session-list-presenter">
                <span className="fas mr-1">&#xf0c0;</span>
                Organizers: {organizers.join(", ")}
              </h5>
            ) : null}

            <p className="session-list-info">
              <span className="fas mr-1">&#xf05a;</span>
              {session.time_slots.length} presentations in this session.{" "}
              <a href={`session_${session.id}.html`}>See more &raquo;</a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
