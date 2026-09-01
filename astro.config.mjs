// @ts-check
import { defineConfig } from "astro/config";

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
  integrations: [
    react(),
    sitemap(),
    pagefind(),
    brokenLinksChecker({
      logFilePath: "broken-links.log",
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
