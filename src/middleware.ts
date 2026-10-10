import type { MiddlewareHandler } from "astro";
import { isPathInactive, stripBaseURL } from "./config/pages-allow-list";

//https://docs.astro.build/en/guides/middleware/
export const onRequest: MiddlewareHandler = async (context, next) => {
  const pathWithoutBase = stripBaseURL(context.url.pathname);

  if (isPathInactive(pathWithoutBase)) {
    // 302 = temporary redirect so search engines keep the URL for when it goes live
    return context.redirect(import.meta.env.BASE_URL, 302);
  }

  const nextResponse = await next();
  // Fully drain the body into a string instead of passing the stream
  // through. Astro renders pages as a stream by default, and a render-time
  // error part way through one (e.g. a missing data file) doesn't change
  // the status code - the headers are already committed at 200 by the
  // time the error happens, so the connection just ends with whatever was
  // already flushed, silently, with no error visible anywhere. Draining
  // with .text() surfaces that same error as a normal rejected promise
  // instead. This also sidesteps Response.redirect()'s immutable headers
  // (used by /auth/login, /auth/callback, /auth/logout), since we're
  // building a fresh Response either way.
  const body = await nextResponse.text();
  const response = new Response(body, {
    status: nextResponse.status,
    statusText: nextResponse.statusText,
    headers: new Headers(nextResponse.headers),
  });

  const isDev = import.meta.env.DEV;

  //CONTENT SECURITY POLICY
  response.headers.set(
    //CSP is currently in report only mode and will be enforced in the future
    "Content-Security-Policy-Report-Only",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",

      // VIDEO EMBEDS (paper video section) - commented out along with that
      // section until it's re-enabled; re-add when it ships:
      // "frame-src 'self' https://www.youtube.com https://iframe.mediadelivery.net",

      // IMAGES — bsky.tech.ieeevis.org serves proxied avatars/images for the
      // paper-page Bluesky discussions; cdn.bsky.app serves them for threads
      // read straight from Bluesky; data.tech.ieeevis.org serves the page 1
      // previews of the papers
      "img-src 'self' data: https://bsky.tech.ieeevis.org https://cdn.bsky.app https://data.tech.ieeevis.org",

      // FONTS
      "font-src 'self' https://fonts.gstatic.com data:",

      // STYLES
      isDev
        ? "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
        : "style-src 'self' https://fonts.googleapis.com",

      // SCRIPTS
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self'",

      // NETWORK (HMR, APIs, etc.) — "log in with Bluesky"
      // (components/bluesky/oauth.ts) talks to the reader's own PDS and
      // authorization server, which can be on any host: Eurosky, a self-hosted
      // PDS, or a did:web account. A list of hosts locks those readers out.
      isDev
        ? "connect-src 'self' ws: http: https:"
        : "connect-src 'self' https:",

      // Enforce HTTPS in prod only
      !isDev && "upgrade-insecure-requests",

      `report-uri ${import.meta.env.CSP_REPORT_TO}`,
      `report-to csp-endpoint`,
    ]
      .filter(Boolean)
      .join("; "),
  );

  response.headers.set(
    "Report-To",
    JSON.stringify({
      group: "csp-endpoint",
      max_age: 10886400,
      endpoints: [{ url: import.meta.env.CSP_REPORT_TO }],
    }),
  );

  response.headers.set(
    "Reporting-Endpoints",
    `csp-endpoint="${import.meta.env.CSP_REPORT_TO}"`,
  );

  return response;
};
