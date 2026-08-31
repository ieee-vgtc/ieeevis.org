import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Astro integration that validates links back into this repository.
 *
 * astro-broken-links-checker only follows internal site links, so a footer
 * "suggest a fix" link (or a hand-written blob link in a page) can point at a
 * file that does not exist and 404 on GitHub without anything noticing. Those
 * links reference files that are sitting right here on disk, so they can be
 * verified at build time without hitting the network.
 */

const HREF_PATTERN = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const REPO_FILE_URL =
  /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/(?:edit|blob|tree|raw)\/([^/]+)\/([^?#]+)/;

function collect_html_files(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entry_path = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collect_html_files(entry_path));
    } else if (entry.name.endsWith(".html")) {
      files.push(entry_path);
    }
  }
  return files;
}

function decode_href(href) {
  const decoded = href
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&")
    .replaceAll("&quot;", '"');
  try {
    return decodeURIComponent(decoded);
  } catch {
    return decoded;
  }
}

export default function checkRepoFileLinks(options = {}) {
  const {
    repository,
    logFilePath = path.join(".link-checker", "broken-repo-file-links.log"),
    throwError = true,
  } = options;

  // "https://github.com/ieee-vgtc/ieeevis.org" -> ["ieee-vgtc", "ieeevis.org"]
  const [owner, repo] = String(repository || "")
    .replace(/\.git$/, "")
    .split("/")
    .slice(-2);

  let project_root = process.cwd();

  return {
    name: "check-repo-file-links",
    hooks: {
      "astro:config:setup": ({ config }) => {
        project_root = fileURLToPath(config.root);
      },

      "astro:build:done": ({ dir, logger }) => {
        if (!owner || !repo) {
          logger.warn(
            "No repository configured; skipping repo file link check.",
          );
          return;
        }

        const dist_path = fileURLToPath(dir);
        const html_files = collect_html_files(dist_path);
        logger.info(
          `Checking ${html_files.length} html pages for links to missing ${owner}/${repo} files`,
        );

        // missing repo path -> set of pages that link to it
        const broken = new Map();
        const seen = new Map();

        for (const html_file of html_files) {
          const html = fs.readFileSync(html_file, "utf8");
          for (const [, quoted, single_quoted] of html.matchAll(HREF_PATTERN)) {
            const url = decode_href(quoted ?? single_quoted ?? "");
            const match = url.match(REPO_FILE_URL);
            if (!match) {
              continue;
            }
            const [, link_owner, link_repo, , repo_path] = match;
            if (link_owner !== owner || link_repo !== repo) {
              continue;
            }

            if (!seen.has(repo_path)) {
              seen.set(
                repo_path,
                fs.existsSync(path.join(project_root, repo_path)),
              );
            }
            if (seen.get(repo_path)) {
              continue;
            }

            if (!broken.has(url)) {
              broken.set(url, new Set());
            }
            broken.get(url).add(path.relative(dist_path, html_file));
          }
        }

        if (broken.size === 0) {
          logger.info("No links to missing repository files detected.");
          if (fs.existsSync(logFilePath)) {
            fs.rmSync(logFilePath);
          }
          return;
        }

        let log_data = "";
        for (const [url, pages] of broken) {
          log_data += `Link to missing repository file: ${url}\n  Found in:\n`;
          for (const page of [...pages].sort()) {
            log_data += `    - ${page}\n`;
          }
        }
        log_data = log_data.trim();

        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
        fs.writeFileSync(logFilePath, log_data, "utf8");
        logger.warn(log_data);
        logger.info(`Logged to ${logFilePath}`);

        if (throwError) {
          throw new Error(
            `${broken.size} link(s) point at files that do not exist in ${owner}/${repo}. Check the log file: ${logFilePath}`,
          );
        }
      },
    },
  };
}
