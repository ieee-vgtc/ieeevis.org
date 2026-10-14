# ieeevis.org

Hi! This is the Astro version of the [IEEE VIS website](http://ieeevis.org).

The `vis2026` branch (the page you're currently viewing) is the current year's website.

To edit files in other years, check out the other `vis*` branches. Click the below links to teleport:

- [vis2025](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2024) - the 2025 redesign
- [vis2024](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2024) - the 2024 redesign
- [vis2023](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2023) - the 2023 redesign
- [vis2022](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2022) - the 2022 redesign
- [vis2021](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2021) - the 2021 redesign
- [vis2020](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2020) - the 2020 redesign
- [vis2019](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2019) - the 2019 redesign
- [master](https://github.com/ieee-vgtc/ieeevis.org/tree/master) - the original website design (years 2018 and previous)

## Contributing

If you're contributing content, but not administrating the website itself, you will want to follow the [contributor's guide](src/pages/info/contributing.md).

## Building Locally

The website uses Node.js. To install Node and npm, follow the instructions on the [Node Website](https://nodejs.org).

Once Node is installed, install the dependencies

```
npm install
```

Now you can run the site locally by running

```
npm run dev
```

Make changes to the site:

- To edit content on a particular page, go to `src/pages` and find the corresponding markdown file for the page you want to edit.
- To edit navigation or sidebars, find the respective `yml` file in `src/data`. You may need to shutdown and restart the site to see your `yml` changes.

When you have made changes and would like to submit them, open a new pull request for the web chairs to review.

## Inactive pages

Pages that are not yet ready to publish can be listed under `inactivePathPrefixes` in `src/config/pages-allow-list.ts`; visitors (and search-engine crawlers) hitting those paths are redirected to the home page with a 302. Individual pages inside an inactive folder can be selectively re-enabled by adding their exact path to `activePathOverrides` in the same file.

## Sign-in and the Bluesky discussions (Auth0 setup)

Attendees sign in through Auth0, entirely client-side (`src/lib/auth0Client.ts`; variables in `.env.example`). This is deliberately the "SPA" (PKCE, public client) flow rather than a server-backed one: the S3 deploys serve static files only, with no backend to hold a client secret or a session, so the sign-in has to work the same way everywhere — local dev, Netlify previews, and the S3-hosted staging/production sites — without any of them running a server. The trade-off is that the signed-in state lives in the reader's own browser (`localStorage`, via `@auth0/auth0-spa-js`) rather than something the server can vouch for; that's fine for what it gates on this site (a sign-in prompt in place of a PDF link, an attendee's display name in the nav) and is why it only ever gates that kind of content, never something a forged client-side state could turn into real access.

The Auth0 application backing it must be of type **Single Page Application**, not **Regular Web Application** — an SPA is a public client with no secret.

**Allowed Callback URLs** and **Allowed Logout URLs**: every origin this site is served from, with `/auth/callback` and `/` respectively appended — `http://localhost:4321`, staging, production, and `https://*.netlify.app` as one wildcard entry for every PR's deploy preview (Auth0 matches `*` against one subdomain label, which is exactly the random `deploy-preview-1234--sitename` segment Netlify generates).

- **Allowed Web Origins**: the same origins, no path — needed for the SDK's CORS requests to Auth0's token endpoint.
- **Advanced Settings → Grant Types**: "Refresh Token" checked, with `offline_access` an allowed scope, so a session survives the ID token's own expiry (a few hours) without depending on a third-party-cookie silent-auth iframe, which Safari and Firefox block by default.

Everything that has to trust the attendee's identity — commenting and liking as a guest in the Bluesky discussions, saving a Bluesky handle, the account page's "Your papers and sessions" — goes to **bsky-api** (the conferentech repo's `supabase/functions/bsky-api`, at `https://bsky.tech.ieeevis.org`; client in `src/lib/bskyApi.ts`). The browser sends the attendee's raw Auth0 ID token as a bearer credential, and bsky-api verifies it against Auth0's public keys (RS256, this site's `PUBLIC_AUTH0_CLIENT_ID` as the audience). The site itself holds no secret and runs no server code for any of it, so it all works the same on the S3 deploys. Set `PUBLIC_BSKY_API_BASE` to test against a local bsky-api.

**Reading the profile (Login Action)**: An attendee's Bluesky handle and company are stored on their Auth0 user as `user_metadata.bsky_handle` and `user_metadata.company`. Auth0 does not put `user_metadata` into ID tokens, so a Post Login Action copies them into the namespaced claims `https://ieeevis.org/bsky_handle` and `https://ieeevis.org/company`. The discussion reads the handle for its one-click "Log in as @handle", and the account page (`/account/`) shows both. The Action always sets both claims (an empty string for no value), so the account page can tell "Not provided" from "Unable to fetch" (the claim is missing). Check it under **Actions → Library** (name in 2026: `Add bsky_handle claim`) and confirm it is attached under **Actions → Triggers → post-login**. It must contain:

```js
exports.onExecutePostLogin = async (event, api) => {
  const metadata = event.user.user_metadata ?? {};
  for (const key of ["bsky_handle", "company"]) {
    const value = metadata[key];
    api.idToken.setCustomClaim(
      `https://ieeevis.org/${key}`,
      typeof value === "string" ? value.trim() : "",
    );
  }
};
```

Without it, sign-in still works; the site just never learns the handle, and the account page shows "Unable to fetch" for both.

**Writing the handle**: The account page, and the discussion after an attendee logs in with Bluesky, can save a handle to the attendee's profile. bsky-api's `POST /api/me/bsky-handle` does that: it checks the handle exists on Bluesky, then updates only `user_metadata.bsky_handle` through the Auth0 Management API, with the credentials kept in bsky-api's own `private_keys` (never on this site). The site then refreshes the attendee's ID token so the new claim shows up right away.

To verify after a change: sign in, open a paper, log in with Bluesky under the discussion, click Save, then check the user in **User Management → Users** — `user_metadata` shows `bsky_handle`, and after the attendee's ID token next refreshes the discussion greets them with a one-click "Log in as @handle" button.

The Bluesky login itself needs nothing in Auth0: the site is a public ATProto OAuth client whose metadata is served from its own origin (`src/components/bluesky/oauth.ts`).

## Automatic building

After your PR is merged in, GitHub Actions will automatically build the staging site using the workflow file contained in [.github/workflows/staging.yml](/.github/workflows/staging.yml).

![](https://github.com/ieee-vgtc/ieeevis.org/workflows/build%20staging/badge.svg)

The web team will periodically create a release, which will deploy the latest changes to the production site.
