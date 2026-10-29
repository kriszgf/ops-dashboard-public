import { describe, it, expect, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import App from "../src/App";
afterEach(cleanup);
const cards = (c: HTMLElement) => c.querySelectorAll('[id^="card-"]').length;
const catGroup = (c: HTMLElement) => [...c.querySelectorAll('[role="tablist"]')].find(g => g.querySelectorAll("button").length === 4 && [...g.querySelectorAll("button")].some(b => /core|alap|Kern/i.test(b.textContent || ""))) as HTMLElement;
describe("dashboard", () => {
  it("renders the Projects section before the process cards", () => {
    const { container } = render(<App />);
    const proj = container.querySelector('[data-testid^="project-"]'); const card = container.querySelector('[id^="card-"]');
    expect(proj).toBeTruthy(); expect(card).toBeTruthy();
    expect(proj!.compareDocumentPosition(card!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it("renders cards", () => { const { container } = render(<App />); expect(cards(container)).toBeGreaterThan(0); });
  it("category filter narrows cards", () => {
    const { container } = render(<App />); const all = cards(container); const g = catGroup(container); expect(g).toBeTruthy();
    const counts = [1, 2, 3].map(i => { fireEvent.click(g.querySelectorAll("button")[i]); return cards(container); });
    expect(Math.min(...counts)).toBeLessThan(all);
  });
  it("jump to card clears category filter", () => {
    const { container } = render(<App />); const all = cards(container); const g = catGroup(container);
    let i = 1; for (; i < 4; i++) { fireEvent.click(g.querySelectorAll("button")[i]); if (cards(container) < all) break; }
    const visible = new Set([...container.querySelectorAll('[id^="card-"]')].map(e => e.id.slice(5)));
    const target = [...container.querySelectorAll("button")].find(b => { const k = Object.keys(b).find(k => k.startsWith("__reactProps")); const fn = k && (b as any)[k].onClick; return fn && /jump\(/.test(fn.toString()); });
    // find any jump target pointing at a hidden card via the banner/clock list
    expect(target).toBeTruthy();
    act(() => { fireEvent.click(target!); });
    expect(g.querySelectorAll("button")[0].getAttribute("aria-pressed")).toBe("true");
    expect(cards(container)).toBe(all);
    void visible;
  });
  it("every button click runs without throwing", () => {
    const { container } = render(<App />);
    const n = container.querySelectorAll("button").length; expect(n).toBeGreaterThan(10);
    for (let i = 0; i < Math.min(n, 200); i++) { const b = container.querySelectorAll("button")[i]; if (b) expect(() => act(() => { fireEvent.click(b); })).not.toThrow(); }
  });
});
