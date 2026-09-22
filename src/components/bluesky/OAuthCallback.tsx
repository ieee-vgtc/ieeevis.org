/**
 * The page Bluesky sends the reader back to after they approve the login.
 *
 * The OAuth response rides in the URL fragment. The client exchanges it for
 * a session, stores the session in this browser, and the reader is returned
 * to the discussion they came from — the path travelled along as the OAuth
 * `state`, so nothing here trusts the URL beyond what the library verified.
 */

import { useEffect, useState } from "react";
import { withBaseURL } from "../../utils/withBaseURL";
import { completeLogin } from "./oauth";

export default function OAuthCallback() {
  const [error, setError] = useState<string | null>(null);

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
          setError(
            "The Bluesky login could not be completed. Go back to the paper and try again.",
          );
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
        {error} <a href={withBaseURL("/program/papers")}>Back to the papers</a>
      </p>
    );
  }

  return <p>Finishing your Bluesky login…</p>;
}
