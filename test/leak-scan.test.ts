import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";

// Private terms are NEVER stored in this repo. They come from LEAK_TERMS (comma-separated)
// or from leakScan.terms in the git-ignored config.local.json (or $OPS_CONFIG).
const ROOT = resolve(__dirname, "..");
const SKIP = new Set(["node_modules", "dist", ".git", "config.local.json", ".env", "package-lock.json"]);
function loadTerms(): string[] {
  if (process.env.LEAK_TERMS) return process.env.LEAK_TERMS.split(",").map((t) => t.trim()).filter(Boolean);
  const p = process.env.OPS_CONFIG || join(ROOT, "config.local.json");
  if (!existsSync(p)) return [];
  return (JSON.parse(readFileSync(p, "utf8"))?.leakScan?.terms ?? []).filter((t: string) => t && !t.startsWith("example-"));
}
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function scan(root: string, terms: string[]): string[] {
  const res = terms.map((t) => new RegExp(`(^|[^\\p{L}\\p{N}])${esc(t)}($|[^\\p{L}\\p{N}])`, "iu"));
  const hits: string[] = [];
  const walk = (d: string) => {
    for (const n of readdirSync(d)) {
      if (SKIP.has(n) || n.startsWith(".env")) continue;
      const p = join(d, n); const rel = relative(root, p).replace(/\\/g, "/");
      res.forEach((re, i) => { if (re.test(rel)) hits.push(`${rel} (path, term #${i})`); });
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (/\.(png|jpe?g|webp|ico)$/i.test(n)) continue;
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((l, ln) => res.forEach((re, i) => { if (re.test(l)) hits.push(`${rel}:${ln + 1} (term #${i})`); }));
    }
  };
  walk(root); return hits;
}
describe("leak scan", () => {
  const terms = loadTerms();
  it.skipIf(terms.length === 0)("repository contains none of the private terms", () => {
    expect(scan(ROOT, terms)).toEqual([]); // reports only term index, never the term itself
  });
  it("scanner detects a planted term", () => {
    expect(scan(join(ROOT, "test/fixtures/sample-vault"), ["lighthouse"]).length).toBeGreaterThan(0);
  });
});
