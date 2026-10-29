import { describe, it, expect, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import App from "../src/App";
import { NonProjectPanel, nonProject } from "../src/Projects";
import { AllProcesses, kindOf, labelOf } from "../src/AllProcesses";
import { D, TEXTS, PIPELINES, DET, procTx } from "../src/data";
afterEach(() => { cleanup(); location.hash = ""; });
const l = { title: "All processes", name: "Name", label: "Label", type: "Type", timing: "Timing", owner: "Owner bot", status: "Status", all: "All", nonProj: "non-project", related: "{x} related", kinds: { sched: "scheduled", pipeline: "pipeline", article: "article", bg: "background" } };
describe("v2.0.9 all processes view", () => {
  it("lists every sample process with labels and types", () => {
    const { container } = render(<AllProcesses items={D} l={l} name={p => p[2]} status={p => p[6]} />);
    expect(container.querySelectorAll("tbody tr").length).toBe(D.length);
    expect(labelOf("np1", l)).toBe("non-project"); expect(labelOf("p01", l)).toBe("Example Project Alpha related");
    expect(kindOf("p14")).toBe("pipeline"); expect(kindOf("np2")).toBe("article"); expect(kindOf("p08")).toBe("bg"); expect(kindOf("p01")).toBe("sched");
  });
  it("filters by label and type; rows open the process", () => {
    let got = ""; const { getByTestId, container } = render(<AllProcesses items={D} l={l} name={p => p[2]} status={p => p[6]} onOpen={id => { got = id; }} />);
    fireEvent.click(getByTestId("lf-non-project")); expect(container.querySelectorAll("tbody tr").length).toBe(2);
    fireEvent.click(getByTestId("lf-all")); fireEvent.click(getByTestId("kf-bg")); expect(container.querySelectorAll("tbody tr").length).toBe(2);
    fireEvent.click(getByTestId("kf-pipeline")); fireEvent.click(getByTestId("row-p14")); expect(got).toBe("p14");
  });
  it("#/all route renders the view from the app", () => {
    location.hash = "#/all"; const { getByTestId } = render(<App />);
    expect(getByTestId("all-view")).toBeTruthy();
  });
});
describe("v2.0.9 non-project panel", () => {
  it("lists the two example articles below a pipeline reference row", () => {
    expect(nonProject(D).map(p => p[0]).sort()).toEqual(["np1", "np2"]);
    const pipe = D.find(p => p[0] === "p14")!; let opened = 0, all = 0, one = "";
    const { getByTestId, container } = render(<NonProjectPanel items={nonProject(D)} title="Non-project related processes" name={p => p[2]} status={p => p[6]} pipe={pipe} pipeTag="pipeline" piped={PIPELINES.p14} onOpenPipe={() => { opened++; }} onOpenAll={() => { all++; }} onOpen={id => { one = id; }} />);
    expect(container.querySelectorAll("li a")[0].getAttribute("data-testid")).toBe("nonproject-pipe");
    expect(getByTestId("piped-np1").textContent).toContain("Example Pipeline");
    fireEvent.click(getByTestId("nonproject-pipe")); expect(opened).toBe(1); expect(all).toBe(0);
    fireEvent.click(getByTestId("nonproject-np2")); expect(one).toBe("np2"); expect(all).toBe(0);
    fireEvent.click(getByTestId("nonproject-panel")); expect(all).toBe(1);
  });
  it("is shown on the projects page and hidden when empty", () => {
    const { getByTestId } = render(<App />); expect(getByTestId("nonproject-panel").textContent).toContain("Example Article One");
    cleanup(); const r = render(<NonProjectPanel items={[]} title="x" name={() => ""} status={() => ""} />); expect(r.queryByTestId("nonproject-panel")).toBeNull();
  });
});
describe("v2.0.9 free-text i18n", () => {
  it("every free-text sample field has HU/EN/DE/FR/PT translations", () => {
    const texts = new Set<string>();
    for (const p of D) for (const v of [p[7], p[12], ...(DET[p[0]] ?? [])]) if (v && /[a-z]{3}/i.test(v)) texts.add(v);
    for (const L of ["HU", "EN", "DE", "FR", "PT"]) for (const v of texts) expect(TEXTS[L]?.[v], `${L}: ${v}`).toBeTruthy();
    expect(procTx("DE", "daily 08:00")).toBe("täglich 08:00"); expect(procTx("HU", "on request")).toBe("kérésre"); expect(procTx("EN", "on request")).toBe("on request");
  });
  it("EN All-processes rows contain no Hungarian sample words", () => {
    location.hash = "#/all"; const { container } = render(<App />);
    for (const r of container.querySelectorAll("tbody tr")) expect(r.textContent).not.toMatch(/(napi|óránként|hétfő|kérésre|szerda|és )/);
  });
});
