/**
 * Puts a Bluesky handle on the signed-in attendee's profile — the
 * `user_metadata.bsky_handle` their Auth0 user carries, which the Login
 * Action documented on `BSKY_HANDLE_CLAIM` (lib/auth0.ts) surfaces in their
 * next ID token for `/auth/token` to read as the `bluesky` claim.
 *
 * Called from the discussion after a reader logs in with Bluesky and agrees
 * to save the handle. The site cannot check that the reader owns the handle
 * (the Bluesky session lives in their browser), and it does not need to: the
 * claim marks their own Bluesky replies as theirs on their own screen and
 * pre-fills the login; it grants nothing.
 *
 * The caller (SaveHandlePrompt) force-refreshes its cached ID token right
 * after this succeeds, so the new claim shows up without waiting for the
 * token to expire on its own — see `refreshSession` in lib/auth0Client.ts.
 *
 * SETUP: the Auth0 application needs a Management API grant with the
 * `update:users` scope, or AUTH0_MANAGEMENT_CLIENT_ID and
 * AUTH0_MANAGEMENT_CLIENT_SECRET set to a machine-to-machine app that has it.
 * See `getManagementToken` in lib/auth0.ts.
 */

import type { APIRoute } from "astro";
import {
  getAuth0Config,
  readBskyHandleInput,
  saveBskyHandle,
  verifyBearerIdToken,
} from "../../lib/auth0";
import { jsonResponse as json } from "../../lib/http";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const config = getAuth0Config();
  const user = await verifyBearerIdToken(
    config,
    request.headers.get("authorization"),
  );
  if (!user) {
    return json({ error: "not_authenticated" }, 401);
  }

  let handle: string | undefined;
  try {
    const body = (await request.json()) as { handle?: unknown };
    handle = readBskyHandleInput(body.handle);
  } catch {
    handle = undefined;
  }
  if (!handle) {
    return json({ error: "invalid_handle" }, 400);
  }

  try {
    await saveBskyHandle(config, user.sub, handle);
    return json({ handle }, 200);
  } catch (error) {
    console.error("Unable to save the Bluesky handle:", error);
    return json({ error: "save_failed" }, 500);
  }
};
