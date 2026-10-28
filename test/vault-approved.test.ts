import { describe, it, expect } from "vitest";
const PY = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
import { spawnSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, mkdirSync, utimesSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
const CLI = resolve(__dirname, "../tools/vault-read");
const FIXTURE = resolve(__dirname, "fixtures/sample-vault");
const setup = () => { const v = mkdtempSync(join(tmpdir(), "vaulta-")); cpSync(FIXTURE, v, { recursive: true });
  const t = new Date("2020-01-01T00:00:00Z"); readdirSync(v, { recursive: true }).map(String).filter((f) => f.endsWith(".md")).forEach((f) => utimesSync(join(v, f), t, t)); return v; };
const audit = (v: string, extra: Record<string, string>) =>
  spawnSync(PY, [CLI, "--json", "audit", "--hours", "1"], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: resolve(__dirname, "../config.example.json"), VAULT_WRITE_ENABLED: "", ...extra }, encoding: "utf8" });

describe("vault-read audit approved list / BOT lines (v1.7.2)", () => {
  it("approved list attributes writes and UNKNOWN-accepted entries, only at the listed mtime", () => {
    const v = setup(); const d = mkdtempSync(join(tmpdir(), "appr-"));
    writeFileSync(join(v, "A.md"), "# A\n"); writeFileSync(join(v, "B.md"), "# B\n");
    const m = (p: string) => statSync(join(v, p)).mtimeMs / 1000;
    const list = join(d, "approved.json");
    writeFileSync(list, JSON.stringify({ tolerance_seconds: 2, entries: [
      { path: "A.md", mtime: m("A.md"), writer: "Bot C", status: "approved" },
      { path: "B.md", mtime: m("B.md"), writer: "UNKNOWN", status: "unknown-accepted" } ] }));
    expect(audit(v, {}).status).toBe(1);
    const r = audit(v, { VAULT_APPROVED_LIST: list });
    expect(r.status).toBe(0);
    const j = JSON.parse(r.stdout); expect(j.unknown_accepted).toBe(1); expect(j.ok).toBe(true);
    const later = new Date(Date.now() + 60000); utimesSync(join(v, "B.md"), later, later);
    const r2 = audit(v, { VAULT_APPROVED_LIST: list });
    expect(r2.status).toBe(1); expect(JSON.parse(r2.stdout).unattributed).toEqual(["B.md"]);
    rmSync(v, { recursive: true }); rmSync(d, { recursive: true });
  });
  it("honors BOT: in CHANGES.txt and per-run write-log.md entries", () => {
    const v = setup(); const man = mkdtempSync(join(tmpdir(), "man-")); mkdirSync(join(man, "run1"));
    writeFileSync(join(v, "A.md"), "# A\n"); writeFileSync(join(v, "B.md"), "# B\n");
    writeFileSync(join(man, "run1", "CHANGES.txt"), "BOT: Bot A\nA.md\n");
    writeFileSync(join(man, "run1", "write-log.md"), "- 2026-10-28T21:37:00 | BOT: Bot A | update | B.md\n");
    const r = audit(v, { VAULT_MANIFEST_DIRS: man });
    expect(r.status).toBe(0);
    const items = JSON.parse(spawnSync(PY, [CLI, "--json", "recent", "--hours", "1"], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: resolve(__dirname, "../config.example.json"), VAULT_MANIFEST_DIRS: man }, encoding: "utf8" }).stdout);
    expect(items.every((x: any) => x.by === "Bot A")).toBe(true);
    rmSync(v, { recursive: true }); rmSync(man, { recursive: true });
  });
});
