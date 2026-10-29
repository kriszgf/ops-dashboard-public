import { useState } from "react";
import raw from "../data/sample-projects.json";
import { Status } from "./shim";
// EXAMPLE DATA: edit data/sample-projects.json to change the projects shown here.
// Card layout ported from the earlier "Projects" Page (status badge + state line, what, details, process-view link).
export type PSt = "active" | "paused" | "waiting" | "blocked" | "nodata";
export type Project = { id: string; name: string; summary: string; what: string; why: string; status: string; next: string; st?: PSt; parts?: string; src?: string; updated?: string };
export const PROJECTS: Project[] = (raw as any).projects;

export type ProjLabels = { more: string; less: string; what: string; why: string; status: string; next: string; heading: string; guideTitle?: string; guide?: string[]; emptyTitle?: string; empty?: string; all?: string; none?: string; reviewed?: string; summary?: string; state?: string; parts?: string; source?: string; open?: string; procs?: string; updated?: string; st?: Partial<Record<PSt, string>> };
export const EN_LABELS: ProjLabels = { more: "Show details ▾", less: "Hide details ▴", what: "What it is", why: "Why", status: "Status", next: "Next step", heading: "Projects", state: "Current state", parts: "Key parts", source: "Source", open: "Process view →", procs: "processes", updated: "Updated" };
const TONE: Record<PSt, string> = { active: "success", paused: "neutral", waiting: "accent", blocked: "warning", nodata: "neutral" };

export function ProjectCard({ p, l = EN_LABELS, onOpen, count, open: openC, onToggle }: { p: Project; l?: ProjLabels; onOpen?: (id: string) => void; count?: number; open?: boolean; onToggle?: () => void }) {
  const [openS, setOpenS] = useState(false);
  const open = openC ?? openS;
  const setOpen = (f: (o: boolean) => boolean) => (onToggle ? onToggle() : setOpenS(f));
  const detailsId = `project-details-${p.id}`;
  const st: PSt = p.st ?? "nodata";
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  return (
    <article data-testid={`project-${p.id}`} role={onOpen ? "button" : undefined} tabIndex={onOpen ? 0 : undefined} onClick={onOpen ? () => onOpen(p.id) : undefined} onKeyDown={onOpen ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } } : undefined}
      style={{ cursor: onOpen ? "pointer" : undefined, border: "1px solid var(--border, #8884)", borderRadius: 12, padding: 16, overflowWrap: "anywhere", display: "flex", flexDirection: "column", gap: 8, background: "var(--surface, transparent)" }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>{p.name}</h3>
      <div data-testid="project-state" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", fontSize: 14 }}>
        <Status tone={TONE[st]}>{l.st?.[st] ?? st}</Status><span>{p.status}</span>
      </div>
      <div style={{ fontSize: 15 }}>{p.what}</div>
      <div style={{ fontSize: 14 }}><strong>{l.next}:</strong> {p.next}</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{count != null ? `${count} ${l.procs} · ` : ""}{p.updated ? `${l.updated}: ${p.updated}` : ""}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <button type="button" aria-expanded={open} aria-controls={detailsId} onClick={(e) => { stop(e); setOpen(o => !o); }} onKeyDown={stop}
          style={{ minHeight: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border, #8884)", background: "transparent", color: "inherit", cursor: "pointer" }}>
          {open ? l.less : l.more}
        </button>
        {onOpen && <span style={{ color: "var(--accent, #0a58ca)", fontSize: 14 }}>{l.open}</span>}
      </div>
      <dl id={detailsId} hidden={!open} onClick={stop} style={{ margin: 0, display: open ? "grid" : "none", gridTemplateColumns: "max-content 1fr", gap: "4px 12px", fontSize: 14, cursor: "auto" }}>
        <dt><strong>{l.why}</strong></dt><dd style={{ margin: 0 }}>{p.why}</dd>
        <dt><strong>{l.state}</strong></dt><dd style={{ margin: 0 }}>{p.status}</dd>
        {p.parts && <><dt><strong>{l.parts}</strong></dt><dd style={{ margin: 0 }}>{p.parts}</dd></>}
        <dt><strong>{l.next}</strong></dt><dd style={{ margin: 0 }}>{p.next}</dd>
        {p.src && <><dt><strong>{l.source}</strong></dt><dd style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{p.src}</dd></>}
      </dl>
    </article>
  );
}

const btnS = { minHeight: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border, #8884)", background: "transparent", color: "inherit", cursor: "pointer" };
export const REVIEWED: string = (raw as any).reviewed ?? "";
export function Projects({ items = PROJECTS, l = EN_LABELS, onOpen, counts }: { items?: Project[]; l?: ProjLabels; onOpen?: (id: string) => void; counts?: Record<string, number> }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const setAll = (v: boolean) => setOpen(Object.fromEntries(items.map(p => [p.id, v])));
  const [guideOpen, setGuideOpen] = useState(false);
  return (
    <div>
      {l.guideTitle && <div data-testid="guide" style={{ border: "1px solid var(--border, #8884)", borderRadius: 10, padding: "6px 12px", margin: "8px 0" }}>
        <button type="button" aria-expanded={guideOpen} aria-controls="how-to-use" onClick={() => setGuideOpen(o => !o)} style={{ ...btnS, border: "none", padding: 0, fontWeight: 600 }}>{guideOpen ? "▾ " : "▸ "}{l.guideTitle}</button>
        <ul id="how-to-use" hidden={!guideOpen} style={{ margin: "4px 0 6px", paddingLeft: 20, lineHeight: 1.5, fontSize: 14 }}>{(l.guide ?? []).map((g, i) => <li key={i}>{g}</li>)}</ul>
      </div>}
      {items.length === 0 ? <div data-testid="projects-empty" role="status" style={{ border: "1px dashed var(--border, #8884)", borderRadius: 12, padding: 20, margin: "12px 0", maxWidth: 720 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{l.emptyTitle ?? "No projects yet"}</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>{l.empty ?? "Add a project to data/sample-projects.json, then rebuild the app."}</p>
      </div> : <>
      {(l.summary || l.reviewed) && <div style={{ fontSize: 13, opacity: 0.8, margin: "4px 0" }}>{l.summary}{l.summary && l.reviewed ? " · " : ""}{l.reviewed ? `${l.reviewed}: ${REVIEWED}` : ""}</div>}
      {l.all && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
        <button type="button" data-testid="expand-all" style={btnS} onClick={() => setAll(true)}>{l.all}</button>
        <button type="button" data-testid="collapse-all" style={btnS} onClick={() => setAll(false)}>{l.none}</button>
      </div>}
      <section aria-label={l.heading} style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(420px, 100%), 1fr))", margin: "12px 0" }}>
        {items.map(p => <ProjectCard key={p.id} p={p} l={l} onOpen={onOpen} count={counts?.[p.id]} open={!!open[p.id]} onToggle={() => setOpen(o => ({ ...o, [p.id]: !o[p.id] }))} />)}
      </section>
      </>}
    </div>
  );
}
