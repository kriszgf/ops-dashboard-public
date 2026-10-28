import { describe, it, expect } from "vitest";
const PY = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, cpSync, readdirSync, statSync, readFileSync, symlinkSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
const CLI = resolve(__dirname, "../tools/vault-read");
const FIXTURE = resolve(__dirname, "fixtures/sample-vault");
function snapshot(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => { for (const n of readdirSync(d).sort()) { const p = join(d, n); const s = statSync(p);
    if (s.isDirectory()) walk(p); else out.push(`${p}:${s.size}:${s.mtimeMs}:${readFileSync(p, "utf8").length}`); } };
  walk(dir); return out;
}
function setup() { const v = mkdtempSync(join(tmpdir(), "vault-")); cpSync(FIXTURE, v, { recursive: true }); return v; }
function run(v: string, args: string[], extra: Record<string, string> = {}) {
  return spawnSync(PY, [CLI, ...args], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: resolve(__dirname, "../config.example.json"), ...extra }, encoding: "utf8" });
}
describe("vault-read", () => {
  it("lists notes and skips excluded folders/files", () => {
    const v = setup(); const r = run(v, ["--json", "list"]); const items: string[] = JSON.parse(r.stdout);
    expect(items.sort()).toEqual(["Notes/Daily.md", "Notes/Projects/Alpha.md", "Welcome.md"]);
    const s = JSON.parse(run(v, ["--json", "search", "lighthouse"]).stdout);
    expect(s.map((h: any) => h.path).sort()).toEqual(["Notes/Projects/Alpha.md", "Welcome.md"]);
    expect(JSON.parse(run(v, ["--json", "list"], { VAULT_EXCLUDE: "daily" }).stdout)).not.toContain("Notes/Daily.md");
    rmSync(v, { recursive: true });
  });
  it("reads, tags, and redacts secret-looking lines", () => {
    const v = setup(); const r = JSON.parse(run(v, ["--json", "read", "Notes/Projects/Alpha.md"]).stdout);
    expect(r.title).toBe("Project Alpha"); expect(r.content).not.toContain("FAKE-NOT-A-REAL-KEY"); expect(r.content).toContain("[REDACTED");
    expect(JSON.parse(run(v, ["--json", "tags", "alpha"]).stdout)[0].path).toBe("Welcome.md");
    expect(JSON.parse(run(v, ["--json", "tags", "project"]).stdout)[0].path).toBe("Notes/Projects/Alpha.md");
    rmSync(v, { recursive: true });
  });
  it("blocks traversal, excluded paths and escaping symlinks", () => {
    const v = setup(); const outside = mkdtempSync(join(tmpdir(), "out-")); writeFileSync(join(outside, "x.md"), "# secret outside");
    symlinkSync(outside, join(v, "Notes", "link")); symlinkSync(join(outside, "x.md"), join(v, "esc.md"));
    for (const p of ["../etc/passwd", "/etc/passwd", "Notes/../../x.md", "Notes/link/x.md", "esc.md", "Private/keys.md", ".obsidian/app.json"]) {
      const r = run(v, ["read", p]); expect(r.status).not.toBe(0); expect(r.stdout).toBe("");
    }
    const all = JSON.parse(run(v, ["--json", "list"]).stdout); expect(all.join()).not.toMatch(/link|esc/);
    rmSync(v, { recursive: true }); rmSync(outside, { recursive: true });
  });
  it("leaves the vault unchanged", () => {
    const v = setup(); const before = snapshot(v);
    for (const a of [["list"], ["search", "lighthouse"], ["read", "Welcome.md"], ["tags", "demo"], ["count"]]) run(v, a);
    expect(snapshot(v)).toEqual(before); rmSync(v, { recursive: true });
  });
  it("fails without VAULT_PATH", () => {
    const r = spawnSync(PY, [CLI, "list"], { env: { PATH: process.env.PATH! }, cwd: tmpdir(), encoding: "utf8" });
    expect(r.status).not.toBe(0);
  });
});
