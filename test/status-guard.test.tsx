import { describe, it, expect } from "vitest";
import { pausedP } from "../src/App";
import { D, PAUSED } from "../src/data";
import type { P } from "../src/data";
describe("status guard", () => {
  it("never renders a running process as paused", () => {
    for (const p of D as P[]) if (p[6] === "aktív") expect(pausedP(p), p[0]).toBe(false);
    const fake = [...(D as P[])[0]] as P; fake[6] = "aktív";
    for (const id of PAUSED) { fake[0] = id; expect(pausedP(fake), id).toBe(false); }
  });
  it("paused registry and data agree", () => {
    for (const id of PAUSED) { const p = (D as P[]).find(x => x[0] === id); if (p) expect(p[6], id).not.toBe("aktív"); }
  });
});
