import type { MiddlewareHandler } from "astro";

//https://docs.astro.build/en/guides/middleware/
export const onRequest: MiddlewareHandler = async (context, next) => {
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

      // IMAGES
      "img-src 'self' data:",

      // FONTS
      "font-src 'self' https://fonts.gstatic.com/s/zillaslab/ https://fonts.gstatic.com/s/materialicons/ https://fonts.gstatic.com/s/firasans/",

      // STYLES
      isDev
        ? "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
        : "style-src 'self' https://fonts.googleapis.com",

      // SCRIPTS
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self'",

      // NETWORK (HMR, APIs, etc.)
      isDev ? "connect-src 'self' ws: http:" : "connect-src 'self'",

      // Enforce HTTPS in prod only
      !isDev && "upgrade-insecure-requests",
    ]
      .filter(Boolean)
      .join("; "),
  );

  return response;
};
