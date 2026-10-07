import profiles from "../data/program/bsky_handle_list.json";
import { isBskyHandle, normalizeBskyHandle } from "./bskyHandle";

const handlesByEmail = new Map<string, string>();
for (const profile of profiles) {
  const email = profile.email?.trim().toLowerCase();
  const handle = normalizeBskyHandle(profile.handle || "");
  if (email && isBskyHandle(handle)) handlesByEmail.set(email, handle);
}

export function getBskyHandle(email?: string | null): string | undefined {
  return email ? handlesByEmail.get(email.trim().toLowerCase()) : undefined;
}
