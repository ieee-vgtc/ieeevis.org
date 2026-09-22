/**
 * Puts a Bluesky handle on the signed-in attendee's profile — the
 * `user_metadata.bsky_handle` their Auth0 user carries — and re-issues the
 * session so `/auth/token` sends it in the `bluesky` claim straight away.
 *
 * Called from the discussion after a reader logs in with Bluesky and agrees
 * to save the handle. The site cannot check that the reader owns the handle
 * (the Bluesky session lives in their browser), and it does not need to: the
 * claim marks their own Bluesky replies as theirs on their own screen and
 * pre-fills the login; it grants nothing.
 *
 * SETUP: the Auth0 application needs a Management API grant with the
 * `update:users` scope, or AUTH0_MANAGEMENT_CLIENT_ID and
 * AUTH0_MANAGEMENT_CLIENT_SECRET set to a machine-to-machine app that has it.
 * See `getManagementToken` in lib/auth0.ts.
 */

import type { APIRoute } from "astro";
import {
  createSession,
  getAuth0Config,
  readBskyHandleInput,
  readSession,
  saveBskyHandle,
  setSessionCookie,
} from "../../lib/auth0";
import { jsonResponse as json } from "../../lib/http";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request, url }) => {
  const user = await readSession(cookies, url);
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
    const config = getAuth0Config(url);
    await saveBskyHandle(config, user.sub, handle);
    setSessionCookie(
      cookies,
      await createSession(config, { ...user, bskyHandle: handle }),
    );
    return json({ handle }, 200);
  } catch (error) {
    console.error("Unable to save the Bluesky handle:", error);
    return json({ error: "save_failed" }, 500);
  }
};
