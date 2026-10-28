// Config-driven Obsidian adapter (EXAMPLE). Copy and edit for your own vault.
// source: "local" (vault on this machine), "syncthing" / "smb" (synced copy), "rest" (Obsidian Local REST API at restUrl).
// The page never fetches anything; "rest" is a placeholder for a future adapter.
export type ObsSource = "local" | "syncthing" | "smb" | "rest";
const env = ((import.meta as any).env ?? {}) as Record<string, string>;
export const OBS_CFG = {
  vaultHost: env.VITE_OBSIDIAN_HOST || "Host A",
  vaultName: env.VITE_OBSIDIAN_VAULT || "example vault",
  source: (env.VITE_OBSIDIAN_SOURCE || "local") as ObsSource,
  restUrl: "",
};
// Read-only sample excerpts keyed by vault-relative path (without .md).
export const OBS_EX: Record<string, string> = {
  "Notes/Index": "# Index for bots\nStart here. Each folder has one README note.",
  "Notes/Projects/Project X": "# Project X\nGoal: sample note.\nOwner: Bot A",
  "Notes/Lessons": "# Lessons\nKeep messages short.",
};
export const obsLink = (rel: string): string =>
  "obsidian://open?vault=" + encodeURIComponent(OBS_CFG.vaultName) + "&file=" + encodeURIComponent(rel);
