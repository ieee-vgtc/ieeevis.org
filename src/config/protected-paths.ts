/**
 * Paths that require an authenticated VIS 2026 attendee session.
 *
 * Entries in `exact` protect one route. Entries in `prefixes` protect the
 * route itself and every nested route below it. Keep this list explicit: a
 * public page should never become private as an accidental side effect of a
 * broad prefix.
 */
export const protectedPaths = {
  exact: [
    "/program/calendar",
    "/program/sessions",
    "/program/papers",
    "/program/posters",
  ],
  prefixes: [
    "/program/session",
    "/program/paper",
    "/program/poster",
    // To protect a whole future section, add its root here, e.g. "/blog".
  ],
} as const;

export function isProtectedPath(pathname: string) {
  return (
    (protectedPaths.exact as readonly string[]).includes(pathname) ||
    (protectedPaths.prefixes as readonly string[]).some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}
