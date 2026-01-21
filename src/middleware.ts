import type { MiddlewareHandler } from "astro";

//https://docs.astro.build/en/guides/middleware/
export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();

  //CSP is currently in report only mode and will be enforced in the future
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data:",
      "font-src 'self' https://fonts.gstatic.com/s/zillaslab/ https://fonts.gstatic.com/s/materialicons/ https://fonts.gstatic.com/s/firasans/",
      "style-src 'self' https://fonts.googleapis.com",
      "script-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  return response;
};
