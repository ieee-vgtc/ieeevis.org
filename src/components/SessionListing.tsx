import React from "react";

interface SessionListingProps {
  sessions: any[];
  colors: any;
  showTrack: boolean;
  showTime: boolean;
  showAbstract: boolean;
  showPresenters: boolean;
}

export const SessionListing: React.FC<SessionListingProps> = ({
  sessions,
  colors,
  showTrack,
  showTime,
  showAbstract,
  showPresenters,
}) => {
  return (
    <div>
      {sessions.map((session, idx) => (
        <div key={idx}>
          <h4 style={{ color: colors[session.track] }}>{session.title}</h4>
          {showTime && (
            <p>
              {session.startTime} - {session.endTime}
            </p>
          )}
          {showPresenters && <p>{session.presenters?.join(", ")}</p>}
          {showAbstract && <p>{session.abstract}</p>}
        </div>
      ))}
    </div>
  );
};
