/**
 * The OAuth client metadata Bluesky reads when a reader logs in with their
 * Bluesky account from a discussion (see `components/bluesky/oauth.ts`).
 *
 * Built as a static file, because the production and staging deploys are
 * static files on S3 with no server to answer at request time. `client_id`
 * must be this very URL, so it is built from the deploy's own origin: the
 * `site` config (SITE in each deploy workflow, the preview URL on Netlify).
 * A local checkout does not use this file: it logs in as ATProto's loopback
 * client instead (see `isLoopback` in components/bluesky/oauth.ts).
 */

import type { APIRoute } from "astro";
import { buildClientMetadata } from "../../components/bluesky/oauth";
import { jsonResponse } from "../../lib/http";
import { siteBase } from "../../utils/withBaseURL";

export const prerender = true;

export const GET: APIRoute = ({ url }) =>
  jsonResponse(
    buildClientMetadata(url.origin, siteBase()),
    200,
    "public, max-age=3600",
  );
