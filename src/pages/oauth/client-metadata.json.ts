/**
 * The OAuth client metadata Bluesky reads when a reader logs in with their
 * Bluesky account from a discussion (see `components/bluesky/oauth.ts`).
 *
 * Served at request time so that `client_id` — which must be this very URL —
 * and the redirect URI follow the deployment's origin: production, a deploy
 * preview and a local checkout each register as their own client, with no
 * environment variable to keep in step.
 */

import type { APIRoute } from "astro";
import { buildClientMetadata } from "../../components/bluesky/oauth";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return new Response(JSON.stringify(buildClientMetadata(url.origin, base)), {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "application/json; charset=utf-8",
    },
  });
};
