import fs from "node:fs";
import path from "node:path";
import brokenLinksChecker from "astro-broken-links-checker";

/**
 * Wraps astro-broken-links-checker so links to on-demand routes are not
 * reported as broken.
 *
 * The checker validates links against the HTML files emitted at build time.
 * Routes with `prerender = false` (e.g. /program/paper/[paperId], which checks
 * the signed-in session on every request) never emit a file, so every link to
 * them looked broken. Those routes are collected from Astro's resolved route
 * list, and links matching them are dropped from the checker's results.
 */

const LINK_CHECKER_DIR = ".link-checker";
const LOG_FILE = path.join(LINK_CHECKER_DIR, "broken-links.log");

function parse_log(contents) {
  return contents
    .split(/^(?=Broken link: )/m)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => ({
      link: entry.match(/^Broken link: (.*)$/m)?.[1] ?? "",
      entry,
    }));
}

/**
 * @param {{ throwError?: boolean, checkExternalLinks?: boolean, [option: string]: unknown }} [options]
 *   passed through to astro-broken-links-checker
 */
export default function checkBrokenLinks({
  throwError = true,
  ...options
} = {}) {
  const checker = brokenLinksChecker({ ...options, throwError: false });
  let base = "";
  let onDemandRoutes = [];

  const is_on_demand = (link) => {
    let pathname = link.split(/[?#]/)[0];
    if (base && pathname.startsWith(base)) {
      pathname = pathname.slice(base.length) || "/";
    }
    return onDemandRoutes.some((route) => route.patternRegex.test(pathname));
  };

  return {
    name: "broken-links-checker",
    hooks: {
      "astro:config:setup": async (params) => {
        base = (params.config.base || "").replace(/\/$/, "");
        await checker.hooks["astro:config:setup"](params);
      },
      "astro:routes:resolved": ({ routes }) => {
        onDemandRoutes = routes.filter(
          (route) => route.type === "page" && !route.isPrerendered,
        );
      },
      "astro:build:done": async (params) => {
        const { logger } = params;
        // The checker logs its whole report at info level; this wrapper
        // reports the filtered result instead.
        const quietLogger = { ...logger, info: () => {} };
        await checker.hooks["astro:build:done"]({
          ...params,
          logger: quietLogger,
        });

        if (!fs.existsSync(LOG_FILE)) {
          logger.info("No broken links detected.");
          return;
        }

        const entries = parse_log(fs.readFileSync(LOG_FILE, "utf8"));
        const broken = entries.filter(({ link }) => !is_on_demand(link));
        const skipped = entries.length - broken.length;
        if (skipped > 0) {
          logger.info(
            `Skipped ${skipped} links to on-demand routes (${onDemandRoutes
              .map((route) => route.pattern)
              .join(", ")})`,
          );
        }

        if (broken.length === 0) {
          fs.rmSync(LOG_FILE);
          logger.info("No broken links detected.");
          return;
        }

        const report = broken.map(({ entry }) => entry).join("\n");
        fs.writeFileSync(LOG_FILE, report, "utf8");
        logger.warn(`${broken.length} broken links:\n${report}`);
        if (throwError) {
          throw new Error(
            `Broken links detected. Check the log file: ${LOG_FILE}`,
          );
        }
      },
    },
  };
}
