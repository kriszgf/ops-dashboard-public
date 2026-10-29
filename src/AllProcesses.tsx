import { useState } from "react";
import { PROJECT_OF, KINDS, type P } from "./data";
import { PROJECTS } from "./Projects";
import { Icon } from "./icons";
export const ALL = "_all";
export type Kind = "sched" | "pipeline" | "process" | "bg";
// Type comes from data "kinds" (pipeline / process / bg); anything else is a scheduled process.
export const kindOf = (id: string): Kind => KINDS[id] ?? "sched";
export const projectKey = (id: string): string => { const k = PROJECT_OF[id]; return k && PROJECTS.some(p => p.id === k) ? k : ""; };
export const blank = (v: string) => (!v || v === "–" || v === "—" ? "" : v);
export type AllL = { title: string; name: string; label: string; type: string; timing: string; owner: string; status: string; all: string; nonProj: string; related: string; kinds: Record<Kind, string> };
export const labelOf = (id: string, l: AllL) => { const k = projectKey(id); return k ? l.related.replace("{x}", PROJECTS.find(p => p.id === k)?.name ?? k) : l.nonProj; };
const chip = (on: boolean) => ({ font: "inherit", minHeight: 36, padding: "0 12px", borderRadius: 999, border: "1px solid var(--border, #8884)", background: on ? "var(--accent)" : "transparent", color: on ? "var(--bg)" : "inherit", fontWeight: on ? 600 : 400, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 });
const KICON: Record<Kind, any> = { sched: "clock", pipeline: "arrow", process: "guide", bg: "pulse" };
export function AllProcesses({ items, l, name, status, onOpen, tx = (v: string) => v }: { tx?: (v: string) => string; items: P[]; l: AllL; name: (p: P) => string; status: (p: P) => string; onOpen?: (id: string) => void }) {
  const [lf, setLf] = useState(""); const [kf, setKf] = useState<Kind | "">("");
  const labels = [...new Set(items.map(p => labelOf(p[0], l)))];
  const kinds = (["sched", "pipeline", "process", "bg"] as Kind[]).filter(k => items.some(p => kindOf(p[0]) === k));
  const rows = items.filter(p => (!lf || labelOf(p[0], l) === lf) && (!kf || kindOf(p[0]) === kf));
  const td = { padding: "8px 10px", borderTop: "1px solid var(--border, #8884)", verticalAlign: "top" as const, overflowWrap: "anywhere" as const, whiteSpace: "normal" as const };
  return (
    <section data-testid="all-processes" aria-label={l.title}>
      <div role="group" aria-label={l.label} style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
        <button type="button" data-testid="lf-all" aria-pressed={!lf} style={chip(!lf)} onClick={() => setLf("")}>{l.all}</button>
        {labels.map(x => <button key={x} type="button" data-testid={`lf-${x}`} aria-pressed={lf === x} style={chip(lf === x)} onClick={() => setLf(x)}>{x}</button>)}
      </div>
      <div role="group" aria-label={l.type} style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
        <button type="button" data-testid="kf-all" aria-pressed={!kf} style={chip(!kf)} onClick={() => setKf("")}>{l.all}</button>
        {kinds.map(k => <button key={k} type="button" data-testid={`kf-${k}`} aria-pressed={kf === k} style={chip(kf === k)} onClick={() => setKf(k)}><Icon name={KICON[k]} size={16} />{l.kinds[k]}</button>)}
      </div>
      <div style={{ border: "1px solid var(--border, #8884)", borderRadius: 12, overflowX: "auto", background: "var(--surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
          <thead><tr style={{ textAlign: "left", color: "var(--muted)" }}>{[l.name, l.label, l.type, l.timing, l.owner, l.status].map(h => <th key={h} style={{ padding: "8px 10px", fontWeight: 600 }}>{h}</th>)}</tr></thead>
          <tbody>{rows.map(p => { const k = kindOf(p[0]); return (
            <tr key={p[0]} data-testid={`row-${p[0]}`} tabIndex={0} role="link" onClick={() => onOpen?.(p[0])} onKeyDown={(e) => { if (e.key === "Enter") onOpen?.(p[0]); }} style={{ cursor: "pointer" }}>
              <td style={{ ...td, fontWeight: 600 }}>{name(p)}</td>
              <td style={{ ...td, color: projectKey(p[0]) ? "inherit" : "rgb(214 158 46)" }}>{labelOf(p[0], l)}</td>
              <td style={{ ...td, whiteSpace: "nowrap" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name={KICON[k]} size={16} />{l.kinds[k]}</span></td>
              <td style={td}>{tx(blank(p[7]))}</td>
              <td style={td}>{tx(blank(p[8]))}</td>
              <td style={td}>{status(p)}</td>
            </tr>); })}</tbody>
        </table>
      </div>
    </section>
  );
}
