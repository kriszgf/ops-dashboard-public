import { readFileSync } from "node:fs";
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
    expect(container.querySelector("h1")!.textContent).toBe("Projects"); expect(container.textContent).not.toMatch(/Process dashboard/);
  });
  it("clicking a project opens the process view; Back returns to the grid", () => {
    const r = render(<App />); openFirst(r);
    expect(r.getByTestId("process-view")).toBeTruthy(); expect(cards(r.container)).toBeGreaterThan(0);
    expect(r.queryByTestId("projects-view")).toBeNull();
    expect(r.getByTestId("project-title").textContent).toBe("Example Project Alpha");
    expect(r.container.textContent).not.toMatch(/Process dashboard/);
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
  it("project view order: cards, then graph, then Obsidian (collapsed); no README or warning blocks", () => {
    const { getByTestId } = openFirst(render(<App />)); const v = getByTestId("process-view");
    const heads = [...v.querySelectorAll("h2,h3,button,summary")].map(e => e.textContent || "");
    const iCards = heads.findIndex(h => /process cards|Folyamatkártyák|cards/i.test(h));
    const card = v.querySelector('[id^="card-"]')!; const svg = v.querySelector("svg")!;
    const obs = [...v.querySelectorAll("h2")].find(e => /Obsidian Notes/.test(e.textContent || ""))!;
    expect(card && svg && obs).toBeTruthy(); void iCards;
    expect(card.compareDocumentPosition(svg) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(svg.compareDocumentPosition(obs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(v.textContent).not.toMatch(/EXAMPLE DATA|README|Stale \/ blocked/);
    expect(v.textContent).not.toContain("Vault location");
    const toggle = obs.querySelector("button")!;
    expect(toggle.getAttribute("aria-expanded")).toBe("false"); fireEvent.click(toggle); expect(toggle.getAttribute("aria-expanded")).toBe("true"); expect(v.textContent).toContain("Vault location");
  });
  it("project view shows only that project's processes", () => {
    const data = JSON.parse(readFileSync("data/sample-processes.json", "utf8"));
    for (const id of ["demo-a", "demo-b", "demo-c"]) {
      const r = render(<App />); fireEvent.click(r.getByTestId(`project-${id}`));
      const shown = [...r.container.querySelectorAll('[id^="card-"]')].map(e => e.id.slice(5));
      expect(shown.length).toBeGreaterThan(0);
      for (const pid of shown) expect(data.projectOf[pid]).toBe(id);
      expect(shown.length).toBe(Object.values(data.projectOf).filter(x => x === id).length);
      cleanup();
    }
  });
  it("every button click runs without throwing", () => {
    const { container } = openFirst(render(<App />));
    const n = container.querySelectorAll("button").length; expect(n).toBeGreaterThan(10);
    for (let i = 0; i < Math.min(n, 200); i++) { const b = container.querySelectorAll("button")[i]; if (b) expect(() => act(() => { fireEvent.click(b); })).not.toThrow(); }
  });
});
describe("front page toggles", () => {
  it("has language selector and theme toggle on the Projects page", () => {
    const { getByTestId } = render(<App />); const bar = getByTestId("front-topbar");
    expect(bar.querySelector("select")).toBeTruthy();
    expect([...bar.querySelectorAll("button")].map(b => b.textContent).join(" ")).toMatch(/Auto.*Light.*Dark/);
    fireEvent.click([...bar.querySelectorAll("button")].find(b => b.textContent === "Dark")!);
    expect(document.documentElement.dataset.theme).toBe("dark"); localStorage.clear();
  });
});
