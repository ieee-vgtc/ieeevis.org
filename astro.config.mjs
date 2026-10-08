// @ts-check
import { defineConfig, sessionDrivers } from "astro/config";

import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import pagefind from "astro-pagefind";

//https://docs.astro.build/en/guides/integrations-guide/sitemap/
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import rehypeExternalLinks from "rehype-external-links";
import brokenLinksChecker from "./src/integrations/broken-links-checker.js";
import checkRepoFileLinks from "./src/integrations/check-repo-file-links.js";

import pkg from "./package.json" with { type: "json" };

// https://astro.build/config
export default defineConfig({
  base: process.env.BASE_PATH || "/year/2026", //this can be accessed in tsx and astro as import.meta.env.BASE_URL
  // Attendee sign-in happens entirely client-side (src/lib/auth0Client.ts),
  // and everything that must trust the attendee's identity goes to bsky-api
  // (src/lib/bskyApi.ts), so every page is prerendered and the S3 deploys,
  // which serve static files only, get the whole site.
  output: "static",
  // The app never touches Astro.session; without this, @astrojs/netlify silently
  // defaults to a Netlify Blobs-backed session store on every build. Set
  // explicitly to rule out that unused dependency as a source of trouble.
  session: {
    // `memory` exists on the actual driver map (astro/dist/core/session/drivers.js
    // derives it from unstorage's full builtinDrivers list) but is missing from
    // Astro's typed `sessionDrivers` object - an upstream .d.ts gap, not a real
    // type mismatch.
    // @ts-expect-error - see above
    driver: sessionDrivers.memory(),
  },
  adapter: netlify({
    // Edge Functions emulation is enabled by default and starts a managed
    // Deno server, even though this project does not define any Netlify Edge
    // Functions. Disable only that unused runtime for plain `astro dev`.
    devFeatures: {
      environmentVariables: false,
      images: true,
      edgeFunctions: false,
    },
    // Read from the filesystem at render time (src/utils/load_yaml.ts,
    // src/utils/paperData.ts) via readFileSync, so they must be explicitly
    // bundled into Netlify's serverless function or every page that reads
    // them (which, via DefaultLayout/HomePageLayout/Sidebar, is nearly all
    // of them) throws ENOENT once deployed.
    includeFiles: [
      "src/data/program/*.json",
      "src/data/program_test/*.json",
      "src/data/*.yml",
      "src/data/sidebars/*.yml",
    ],
  }),
  integrations: [
    react(),
    sitemap(),
    pagefind(),
    // Wraps astro-broken-links-checker, which only knows about files emitted
    // at build time. Writes .link-checker/broken-links.log.
    brokenLinksChecker({
      checkExternalLinks: false,
      throwError: true,
    }),
    // brokenLinksChecker skips external links, so links back into this repo
    // (e.g. the footer's "suggest a fix") are verified against the file tree.
    checkRepoFileLinks({
      repository: pkg.repository.url,
      throwError: true,
    }),
  ],
  // The deploy workflows set SITE; Netlify deploy previews set none, so fall
  // back to the preview's own URL. The Bluesky OAuth client metadata
  // (src/pages/oauth/client-metadata.json.ts) is built with this origin.
  site: process.env.SITE || process.env.DEPLOY_PRIME_URL,
  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
          },
        ],
      ],
    }),
  },
  vite: {
    // `astro build` (also run by the pre-commit hook) pre-bundles
    // dependencies in production mode. Sharing the dev server's cache let a
    // build replace React with its production bundle under a running dev
    // server ("_jsxDEV is not a function"), so builds get their own cache.
    cacheDir: process.argv.includes("build")
      ? "node_modules/.vite-build"
      : "node_modules/.vite",
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
    plugins: [tailwindcss()],
  },
});
