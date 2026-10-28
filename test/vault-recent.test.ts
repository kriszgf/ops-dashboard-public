import { describe, it, expect } from "vitest";
const PY = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
import { spawnSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, mkdirSync, utimesSync, readFileSync, rmSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
const CLI = resolve(__dirname, "../tools/vault-read");
const GEN = resolve(__dirname, "../tools/gen-recent");
const EXAMPLE_CFG = resolve(__dirname, "../config.example.json");
const FIXTURE = resolve(__dirname, "fixtures/sample-vault");
const setup = () => { const v = mkdtempSync(join(tmpdir(), "vaultr-")); cpSync(FIXTURE, v, { recursive: true }); return v; };
const run = (v: string, args: string[], extra: Record<string, string> = {}) =>
  spawnSync(PY, [CLI, "--json", ...args], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: resolve(__dirname, "../config.example.json"), VAULT_WRITE_ENABLED: "", ...extra }, encoding: "utf8" });
const snap = (d: string): string[] => readdirSync(d, { recursive: true }).map(String).sort().map((f) => { try { return f + ":" + readFileSync(join(d, f), "utf8"); } catch { return f + "/"; } });
const old = (p: string) => { const t = new Date("2020-01-01T00:00:00Z"); utimesSync(p, t, t); };
const ageAll = (v: string) => readdirSync(v, { recursive: true }).map(String).filter((f) => f.endsWith(".md")).forEach((f) => old(join(v, f)));

describe("vault-read recent/audit (v1.7.0)", () => {
  it("recent lists changed notes newest first, read-only", () => {
    const v = setup(); ageAll(v);
    writeFileSync(join(v, "Welcome.md"), "# Welcome\nchanged\n");
    const before = snap(v);
    const r = run(v, ["recent", "--hours", "1"]);
    expect(r.status).toBe(0);
    const items = JSON.parse(r.stdout);
    expect(items.map((x: any) => x.path)).toEqual(["Welcome.md"]);
    expect(items[0].by).toBeNull();
    expect(snap(v)).toEqual(before);
    rmSync(v, { recursive: true });
  });
  it("audit fails on unattributed changes and passes via manifest, frontmatter or write log", () => {
    const v = setup(); ageAll(v);
    writeFileSync(join(v, "Welcome.md"), "# Welcome\nchanged\n");
    writeFileSync(join(v, "Stamped.md"), "---\nbot: tester\n---\n# S\n");
    const a1 = run(v, ["audit", "--hours", "1"]);
    expect(a1.status).toBe(1);
    expect(JSON.parse(a1.stdout).unattributed).toEqual(["Welcome.md"]);
    const man = mkdtempSync(join(tmpdir(), "man-")); mkdirSync(join(man, "run1"));
    writeFileSync(join(man, "run1", "CHANGES.txt"), "BOT: Bot-A\nWelcome.md\n");
    const a2 = run(v, ["audit", "--hours", "1"], { VAULT_MANIFEST_DIRS: man });
    expect(a2.status).toBe(0);
    const items = JSON.parse(run(v, ["recent", "--hours", "1"], { VAULT_MANIFEST_DIRS: man }).stdout);
    expect(items.find((x: any) => x.path === "Welcome.md").by).toBe("Bot-A");
    expect(items.find((x: any) => x.path === "Stamped.md").via).toBe("frontmatter");
    rmSync(v, { recursive: true }); rmSync(man, { recursive: true });
  });
  it("create --stamp adds bot frontmatter (writes enabled only in test)", () => {
    const v = setup();
    const r = spawnSync(PY, [CLI, "--json", "create", "Inbox/s.md", "--bot", "tester", "--stamp", "--text", "# S\nx"], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: resolve(__dirname, "../config.example.json"), VAULT_WRITE_ENABLED: "1" }, encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(readFileSync(join(v, "Inbox/s.md"), "utf8")).toMatch(/^---\nbot: tester\nwritten: .*\nsource: vault-read\n---\n# S/);
    const items = JSON.parse(run(v, ["recent", "--hours", "1"]).stdout);
    expect(items.find((x: any) => x.path === "Inbox/s.md").via).toBe("write-log");
    rmSync(v, { recursive: true });
  });
  it("gen-recent keeps memories title-only and applies aliases", () => {
    const d = mkdtempSync(join(tmpdir(), "gen-"));
    writeFileSync(join(d, "r.json"), JSON.stringify([{ path: "Memories/2026/A.md", title: "A", modified: "2026-10-27T21:37:21+0100", by: "manifest:run1" }]));
    writeFileSync(join(d, "t.json"), JSON.stringify({ obsidianNotes: [] }));
    expect(spawnSync(PY, [GEN, join(d, "r.json"), join(d, "t.json"), "--alias", "manifest:run1=Bot A"], { env: { ...process.env, OPS_CONFIG: EXAMPLE_CFG }, encoding: "utf8" }).status).toBe(0);
    const row = JSON.parse(readFileSync(join(d, "t.json"), "utf8")).obsidianNotes[0];
    expect(row[4]).toBe("M"); expect(row[5]).toBe("Bot A");
    rmSync(d, { recursive: true });
  });
  it("gen-recent builds the Recently saved data from recent output", () => {
    const d = mkdtempSync(join(tmpdir(), "gen-"));
    writeFileSync(join(d, "r.json"), JSON.stringify([{ path: "Knowledge/Press/X.md", title: "X", modified: "2026-10-27T21:37:21+0100", created: "2026-10-27T21:37:21+0100", new: true, by: "Bot B" }, { path: "a/_backup-1/y.md", title: "y", modified: "2026-10-27T21:00:00+0100", by: null }]));
    writeFileSync(join(d, "t.json"), JSON.stringify({ obsidianNotes: [], snapshot: "" }));
    expect(spawnSync(PY, [GEN, join(d, "r.json"), join(d, "t.json")], { env: { ...process.env, OPS_CONFIG: EXAMPLE_CFG }, encoding: "utf8" }).status).toBe(0);
    const t = JSON.parse(readFileSync(join(d, "t.json"), "utf8"));
    expect(t.obsidianNotes).toEqual([["X", "press", "10-27 21:37", "10-27 21:37", "P", "Bot B", "Knowledge%2FPress%2FX"]]);
    expect(t.obsidianRecentTotal).toBe(1);
    rmSync(d, { recursive: true });
  });
});
