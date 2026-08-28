import type { MiddlewareHandler } from "astro";
import { isPathInactive, stripBaseURL } from "./config/pages-allow-list";

//https://docs.astro.build/en/guides/middleware/
export const onRequest: MiddlewareHandler = async (context, next) => {
  const pathWithoutBase = stripBaseURL(context.url.pathname);

  if (isPathInactive(pathWithoutBase)) {
    // 302 = temporary redirect so search engines keep the URL for when it goes live
    return context.redirect(import.meta.env.BASE_URL, 302);
  }

  const response = await next();

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
