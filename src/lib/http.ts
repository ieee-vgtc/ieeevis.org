/** A JSON response for the site's API routes; per-user answers are never cached. */
export function jsonResponse(
  body: unknown,
  status = 200,
  cacheControl = "no-store",
) {
  return new Response(JSON.stringify(body), {
    headers: {
      "cache-control": cacheControl,
      "content-type": "application/json; charset=utf-8",
    },
    status,
  });
}
