import { useState } from "react";
import raw from "../data/sample-projects.json";
// EXAMPLE DATA: edit data/sample-projects.json to change the projects shown here.
export type Project = { id: string; name: string; summary: string; what: string; why: string; status: string; next: string };
export const PROJECTS: Project[] = (raw as any).projects;

export type ProjLabels = { more: string; less: string; what: string; why: string; status: string; next: string; heading: string };
export const EN_LABELS: ProjLabels = { more: "More", less: "Less", what: "What it is", why: "Why", status: "Status", next: "Next step", heading: "Projects (example data)" };

export function ProjectCard({ p, l = EN_LABELS }: { p: Project; l?: ProjLabels }) {
  const [open, setOpen] = useState(false);
  const detailsId = `project-details-${p.id}`;
  return (
    <article data-testid={`project-${p.id}`} style={{ border: "1px solid #8884", borderRadius: 8, padding: 12, overflowWrap: "anywhere" }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{p.name}</h3>
      <p style={{ margin: "0 0 6px" }}>{p.summary}</p>
      <button type="button" aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen(o => !o)}>
        {open ? l.less : l.more}
      </button>
      <dl id={detailsId} hidden={!open} style={{ margin: "8px 0 0" }}>
        <dt><strong>{l.what}</strong></dt><dd>{p.what}</dd>
        <dt><strong>{l.why}</strong></dt><dd>{p.why}</dd>
        <dt><strong>{l.status}</strong></dt><dd>{p.status}</dd>
        <dt><strong>{l.next}</strong></dt><dd>{p.next}</dd>
      </dl>
    </article>
  );
}

export function Projects({ items = PROJECTS, l = EN_LABELS }: { items?: Project[]; l?: ProjLabels }) {
  return (
    <section aria-label={l.heading} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", margin: "12px 0" }}>
      {items.map(p => <ProjectCard key={p.id} p={p} l={l} />)}
    </section>
  );
}
