import { describe, it, expect, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Projects, PROJECTS } from "../src/Projects";
afterEach(cleanup);
describe("project cards", () => {
  it("More toggle reveals full details and sets aria-expanded", () => {
    const { getByTestId } = render(<Projects />);
    const p = PROJECTS[0]; const card = getByTestId(`project-${p.id}`);
    const btn = card.querySelector("button")!; const dl = card.querySelector("dl")!;
    expect(btn.getAttribute("aria-expanded")).toBe("false"); expect(dl.hidden).toBe(true);
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true"); expect(dl.hidden).toBe(false);
    for (const k of ["what", "why", "status", "next"] as const) expect(dl.textContent).toContain(p[k]);
    fireEvent.click(btn); expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
});
describe("project labels", () => {
  it("uses translated More/Less and field labels", () => {
    const l = { more: "Mehr", less: "Weniger", what: "Was es ist", why: "Warum", status: "Status", next: "Nächster Schritt", heading: "Projekte" };
    const { getByTestId } = render(<Projects l={l} />);
    const btn = getByTestId(`project-${PROJECTS[0].id}`).querySelector("button")!;
    expect(btn.textContent).toBe("Mehr"); fireEvent.click(btn); expect(btn.textContent).toBe("Weniger");
    expect(getByTestId(`project-${PROJECTS[0].id}`).textContent).toContain("Nächster Schritt");
  });
});
