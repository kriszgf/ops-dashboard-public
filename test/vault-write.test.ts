import { describe, it, expect } from "vitest";
const PY = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
import { spawnSync } from "node:child_process";
import { mkdtempSync, cpSync, readFileSync, existsSync, symlinkSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
const CLI = resolve(__dirname, "../tools/vault-read");
const FIXTURE = resolve(__dirname, "fixtures/sample-vault");
const setup = () => { const v = mkdtempSync(join(tmpdir(), "vaultw-")); cpSync(FIXTURE, v, { recursive: true }); return v; };
const run = (v: string, args: string[], input?: string) =>
  spawnSync(PY, [CLI, "--json", ...args], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: resolve(__dirname, "../config.example.json"), VAULT_WRITE_ENABLED: "1" }, encoding: "utf8", input });
const runOff = (v: string, args: string[]) =>
  spawnSync(PY, [CLI, "--json", ...args], { env: { ...process.env, VAULT_PATH: v, OPS_CONFIG: resolve(__dirname, "../config.example.json"), VAULT_WRITE_ENABLED: "" }, encoding: "utf8" });
const snap = (d: string): string[] => readdirSync(d, { recursive: true }).map(String).sort().map((f) => { const p = join(d, f); try { return f + ":" + readFileSync(p, "utf8"); } catch { return f + "/"; } });
const today = () => new Date().toISOString().slice(0, 10);

describe("vault-read write mode", () => {
  it("create works, logs, writes daily summary, redacts secrets", () => {
    const v = setup();
    const r = run(v, ["create", "Inbox/new.md", "--bot", "tester", "--text", "# New\nhello\napi_key=FAKE123"]);
    expect(r.status).toBe(0);
    const note = readFileSync(join(v, "Inbox/new.md"), "utf8");
    expect(note).toContain("hello"); expect(note).not.toContain("FAKE123");
    const log = readFileSync(join(v, "_bot-writes/log.md"), "utf8");
    expect(log).toMatch(/bot=tester \| create \| Inbox\/new\.md \| sha256=[0-9a-f]{64}/); expect(log).not.toContain("FAKE123");
    const daily = readFileSync(join(v, `_bot-writes/daily/${today()}.md`), "utf8");
    expect(daily).toContain("## tester (1)"); expect(daily).toContain("Inbox/new.md");
    rmSync(v, { recursive: true });
  });
  it("create on existing file fails and does not overwrite", () => {
    const v = setup(); const before = readFileSync(join(v, "Welcome.md"), "utf8");
    const r = run(v, ["create", "Welcome.md", "--bot", "tester", "--text", "x"]);
    expect(r.status).not.toBe(0); expect(readFileSync(join(v, "Welcome.md"), "utf8")).toBe(before);
    rmSync(v, { recursive: true });
  });
  it("append works (stdin) and append to missing file fails", () => {
    const v = setup(); const before = readFileSync(join(v, "Welcome.md"), "utf8");
    expect(run(v, ["append", "Welcome.md", "--bot", "tester"], "added line\n").status).toBe(0);
    const after = readFileSync(join(v, "Welcome.md"), "utf8");
    expect(after.startsWith(before)).toBe(true); expect(after).toContain("added line");
    expect(run(v, ["append", "Nope.md", "--bot", "tester", "--text", "x"]).status).not.toBe(0);
    expect(existsSync(join(v, "Nope.md"))).toBe(false);
    rmSync(v, { recursive: true });
  });
  it("blocks traversal, symlinks, excluded paths, .obsidian and the log area", () => {
    const v = setup(); const outside = mkdtempSync(join(tmpdir(), "outw-")); writeFileSync(join(outside, "x.md"), "orig");
    symlinkSync(outside, join(v, "Notes", "link")); symlinkSync(join(outside, "x.md"), join(v, "esc.md"));
    for (const [cmd, p] of [["create", "../evil.md"], ["create", "/tmp/evil.md"], ["create", "Notes/../../evil.md"],
      ["create", "Notes/link/y.md"], ["append", "esc.md"], ["append", "Notes/link/x.md"], ["create", "Private/new.md"],
      ["append", "Archive/private-mail/mail.md"], ["create", ".obsidian/x.md"], ["create", "_bot-writes/log2.md"], ["append", "_bot-writes/log.md"]]) {
      expect(run(v, [cmd, p, "--bot", "tester", "--text", "x"]).status).not.toBe(0);
    }
    expect(readFileSync(join(outside, "x.md"), "utf8")).toBe("orig"); expect(readdirSync(outside)).toEqual(["x.md"]);
    expect(run(v, ["create", "_bot-writes/test/ok.md", "--bot", "tester", "--text", "x"]).status).toBe(0);
    rmSync(v, { recursive: true }); rmSync(outside, { recursive: true });
  });
  it("pending leaves target untouched; approve applies and logs", () => {
    const v = setup(); const before = readFileSync(join(v, "Welcome.md"), "utf8");
    const r = run(v, ["append", "Welcome.md", "--bot", "tester", "--pending", "--text", "later"]);
    expect(r.status).toBe(0); const id = JSON.parse(r.stdout).id;
    expect(readFileSync(join(v, "Welcome.md"), "utf8")).toBe(before);
    expect(existsSync(join(v, `_bot-writes/pending/${id}.json`))).toBe(true);
    expect(JSON.parse(run(v, ["pending", "list"]).stdout)[0].id).toBe(id);
    expect(run(v, ["approve", id]).status).toBe(0);
    expect(readFileSync(join(v, "Welcome.md"), "utf8")).toContain("later");
    expect(readFileSync(join(v, "_bot-writes/log.md"), "utf8")).toContain("approve-append | Welcome.md");
    expect(JSON.parse(run(v, ["pending", "list"]).stdout)).toEqual([]);
    const c = run(v, ["create", "Welcome.md", "--bot", "t", "--pending", "--text", "x"]); const cid = JSON.parse(c.stdout).id;
    expect(run(v, ["approve", cid]).status).not.toBe(0); expect(readFileSync(join(v, "Welcome.md"), "utf8")).toContain("later");
    rmSync(v, { recursive: true });
  });
  it("missing --bot fails and writes nothing", () => {
    const v = setup();
    expect(run(v, ["create", "a.md", "--text", "x"]).status).not.toBe(0);
    expect(run(v, ["append", "Welcome.md", "--text", "x"]).status).not.toBe(0);
    expect(existsSync(join(v, "a.md"))).toBe(false); expect(existsSync(join(v, "_bot-writes"))).toBe(false);
    rmSync(v, { recursive: true });
  });
  it("kill-switch: writes refused by default, vault unchanged", () => {
    const v = setup(); const before = snap(v);
    for (const a of [["create", "Inbox/k.md", "--bot", "t", "--text", "x"], ["append", "Welcome.md", "--bot", "t", "--text", "x"], ["create", "Inbox/k2.md", "--bot", "t", "--text", "x", "--pending"], ["approve", "20260101000000-abcdef"]]) {
      const r = runOff(v, a); expect(r.status).not.toBe(0); expect(r.stderr).toContain("writes are disabled (set VAULT_WRITE_ENABLED=1)");
    }
    expect(runOff(v, ["pending", "list"]).status).toBe(0);
    expect(snap(v)).toEqual(before); expect(existsSync(join(v, "_bot-writes"))).toBe(false);
    rmSync(v, { recursive: true });
  });
  it("kill-switch: writes work when VAULT_WRITE_ENABLED=1", () => {
    const v = setup();
    expect(run(v, ["create", "Inbox/on.md", "--bot", "t", "--text", "on"]).status).toBe(0);
    expect(existsSync(join(v, "Inbox/on.md"))).toBe(true);
    rmSync(v, { recursive: true });
  });
  it("--version prints the version and touches nothing", () => {
    const v = setup(); const before = snap(v);
    const r = spawnSync(PY, [CLI, "--version"], { env: { ...process.env, VAULT_PATH: "" }, encoding: "utf8" });
    expect(r.status).toBe(0); expect(r.stdout.trim()).toBe("vault-read 2.0.0");
    expect(snap(v)).toEqual(before);
    rmSync(v, { recursive: true });
  });
});
