import { features } from "../config/pages-allow-list";
import type { Paper } from "../types/paper";
import type { ProgramEventDefinition } from "../types/program";
import type { Poster } from "../types/poster";
import { readFile } from "fs/promises";

const arrayCheck = <T>(data: T) => (Array.isArray(data) ? data : ([] as T[]));

export const fetchAllPapers = async () =>
  fetchAll<Paper>("paper").then(arrayCheck) as Promise<Paper[]>;
export const fetchAllSessions = async () =>
  fetchAll<ProgramEventDefinition>("session").then((x) =>
    Object.values(x),
  ) as Promise<ProgramEventDefinition[]>;
export const fetchAllPosters = async () =>
  fetchAll<Poster>("poster").then(arrayCheck) as Promise<Poster[]>;

export async function fetchAll<T>(
  type: "paper" | "session" | "poster",
): Promise<T[]> {
  if (features.weekOfVis.enabled) {
    if (features.weekOfVis.useLocalSources) {
      try {
        const data = await readFile(
          `.${features.weekOfVis.localSources[type]}`,
          "utf-8",
        );
        return JSON.parse(data) as T[];
      } catch (error) {
        console.error(
          `Error reading local ${type} data from ${features.weekOfVis.localSources[type]}:`,
          error,
        );
        return [];
      }
    }
  }
  try {
    const response = await fetch(features.weekOfVis.sources[type]);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} data for type ${type}:`, error);
    return [];
  }
}
