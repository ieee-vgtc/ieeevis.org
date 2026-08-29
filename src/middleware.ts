import type { MiddlewareHandler } from "astro";
import { isPathInactive, stripBaseURL } from "./config/pages-allow-list";
import { readSession } from "./lib/auth0";

//https://docs.astro.build/en/guides/middleware/
export const onRequest: MiddlewareHandler = async (context, next) => {
  const pathWithoutBase = stripBaseURL(context.url.pathname);

  if (isPathInactive(pathWithoutBase)) {
    // 302 = temporary redirect so search engines keep the URL for when it goes live
    return context.redirect(import.meta.env.BASE_URL, 302);
  }

  // No route is fully login-walled: individual pages (e.g. paper/poster
  // detail pages) decide for themselves which pieces of content — a PDF
  // link, a video embed — require a signed-in session, and gate just those.
  // We still resolve the session here, once per request, so every page can
  // read `Astro.locals.user` without re-parsing the cookie itself.
  context.locals.user = await readSession(context.cookies, context.url);

  const nextResponse = await next();
  // Response.redirect() (used by /auth/login, /auth/callback, /auth/logout)
  // returns headers that are immutable, so those need reconstructing before
  // we can add the site-wide security headers below. Every other response
  // gets its headers set in place instead of being rebuilt: rebuilding wraps
  // a fresh Response around the original body stream, which is harmless
  // locally but silently drops the body under Netlify's production Function
  // runtime for full HTML pages.
  const isRedirect = [301, 302, 303, 307, 308].includes(nextResponse.status);
  const response = isRedirect
    ? new Response(nextResponse.body, {
        status: nextResponse.status,
        statusText: nextResponse.statusText,
        headers: new Headers(nextResponse.headers),
      })
    : nextResponse;

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
      // read straight from Bluesky
      "img-src 'self' data: https://bsky.tech.ieeevis.org https://cdn.bsky.app",

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

      // NETWORK (HMR, APIs, etc.) — bsky.tech.ieeevis.org is the Bluesky
      // discussion API for paper pages, public.api.bsky.app the Bluesky AppView
      // that threads are read from directly
      isDev
        ? "connect-src 'self' ws: http: https:"
        : "connect-src 'self' https://bsky.tech.ieeevis.org https://public.api.bsky.app",

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
