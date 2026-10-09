/**
 * The page Bluesky sends the reader back to after they approve the login.
 *
 * The OAuth response rides in the URL fragment. The client exchanges it for
 * a session, stores the session in this browser, and the reader is returned
 * to the page they came from (a paper's discussion or the account page) —
 * the path travelled along as the OAuth `state`, so nothing here trusts the
 * URL beyond what the library verified. A login that did not complete (e.g.
 * cancelled) links back to that page too, when Bluesky still returned it.
 */

import { useEffect, useState } from "react";
import { withBaseURL } from "../../utils/withBaseURL";
import { completeLogin, LoginCallbackError } from "./oauth";

interface LoginFailure {
  message: string;
  /** The page the reader started the login from, when it is known. */
  returnTo: string | null;
}

export default function OAuthCallback() {
  const [error, setError] = useState<LoginFailure | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { returnTo } = await completeLogin();
        if (!cancelled) {
          window.location.replace(returnTo);
        }
      } catch (err) {
        console.error("Bluesky login did not complete:", err);
        if (!cancelled) {
          // The login can start on a paper page or the account page; send
          // the reader back to whichever it was, when Bluesky told us.
          const failure = err instanceof LoginCallbackError ? err : null;
          setError({
            message: failure?.cancelled
              ? "The Bluesky login was cancelled."
              : "The Bluesky login could not be completed. Go back and try again.",
            returnTo: failure?.returnTo ?? null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p>
        {error.message}{" "}
        {error.returnTo ? (
          <a href={error.returnTo}>Back to where you were</a>
        ) : (
          <a href={withBaseURL("/program/papers")}>Back to the papers</a>
        )}
      </p>
    );
  }

  return <p>Finishing your Bluesky login…</p>;
}
