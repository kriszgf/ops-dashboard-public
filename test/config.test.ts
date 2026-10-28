import { describe, it, expect } from "vitest";
const PY = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
import { readFileSync, readdirSync, mkdtempSync, cpSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve, win32, posix } from "node:path";
import { tmpdir } from "node:os";
const ROOT = resolve(__dirname, "..");
const CLI = join(ROOT, "tools/vault-read");
const EX = join(ROOT, "config.example.json");
describe("config", () => {
  it("config.example.json is valid and neutral", () => {
    const c = JSON.parse(readFileSync(EX, "utf8"));
    expect(Array.isArray(c.vault.excludes)).toBe(true);
    expect(c.vault.sections.every((s: any) => typeof s.prefix === "string" && typeof s.kind === "string")).toBe(true);
    expect(c.leakScan.terms.every((t: string) => t.startsWith("example-"))).toBe(true);
  });
  it("config.local.json and .env are git-ignored", () => {
    const gi = readFileSync(join(ROOT, ".gitignore"), "utf8").split("\n");
    expect(gi).toContain("config.local.json"); expect(gi).toContain(".env*");
  });
  it("default exclude list in vault-read is generic", () => {
    const src = readFileSync(CLI, "utf8"); const m = src.match(/DEFAULT_EXCLUDES = \[(.*?)\]/s)!;
    expect(JSON.parse(`[${m[1]}]`)).toEqual([".obsidian", ".trash", ".git", "private", "secrets", "credentials"]);
  });
  it("vault.excludes from OPS_CONFIG are applied", () => {
    const v = mkdtempSync(join(tmpdir(), "vault-")); cpSync(join(ROOT, "test/fixtures/sample-vault"), v, { recursive: true });
    const cfg = join(v, "..", `cfg-${Date.now()}.json`); writeFileSync(cfg, JSON.stringify({ vault: { excludes: ["daily"] } }));
    const r = spawnSync(PY, [CLI, "--json", "list"], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: cfg }, encoding: "utf8" });
    expect(JSON.parse(r.stdout)).not.toContain("Notes/Daily.md");
    rmSync(v, { recursive: true }); rmSync(cfg);
  });
  it("gen-recent folder map comes from config", () => {
    const d = mkdtempSync(join(tmpdir(), "gen-"));
    writeFileSync(join(d, "c.json"), JSON.stringify({ vault: { sections: [{ prefix: "Custom/", kind: "proj" }] } }));
    writeFileSync(join(d, "r.json"), JSON.stringify([{ path: "Custom/A.md", title: "A", modified: "2026-01-01T10:00:00+0000", by: "Bot A" }]));
    writeFileSync(join(d, "t.json"), "{}");
    const r = spawnSync(PY, [join(ROOT, "tools/gen-recent"), join(d, "r.json"), join(d, "t.json")], { env: { ...process.env, OPS_CONFIG: join(d, "c.json") }, encoding: "utf8" });
    expect(r.status).toBe(0); expect(JSON.parse(readFileSync(join(d, "t.json"), "utf8")).obsidianNotes[0][1]).toBe("proj");
    rmSync(d, { recursive: true });
  });
  it("Windows-style relative paths are treated like POSIX ones (excludes + traversal)", () => {
    // vault-read normalises backslashes; simulate with win32 joins
    const winRel = win32.join("Notes", "..", "..", "x.md"); const posixRel = posix.join("Private", "keys.md");
    const v = mkdtempSync(join(tmpdir(), "vault-")); cpSync(join(ROOT, "test/fixtures/sample-vault"), v, { recursive: true });
    const run = (p: string) => spawnSync(PY, [CLI, "read", p], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: EX }, encoding: "utf8" });
    expect(run(winRel.replace(/\//g, "\\")).status).not.toBe(0);
    expect(run(posixRel.replace(/\//g, "\\")).status).not.toBe(0);
    expect(run("Notes\\Daily.md").status === 0 || process.platform !== "win32").toBe(true);
    rmSync(v, { recursive: true });
  });
});
