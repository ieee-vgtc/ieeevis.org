// Netlify serves each origin dynamically; S3 builds prerender via astro.config.mjs.

import type { APIRoute } from "astro";
import { buildClientMetadata } from "../../components/bluesky/oauth";
import { jsonResponse } from "../../lib/http";
import { siteBase } from "../../utils/withBaseURL";

export const prerender = false;

export const GET: APIRoute = ({ url }) =>
  jsonResponse(buildClientMetadata(url.origin, siteBase()));
