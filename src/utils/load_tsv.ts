// src/utils/load_tsv.ts
import fs from "node:fs";
import path from "node:path";

/**
 * Parses a tab separated file with a header row into a list of records.
 * Values are trimmed, and rows that are entirely empty are dropped.
 */
export function load_tsv(filePath: string): Record<string, string>[] {
  const fullPath = path.resolve(filePath);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const lines = fileContents
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split("\t").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    return Object.fromEntries(
      headers.map((header, idx) => [header, (cells[idx] || "").trim()]),
    );
  });
}

/**
 * Splits a semicolon separated list of people into name/affiliation pairs.
 * Everything after the first comma is treated as the affiliation, so entries
 * like "Alexander Lex, Graz University of Technology, University of Utah"
 * keep both institutions together.
 */
export function parse_people(
  value: string,
): { name: string; affiliation: string }[] {
  return (value || "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const idx = entry.indexOf(",");
      if (idx === -1) {
        return { name: entry, affiliation: "" };
      }
      return {
        name: entry.slice(0, idx).trim(),
        affiliation: entry.slice(idx + 1).trim(),
      };
    });
}
