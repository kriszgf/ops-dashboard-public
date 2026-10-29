import { describe, it, expect, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Projects, PROJECTS, EN_LABELS } from "../src/Projects";
afterEach(cleanup);
describe("project cards", () => {
  it("More toggle reveals full details and sets aria-expanded", () => {
    const { getByTestId } = render(<Projects />);
    const p = PROJECTS[0]; const card = getByTestId(`project-${p.id}`);
    const btn = card.querySelector("button")!; const dl = card.querySelector("dl")!;
    expect(btn.getAttribute("aria-expanded")).toBe("false"); expect(dl.hidden).toBe(true);
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true"); expect(dl.hidden).toBe(false);
    for (const k of ["why", "status", "next"] as const) expect(dl.textContent).toContain(p[k]);
    fireEvent.click(btn); expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
});
describe("project labels", () => {
  it("uses translated More/Less and field labels", () => {
    const l = { more: "Mehr", less: "Weniger", state: "Stand", what: "Was es ist", why: "Warum", status: "Status", next: "Nächster Schritt", heading: "Projekte" };
    const { getByTestId } = render(<Projects l={l} />);
    const btn = getByTestId(`project-${PROJECTS[0].id}`).querySelector("button")!;
    expect(btn.textContent).toBe("Mehr"); fireEvent.click(btn); expect(btn.textContent).toBe("Weniger");
    expect(getByTestId(`project-${PROJECTS[0].id}`).textContent).toContain("Nächster Schritt");
  });
});
describe("rich project card", () => {
  it("shows status badge, state, what, next step and process count", () => {
    const p = PROJECTS[0]; const { getByTestId } = render(<Projects counts={{ [p.id]: 5 }} />);
    const c = getByTestId(`project-${p.id}`).textContent!;
    for (const v of [p.name, p.status, p.what, p.next, "5 processes", p.st!]) expect(c).toContain(v);
  });
});
describe("expand / collapse all", () => {
  it("opens and closes every card's details", () => {
    const { getByTestId, container } = render(<Projects l={{ ...EN_LABELS, all: "Expand all", none: "Collapse all" }} />);
    fireEvent.click(getByTestId("expand-all")); expect([...container.querySelectorAll("dl")].every(d => !d.hidden)).toBe(true);
    fireEvent.click(getByTestId("collapse-all")); expect([...container.querySelectorAll("dl")].every(d => d.hidden)).toBe(true);
  });
});
