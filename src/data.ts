import raw from "../data/sample-processes.json";
// EXAMPLE DATA: replace data/sample-processes.json with your own registry export.
export type P = [string, string, string, string, string, string, string, string, string, string[], string, string, string, string, number[]];
export type ON = [string, string, string, string, string, string, string];
const r = raw as any;
export const D: P[] = r.processes;
export const CAT: Record<string, string> = r.categories;
export const PAUSED: string[] = r.paused;
export const DET: Record<string, string[]> = r.details;
export const UNK: Record<string, string[]> = r.unknown;
export const UNK2: Record<string, string[]> = r.unknownDetails;
export const MARKS: Record<string, { shape: string; color: string }> = r.marks;
export const DEVICES: string[] = r.devices;
export const OBS_SNAP: string = r.snapshot;
export const OBS_NOTES: ON[] = r.obsidianNotes;
export const OBS_TOTAL: number = r.obsidianRecentTotal ?? r.obsidianNotes.length;
export const OBS_BOTS: string[] = r.obsidianBots;
export const OBS_PROCS: Record<string, "r" | "w"> = r.obsidianProcs;
export const OBS_VAULT: string = (import.meta as any).env?.VITE_OBSIDIAN_VAULT || "SampleVault";
