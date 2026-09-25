import type { APIRoute } from "astro";
import { readSession } from "../../lib/auth0";
import { jsonResponse as json } from "../../lib/http";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  const user = await readSession(cookies, url);

  return json({
    user: user ? { email: user.email, name: user.name } : null,
  });
};
