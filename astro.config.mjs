// @ts-check
import { defineConfig, sessionDrivers } from "astro/config";

import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import pagefind from "astro-pagefind";

//https://docs.astro.build/en/guides/integrations-guide/sitemap/
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
// @ts-ignore
import brokenLinksChecker from "astro-broken-links-checker";
import checkRepoFileLinks from "./src/integrations/check-repo-file-links.js";

import pkg from "./package.json" with { type: "json" };

// https://astro.build/config
export default defineConfig({
  base: process.env.BASE_PATH || "/year/2026", //this can be accessed in tsx and astro as import.meta.env.BASE_URL
  // Auth0 callbacks need a request-time runtime, and paper/poster detail
  // pages check the signed-in session on each request to decide whether to
  // show gated content (PDF links, video embeds) or a login prompt.
  output: "static",
  // The app has its own cookie-based session (src/lib/auth0.ts) and never
  // touches Astro.session; without this, @astrojs/netlify silently defaults
  // to a Netlify Blobs-backed session store on every build. Set explicitly
  // to rule out that unused dependency as a source of trouble.
  session: {
    // `memory` exists on the actual driver map (astro/dist/core/session/drivers.js
    // derives it from unstorage's full builtinDrivers list) but is missing from
    // Astro's typed `sessionDrivers` object - an upstream .d.ts gap, not a real
    // type mismatch.
    // @ts-expect-error - see above
    driver: sessionDrivers.memory(),
  },
  adapter: netlify({
    // Read from the filesystem at render time (src/utils/load_yaml.ts,
    // src/utils/paperData.ts) via readFileSync, so they must be explicitly
    // bundled into Netlify's serverless function or every page that reads
    // them (which, via DefaultLayout/HomePageLayout/Sidebar, is nearly all
    // of them) throws ENOENT once deployed.
    includeFiles: [
      "src/data/program_test/*.json",
      "src/data/*.yml",
      "src/data/sidebars/*.yml",
    ],
  }),
  integrations: [
    react(),
    sitemap(),
    pagefind(),
    brokenLinksChecker({
      logFilePath: "broken-links.log",
      checkExternalLinks: false,
      // This checker only validates files emitted at build time. Program
      // detail routes are intentionally rendered on demand, so their valid
      // links cannot be checked this way. The checker still writes its report.
      throwError: false,
    }),
    // brokenLinksChecker skips external links, so links back into this repo
    // (e.g. the footer's "suggest a fix") are verified against the file tree.
    checkRepoFileLinks({
      repository: pkg.repository.url,
      throwError: true,
    }),
  ],
  site: process.env.SITE,
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },
  vite: {
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
    plugins: [tailwindcss()],
  },
});
