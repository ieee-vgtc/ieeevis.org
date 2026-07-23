import type { APIRoute } from "astro";
import {
  AUTH_TRANSACTION_COOKIE,
  clearTransactionCookie,
  createSession,
  exchangeAuthorizationCode,
  getAppUrl,
  getAuth0Config,
  readTransaction,
  setSessionCookie,
  verifyAuth0IdToken,
} from "../../lib/auth0";

export const prerender = false;

function callbackError(message: string) {
  return new Response(message, {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
    status: 400,
  });
}

export const GET: APIRoute = async ({ cookies, url }) => {
  const auth0Error = url.searchParams.get("error");
  if (auth0Error) {
    return callbackError("Authentication was cancelled or rejected by Auth0.");
  }

  try {
    const config = getAuth0Config();
    const transaction = await readTransaction(
      config,
      cookies.get(AUTH_TRANSACTION_COOKIE)?.value,
    );
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!transaction || !code || !state || state !== transaction.state) {
      clearTransactionCookie(cookies);
      return callbackError(
        "The login request could not be verified. Please try again.",
      );
    }

    const idToken = await exchangeAuthorizationCode(config, code);
    const user = await verifyAuth0IdToken(config, idToken, transaction.nonce);
    const session = await createSession(config, user);

    clearTransactionCookie(cookies);
    setSessionCookie(cookies, session);
    return Response.redirect(getAppUrl(config, transaction.returnTo), 302);
  } catch (error) {
    console.error("Unable to complete Auth0 login:", error);
    clearTransactionCookie(cookies);
    return callbackError(
      "Authentication could not be completed. Please try again.",
    );
  }
};
