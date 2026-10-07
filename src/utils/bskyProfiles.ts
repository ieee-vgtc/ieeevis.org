import { readFile } from "node:fs/promises";
import { isBskyHandle, normalizeBskyHandle } from "./bskyHandle";

interface BskyProfile {
  email: string | null;
  handle: string | null;
}

// Program data is downloaded separately and may be absent in preview/PR builds.
// Read it once on the server instead of requiring it during module resolution.
async function readProfiles(): Promise<BskyProfile[]> {
  try {
    const data: unknown = JSON.parse(
      await readFile("./src/data/program/bsky_handle_list.json", "utf8"),
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Error reading Bluesky profile data:", error);
    }
    return [];
  }
}

const handlesByEmail = new Map<string, string>();
for (const profile of await readProfiles()) {
  const email = profile.email?.trim().toLowerCase();
  const handle = normalizeBskyHandle(profile.handle || "");
  if (email && isBskyHandle(handle)) handlesByEmail.set(email, handle);
}

export function getBskyHandle(email?: string | null): string | undefined {
  return email ? handlesByEmail.get(email.trim().toLowerCase()) : undefined;
}
