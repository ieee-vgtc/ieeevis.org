/**
 * Static OAuth metadata for S3 and Netlify. Use the deployment origin,
 * falling back to the request URL when no build origin is configured.
 */

import type { APIRoute } from "astro";
import { buildClientMetadata } from "../../components/bluesky/oauth";
import { jsonResponse } from "../../lib/http";
import { siteBase } from "../../utils/withBaseURL";

export const prerender = true;

export const GET: APIRoute = ({ url, site }) =>
  jsonResponse(
    buildClientMetadata(
      new URL(process.env.DEPLOY_PRIME_URL || site || url).origin,
      siteBase(),
    ),
    200,
    "public, max-age=3600",
  );
