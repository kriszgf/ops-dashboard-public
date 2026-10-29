import { describe, it, expect, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import App from "../src/App";
import { Projects, decisions, daySummary, PROJECTS } from "../src/Projects";
import nk from "../src/i18n/new-keys.json";
afterEach(cleanup);
const EN = (k: string) => (nk as any)[k][1];
describe("v2.0.7 critique", () => {
  it("decision bar is first, sorted by priority then due date", () => {
    const { getByTestId } = render(<App />);
    const v = getByTestId("projects-view"); const bar = getByTestId("decision-bar");
    const first = v.querySelector('[data-testid^="project-demo"]')!;
    expect(bar.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const ds = decisions([{ ...PROJECTS[0], decision: "x", prio: 2, due: "2026-02-01" }, { ...PROJECTS[1], decision: "y", prio: 1 }, { ...PROJECTS[2], decision: "z", prio: 2, due: "2026-01-01" }]);
    expect(ds.map(p => p.decision)).toEqual(["y", "z", "x"]);
  });
  it("empty decision bar says nothing is needed", () => {
    const { getByTestId } = render(<Projects t={EN} items={PROJECTS.map(p => ({ ...p, decision: undefined }))} />);
    expect(getByTestId("decision-bar").textContent).toContain(EN("decNone"));
  });
  it("day summary is one sentence with counts", () => {
    expect(daySummary(PROJECTS, EN)).toBe("Today: 3 projects – 1 active, 1 paused, 1 waiting for you; 2 decisions need you.");
  });
  it("status badges have an icon and a word", () => {
    const { getAllByTestId } = render(<Projects t={EN} />);
    for (const s of getAllByTestId("project-state")) { const b = s.querySelector("[data-tone]")!; expect(b.querySelector("svg[data-icon]")).toBeTruthy(); expect(b.textContent!.trim().length).toBeGreaterThan(2); }
  });
  it("every card shows owner bot, last active, time and cost, and a real link", () => {
    const { getAllByTestId } = render(<Projects t={EN} onOpen={() => {}} />);
    for (const m of getAllByTestId("card-meta")) for (const k of ["owner", "lastAct", "time", "cost"]) expect(m.textContent).toContain(EN(k));
    expect(getAllByTestId("card-link")[0].getAttribute("href")).toBe("#/project/demo-a");
  });
  it("search and status filter narrow the cards", () => {
    const { getByTestId, queryByTestId } = render(<Projects t={EN} />);
    fireEvent.change(getByTestId("search"), { target: { value: "running" } });
    expect(queryByTestId("project-demo-a")).toBeNull(); expect(getByTestId("project-demo-c")).toBeTruthy();
    fireEvent.change(getByTestId("search"), { target: { value: "zzz" } });
    expect(getByTestId("no-match")).toBeTruthy();
    fireEvent.change(getByTestId("search"), { target: { value: "" } });
    fireEvent.click(getByTestId("filter-paused"));
    expect(queryByTestId("project-demo-a")).toBeNull(); expect(getByTestId("project-demo-b")).toBeTruthy();
  });
  it("opening a project sets a shareable hash; footer has licence", () => {
    const { getByTestId } = render(<App />);
    fireEvent.click(getByTestId("project-demo-b"));
    expect(location.hash).toBe("#/project/demo-b");
    expect(getByTestId("app-version").textContent).toMatch(/MIT/);
  });
  it("all new keys have 9 non-empty languages and no emoji", () => {
    for (const k of ["decT", "decNone", "daySum", "owner", "lastAct", "search", "noMatch", "back", "foot", "footLic", "gHint"]) {
      const a = (nk as any)[k]; expect(a.length).toBe(9); a.forEach((v: string) => { expect(v.trim()).not.toBe(""); expect(v).not.toMatch(/\p{Extended_Pictographic}/u); });
    }
  });
  it("every card shows a visible last-active line, unknown when missing; webStatus renders a badge", () => {
    const items = [{ ...PROJECTS[0] }, { ...PROJECTS[1], lastActive: undefined, webStatus: { url: "https://example.org", live: false, checkedAt: "2026-01-01 08:00" } }];
    const { getAllByTestId } = render(<Projects t={EN} items={items} />);
    const la = getAllByTestId("last-active"); expect(la.length).toBe(2); expect(la[1].textContent).toContain(EN("unk"));
    const ws = getAllByTestId("web-status"); expect(ws.length).toBe(2); expect(ws[1].textContent).toContain(EN("webOff")); expect(ws[0].getAttribute("href")).toBe("https://example.com");
  });
});
