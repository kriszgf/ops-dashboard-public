import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import App from "../src/App";
import { D } from "../src/data";
afterEach(() => { cleanup(); location.hash = ""; });
describe("global network on #/all", () => {
  it("shows the unfiltered net view with every process above the table", () => {
    location.hash = "#/all"; const { getByTestId } = render(<App />);
    const g = getByTestId("global-net"); const svg = g.querySelector("svg"); expect(svg).toBeTruthy();
    expect(g.querySelectorAll("path, line").length).toBeGreaterThan(D.length);
    for (const p of D) expect(g.textContent).toContain(p[2].slice(0, 6));
    expect(g.compareDocumentPosition(getByTestId("all-processes")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
