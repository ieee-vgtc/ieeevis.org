import type { APIRoute } from "astro";
import {
  createTransaction,
  getAuthorizeUrl,
  getAuth0Config,
  safeReturnTo,
  setTransactionCookie,
} from "../../lib/auth0";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    const config = getAuth0Config(url);
    const transaction = await createTransaction(
      config,
      safeReturnTo(url.searchParams.get("returnTo")),
    );
    setTransactionCookie(cookies, transaction.token);
    return Response.redirect(getAuthorizeUrl(config, transaction), 302);
  } catch (error) {
    console.error("Unable to start Auth0 login:", error);
    return new Response(
      "Authentication is not configured. Add the Auth0 values to .env before testing locally.",
      { status: 500 },
    );
  }
};
