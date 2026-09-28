// src/utils/load_tsv.ts
import fs from "node:fs";
import path from "node:path";

/**
 * Splits TSV text into rows of cells. Spreadsheet exports wrap a cell in
 * quotes when it contains a quote, tab, or line break, and double the quotes
 * inside it: `"Do You ""Trust"" This?"` is the cell `Do You "Trust" This?`.
 */
function parse_tsv_rows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      quoted = true;
    } else if (char === "\t") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/**
 * Parses tab separated text with a header row into a list of records.
 * Values are trimmed, and rows that are entirely empty are dropped.
 */
export function parse_tsv(text: string): Record<string, string>[] {
  const rows = parse_tsv_rows(text).filter((cells) =>
    cells.some((cell) => cell.trim().length > 0),
  );

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows
    .slice(1)
    .map((cells) =>
      Object.fromEntries(
        headers.map((header, idx) => [header, (cells[idx] || "").trim()]),
      ),
    );
}

/**
 * Parses a tab separated file with a header row into a list of records.
 */
export function load_tsv(filePath: string): Record<string, string>[] {
  const fullPath = path.resolve(filePath);
  return parse_tsv(fs.readFileSync(fullPath, "utf8"));
}

export function load_json(filePath: string): Record<string, string>[] {
  const fullPath = path.resolve(filePath);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(fileContents);
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
