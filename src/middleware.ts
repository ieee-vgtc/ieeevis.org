import type { MiddlewareHandler } from "astro";
import { features } from "./config/pages-allow-list";
import { readSession } from "./lib/auth0";

//https://docs.astro.build/en/guides/middleware/
export const onRequest: MiddlewareHandler = async (context, next) => {
  // Strip the base path (e.g. "/year/2026") so denylist entries can be written
  // as plain paths like "/info/awards" regardless of deployment base.
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const rawPath = context.url.pathname;
  const pathWithoutBase = rawPath.startsWith(base)
    ? rawPath.slice(base.length) || "/"
    : rawPath;

  const isOverridden = (
    features.activePathOverrides as readonly string[]
  ).includes(pathWithoutBase);

  const isInactive =
    !isOverridden &&
    features.inactivePathPrefixes.some(
      (prefix) =>
        pathWithoutBase === prefix || pathWithoutBase.startsWith(prefix + "/"),
    );

  if (isInactive) {
    // 302 = temporary redirect so search engines keep the URL for when it goes live
    return context.redirect(import.meta.env.BASE_URL, 302);
  }

  // No route is fully login-walled: individual pages (e.g. paper/poster
  // detail pages) decide for themselves which pieces of content — a PDF
  // link, a video embed — require a signed-in session, and gate just those.
  // We still resolve the session here, once per request, so every page can
  // read `Astro.locals.user` without re-parsing the cookie itself.
  context.locals.user = await readSession(context.cookies);

  const nextResponse = await next();
  // Endpoint responses such as Response.redirect() have immutable headers.
  // Copy them before adding the site-wide security headers below.
  const response = new Response(nextResponse.body, {
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

      // IMAGES
      "img-src 'self' data:",

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

      // NETWORK (HMR, APIs, etc.)
      isDev ? "connect-src 'self' ws: http: https:" : "connect-src 'self'",

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
