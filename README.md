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

Attendees sign in through Auth0 (`src/lib/auth0.ts`; variables in `.env.example`). The paper pages' Bluesky discussion uses that session in two ways, and each needs a piece of Auth0 configuration that lives outside this repository. Check both when the tenant, the application, or the season changes.

**1. The `bsky_handle` claim (Login Action).** An attendee's Bluesky handle is stored on their Auth0 user as `user_metadata.bsky_handle`. Auth0 does not put `user_metadata` into ID tokens, so a Post Login Action copies it into the namespaced claim `https://ieeevis.org/bsky_handle`, which `verifyAuth0IdToken` reads. Check it under **Actions → Library** (name in 2026: `Add bsky_handle claim`) and confirm it is attached under **Actions → Triggers → post-login**. The code it must contain is in the comment on `BSKY_HANDLE_CLAIM` in `src/lib/auth0.ts`. Without it, sign-in still works; the site just never learns the handle.

**2. Writing the handle (Management API grant).** After an attendee logs in with Bluesky on a paper page, the site offers to save the handle to their profile. `POST /auth/bluesky-handle` does that through the Auth0 Management API with a client-credentials token, which needs an application authorized for the **Auth0 Management API** with the `update:users` permission. In 2026 this is a separate Machine to Machine application whose credentials are in the Netlify environment as `AUTH0_MANAGEMENT_CLIENT_ID` and `AUTH0_MANAGEMENT_CLIENT_SECRET`. (Alternative: authorize the login application itself; that requires setting its Token Endpoint Authentication Method to Post before the Client Credentials grant can be enabled.) Without the grant, everything works except the Save button, which fails with a 500.

To verify after a change: sign in, open a paper, log in with Bluesky under the discussion, click Save, then check the user in **User Management → Users** — `user_metadata` shows `bsky_handle`, and after a site re-login the discussion greets you with a one-click "Log in as @handle" button.

The Bluesky login itself needs nothing in Auth0: the site is a public ATProto OAuth client whose metadata is served from its own origin (`src/components/bluesky/oauth.ts`).

## Automatic building

After your PR is merged in, GitHub Actions will automatically build the staging site using the workflow file contained in [.github/workflows/staging.yml](/.github/workflows/staging.yml).

![](https://github.com/ieee-vgtc/ieeevis.org/workflows/build%20staging/badge.svg)

The web team will periodically create a release, which will deploy the latest changes to the production site.
