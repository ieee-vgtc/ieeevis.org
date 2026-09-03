import type { APIRoute } from "astro";
import {
  clearSessionCookie,
  getAuth0Config,
  getLogoutUrl,
} from "../../lib/auth0";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  clearSessionCookie(cookies);

  try {
    return Response.redirect(getLogoutUrl(getAuth0Config(url)), 302);
  } catch (error) {
    console.error("Unable to start Auth0 logout:", error);
    return new Response("Unable to log out because Auth0 is not configured.", {
      status: 500,
    });
  }
};
