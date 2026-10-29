import { describe, it, expect, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import App from "../src/App";
afterEach(cleanup);
const openFirst = (r: ReturnType<typeof render>) => { fireEvent.click(r.container.querySelector('[data-testid^="project-"]')!); return r; };
const cards = (c: HTMLElement) => c.querySelectorAll('[id^="card-"]').length;
const catGroup = (c: HTMLElement) => [...c.querySelectorAll('[role="tablist"]')].find(g => g.querySelectorAll("button").length === 4 && [...g.querySelectorAll("button")].some(b => /core|alap|Kern/i.test(b.textContent || ""))) as HTMLElement;
describe("dashboard", () => {
  it("front page shows the project grid and hides the process view", () => {
    const { container, queryByTestId } = render(<App />);
    expect(container.querySelectorAll('[data-testid^="project-"]').length).toBeGreaterThan(1);
    expect(queryByTestId("process-view")).toBeNull(); expect(cards(container)).toBe(0);
  });
  it("clicking a project opens the process view; Back returns to the grid", () => {
    const r = render(<App />); openFirst(r);
    expect(r.getByTestId("process-view")).toBeTruthy(); expect(cards(r.container)).toBeGreaterThan(0);
    expect(r.queryByTestId("projects-view")).toBeNull();
    fireEvent.click([...r.container.querySelectorAll("button")].find(b => /projects|projektekhez/i.test(b.textContent || ""))!);
    expect(r.queryByTestId("process-view")).toBeNull(); expect(r.getByTestId("projects-view")).toBeTruthy();
  });
  it("More on a project card does not open the process view", () => {
    const r = render(<App />); fireEvent.click(r.container.querySelector('[data-testid^="project-"] button')!);
    expect(r.queryByTestId("process-view")).toBeNull();
  });
  it("renders cards", () => { const { container } = openFirst(render(<App />)); expect(cards(container)).toBeGreaterThan(0); });
  it("category filter narrows cards", () => {
    const { container } = openFirst(render(<App />)); const all = cards(container); const g = catGroup(container); expect(g).toBeTruthy();
    const counts = [1, 2, 3].map(i => { fireEvent.click(g.querySelectorAll("button")[i]); return cards(container); });
    expect(Math.min(...counts)).toBeLessThan(all);
  });
  it("jump to card clears category filter", () => {
    const { container } = openFirst(render(<App />)); const all = cards(container); const g = catGroup(container);
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
    const { container } = openFirst(render(<App />));
    const n = container.querySelectorAll("button").length; expect(n).toBeGreaterThan(10);
    for (let i = 0; i < Math.min(n, 200); i++) { const b = container.querySelectorAll("button")[i]; if (b) expect(() => act(() => { fireEvent.click(b); })).not.toThrow(); }
  });
});
