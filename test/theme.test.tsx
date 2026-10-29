import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import App from "../src/App";
import { THEMES, MODE_KEY } from "../src/shim";
afterEach(() => { cleanup(); localStorage.clear(); });
const lum = (h: string) => { const n = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
describe("theme", () => {
  for (const [k, t] of Object.entries(THEMES) as any) {
    it(`${k}: text, badges, chart colors meet WCAG AA on all surfaces`, () => {
      const fg = [...Object.values(t.text), ...t.dataviz.categorical] as string[];
      const bgs = [t.bg.base, t.bg.elevated, t.bg.subtle, t.fill.secondary];
      for (const f of fg) for (const b of bgs) expect(ratio(f, b), `${k} ${f} on ${b}`).toBeGreaterThanOrEqual(4.5);
      for (const f of [t.text.warningDeep, t.text.dangerDeep]) expect(ratio(f, t.fill.warningSubtle)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(t.text.accent, k === "dark" ? "#0f1115" : "#ffffff")).toBeGreaterThanOrEqual(4.5);
    });
  }
  it("dark is actually dark", () => { expect(lum(THEMES.dark.bg.base)).toBeLessThan(0.02); expect(lum(THEMES.light.bg.base)).toBeGreaterThan(0.9); });
  it("toggle applies vars and persists", () => {
    const { container } = render(<App />); fireEvent.click(container.querySelector('[data-testid^="project-"]')!);
    const btn = [...container.querySelectorAll("button")].find(b => /^(Dark|Sötét)/i.test(b.textContent || ""))!;
    expect(btn).toBeTruthy(); fireEvent.click(btn);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--bg")).toBe("#0f1115");
    expect(localStorage.getItem(MODE_KEY)).toBe("dark");
    cleanup(); render(<App />); expect(document.documentElement.dataset.theme).toBe("dark");
    expect(container.innerHTML).not.toMatch(/invert\(1\)/);
  });
});
