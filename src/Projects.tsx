import { useState } from "react";
import raw from "../data/sample-projects.json";
import { Status } from "./shim";
import { PROJECT_OF, type P } from "./data";
import { Icon } from "./icons";
import nk from "./i18n/new-keys.json";
const EN_T = (k: string) => ((nk as any)[k]?.[1] ?? k) as string;
export type T = (k: string) => string;
// EXAMPLE DATA: edit data/sample-projects.json to change the projects shown here.
// Card layout ported from the earlier "Projects" Page (status badge + state line, what, details, process-view link).
export type PSt = "active" | "paused" | "waiting" | "blocked" | "nodata" | "notused";
export type WebStatus = { url: string; live: boolean; code?: number; checkedAt: string };
export type Project = { id: string; name: string; summary: string; what: string; why: string; status: string; next: string; st?: PSt; parts?: string; src?: string; updated?: string; owner?: string; lastActive?: string; hours?: number; cost?: number; decision?: string; webStatus?: WebStatus; prio?: 1 | 2 | 3; due?: string };
export const PROJECTS: Project[] = (raw as any).projects;

export type ProjLabels = { more: string; less: string; what: string; why: string; status: string; next: string; heading: string; guideTitle?: string; guide?: string[]; emptyTitle?: string; empty?: string; all?: string; none?: string; reviewed?: string; summary?: string; state?: string; parts?: string; source?: string; open?: string; procs?: string; updated?: string; st?: Partial<Record<PSt, string>> };
export const EN_LABELS: ProjLabels = { more: "Show details", less: "Hide details", what: "What it is", why: "Why", status: "Status", next: "Next step", heading: "Projects", state: "Current state", parts: "Key parts", source: "Source", open: "Process view", procs: "processes", updated: "Updated" };
const TONE: Record<PSt, string> = { active: "success", paused: "neutral", waiting: "accent", blocked: "warning", nodata: "neutral", notused: "neutral" };
const ICON: Record<PSt, any> = { active: "active", paused: "paused", waiting: "waiting", blocked: "blocked", nodata: "nodata", notused: "stopped" };
export const href = (id: string) => `#/project/${encodeURIComponent(id)}`;
const meta = { display: "inline-flex", alignItems: "center", gap: 6 } as const;

const btnS = { font: "inherit", minHeight: 36, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border, #8884)", background: "transparent", color: "inherit", cursor: "pointer" };
export function ProjectCard({ p, l = EN_LABELS, t = EN_T, onOpen, count, open: openC, onToggle }: { p: Project; l?: ProjLabels; t?: T; onOpen?: (id: string) => void; count?: number; open?: boolean; onToggle?: () => void }) {
  const [openS, setOpenS] = useState(false);
  const open = openC ?? openS;
  const setOpen = (f: (o: boolean) => boolean) => (onToggle ? onToggle() : setOpenS(f));
  const detailsId = `project-details-${p.id}`;
  const st: PSt = p.st ?? "nodata";
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
  const uk = (v?: string) => (!v || v === "unknown" ? t("unk") : v);
  return (
    <article data-testid={`project-${p.id}`} role={onOpen ? "button" : undefined} tabIndex={onOpen ? 0 : undefined} onClick={onOpen ? () => onOpen(p.id) : undefined} onKeyDown={onOpen ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } } : undefined}
      style={{ cursor: onOpen ? "pointer" : undefined, border: "1px solid var(--border, #8884)", borderRadius: 12, padding: 16, overflowWrap: "anywhere", display: "flex", flexDirection: "column", gap: 8, background: "var(--surface, transparent)" }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>{p.name}</h3>
      <div data-testid="project-state" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", fontSize: 16 }}>
        <Status tone={TONE[st]} icon={ICON[st]}>{l.st?.[st] ?? st}</Status>{p.webStatus && <a data-testid="web-status" href={p.webStatus.url} target="_blank" rel="noreferrer" onClick={stop} title={`${p.webStatus.url} · HTTP ${p.webStatus.code ?? "–"} · ${t("webChecked")}: ${p.webStatus.checkedAt}`} style={{ textDecoration: "none" }}><Status tone={p.webStatus.live ? "success" : "danger"} icon={p.webStatus.live ? "live" : "offline"}>{t("website")}: {t(p.webStatus.live ? "webLive" : "webOff")}</Status></a>}<span>{p.status}</span>
      </div>
      <div>{p.what}</div>
      <div><strong>{l.next}:</strong> {p.next}</div>
      {p.decision && <div data-testid="card-decision" style={{ ...meta, color: "var(--accent)", fontWeight: 600 }}><Icon name="decision" glow />{t("decT")}: {p.decision}</div>}
      <div data-testid="card-meta" style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", color: "var(--muted)" }}>
        <span style={meta}><Icon name="bot" />{t("owner")}: {uk(p.owner)}</span>
        <span data-testid="last-active" style={meta}><Icon name="pulse" />{t("lastAct")}: {uk(p.lastActive)}</span>
        {p.hours != null && <span style={meta}><Icon name="clock" />{t("time")}: ≈ {p.hours} {t("perWk")} ({t("sample")})</span>}
        {p.cost != null && <span style={meta}><Icon name="cost" />{t("cost")}: ≈ {p.cost} {t("perMo")} ({t("sample")})</span>}
        <span>{count != null ? `${count} ${l.procs} · ` : ""}{p.updated ? `${l.updated}: ${p.updated}` : ""}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <button type="button" aria-expanded={open} aria-controls={detailsId} onClick={(e) => { stop(e); setOpen(o => !o); }} onKeyDown={stop}
          style={{ ...btnS, ...meta }}>
          {open ? l.less : l.more}<Icon name="chevron" style={{ transform: open ? "rotate(180deg)" : undefined }} />
        </button>
        {onOpen && <a data-testid="card-link" href={href(p.id)} onClick={(e) => { e.preventDefault(); stop(e); onOpen(p.id); }} style={{ ...meta, color: "var(--accent, #0a58ca)" }}>{l.open}<Icon name="arrow" /></a>}
      </div>
      <dl id={detailsId} hidden={!open} onClick={stop} style={{ margin: 0, display: open ? "grid" : "none", gridTemplateColumns: "max-content 1fr", gap: "4px 12px", cursor: "auto" }}>
        <dt><strong>{l.why}</strong></dt><dd style={{ margin: 0 }}>{p.why}</dd>
        <dt><strong>{l.state}</strong></dt><dd style={{ margin: 0 }}>{p.status}</dd>
        {p.parts && <><dt><strong>{l.parts}</strong></dt><dd style={{ margin: 0 }}>{p.parts}</dd></>}
        <dt><strong>{l.next}</strong></dt><dd style={{ margin: 0 }}>{p.next}</dd>
        {p.src && <><dt><strong>{l.source}</strong></dt><dd style={{ margin: 0, color: "var(--muted)" }}>{p.src}</dd></>}
      </dl>
    </article>
  );
}

export const REVIEWED: string = (raw as any).reviewed ?? "";
const PRIO_KEY = { 1: "prio1", 2: "prio2", 3: "prio3" } as const;
export function decisions(items: Project[]) {
  return items.filter(p => p.decision).sort((a, b) => (a.prio ?? 3) - (b.prio ?? 3) || (a.due ?? "9999").localeCompare(b.due ?? "9999"));
}
export function daySummary(items: Project[], t: T) {
  const c = (s: PSt) => items.filter(p => (p.st ?? "nodata") === s).length;
  return t("daySum").replace("{n}", String(items.length)).replace("{a}", String(c("active"))).replace("{p}", String(c("paused"))).replace("{w}", String(c("waiting") + c("blocked"))).replace("{d}", String(decisions(items).length));
}
export function DecisionBar({ items, t, onOpen }: { items: Project[]; t: T; onOpen?: (id: string) => void }) {
  const ds = decisions(items);
  return (
    <section data-testid="decision-bar" aria-labelledby="dec-h" style={{ border: "1px solid var(--accent)", borderRadius: 12, padding: "12px 16px", margin: "12px 0", background: "var(--surface)", boxShadow: "0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent), 0 0 18px color-mix(in srgb, var(--accent) 18%, transparent)" }}>
      <h2 id="dec-h" style={{ ...meta, margin: "0 0 8px", fontSize: 20, color: "var(--accent)" }}><Icon name="decision" size={22} glow />{t("decT")} ({ds.length})</h2>
      {ds.length === 0 ? <p style={{ margin: 0 }}>{t("decNone")}</p> :
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {ds.map(p => <li key={p.id} data-testid={`decision-${p.id}`} style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
          <Status tone={p.prio === 1 ? "warning" : "accent"} icon={p.prio === 1 ? "blocked" : "waiting"}>{t(PRIO_KEY[p.prio ?? 3])}</Status>
          <strong>{p.name}</strong><span style={{ flex: "1 1 240px" }}>{p.decision}</span>
          {p.due && <span style={{ ...meta, color: "var(--muted)" }}><Icon name="clock" />{t("decDue")}: {p.due}</span>}
          {onOpen && <a href={href(p.id)} onClick={(e) => { e.preventDefault(); onOpen(p.id); }} style={{ ...meta, color: "var(--accent)" }}>{t("openProj")}<Icon name="arrow" /></a>}
        </li>)}
      </ol>}
    </section>
  );
}
const STS: PSt[] = ["active", "paused", "waiting", "blocked", "notused", "nodata"];
export function Projects({ items = PROJECTS, l = EN_LABELS, t = EN_T, onOpen, counts }: { items?: Project[]; l?: ProjLabels; t?: T; onOpen?: (id: string) => void; counts?: Record<string, number> }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [fs, setFs] = useState<PSt | "all">("all");
  const shown = items.filter(p => (fs === "all" || (p.st ?? "nodata") === fs) && (!q.trim() || [p.name, p.what, p.status, p.next, p.owner, p.decision].join(" ").toLowerCase().includes(q.trim().toLowerCase())));
  const setAll = (v: boolean) => setOpen(Object.fromEntries(shown.map(p => [p.id, v])));
  const [guideOpen, setGuideOpen] = useState(false);
  const present = STS.filter(s => items.some(p => (p.st ?? "nodata") === s));
  return (
    <div>
      {items.length > 0 && <>
        <DecisionBar items={items} t={t} onOpen={onOpen} />
        <p data-testid="day-summary" style={{ ...meta, margin: "4px 0 8px", fontSize: 18, fontWeight: 600 }}><Icon name="summary" />{daySummary(items, t)}</p>
      </>}
      {l.guideTitle && <div data-testid="guide" style={{ border: "1px solid var(--border, #8884)", borderRadius: 10, padding: "6px 12px", margin: "8px 0", display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center" }}>
        <button type="button" aria-expanded={guideOpen} aria-controls="how-to-use" onClick={() => setGuideOpen(o => !o)} style={{ ...btnS, ...meta, border: "none", padding: 0, fontWeight: 600 }}><Icon name="guide" />{l.guideTitle}<Icon name="chevron" style={{ transform: guideOpen ? "rotate(180deg)" : undefined }} /></button>
        {!guideOpen && <span style={{ color: "var(--muted)" }}>{t("gHint")}</span>}
        <ul id="how-to-use" hidden={!guideOpen} style={{ flexBasis: "100%", margin: "4px 0 6px", paddingLeft: 20, lineHeight: 1.5 }}>{(l.guide ?? []).map((g, i) => <li key={i}>{g}</li>)}</ul>
      </div>}
      {items.length === 0 ? <div data-testid="projects-empty" role="status" style={{ border: "1px dashed var(--border, #8884)", borderRadius: 12, padding: 20, margin: "12px 0", maxWidth: 720 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{l.emptyTitle ?? "No projects yet"}</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>{l.empty ?? "Add a project to data/sample-projects.json, then rebuild the app."}</p>
      </div> : <>
      {(l.summary || l.reviewed) && <div style={{ color: "var(--muted)", margin: "4px 0" }}>{l.summary}{l.summary && l.reviewed ? " · " : ""}{l.reviewed ? `${l.reviewed}: ${REVIEWED}` : ""}</div>}
      <div data-testid="filters" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "8px 0" }}>
        <label style={{ ...meta, border: "1px solid var(--border)", borderRadius: 8, padding: "0 10px", minHeight: 36, flex: "1 1 240px", maxWidth: 420 }}>
          <Icon name="search" />
          <input data-testid="search" type="search" aria-label={t("search")} value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")} style={{ font: "inherit", flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: "inherit", minHeight: 34 }} />
        </label>
        <div role="group" aria-label={t("filterBy")} style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(["all", ...present] as const).map(s => <button key={s} type="button" data-testid={`filter-${s}`} aria-pressed={fs === s} onClick={() => setFs(s)}
            style={{ ...btnS, ...meta, background: fs === s ? "var(--accent)" : "transparent", color: fs === s ? "var(--bg)" : "inherit", fontWeight: fs === s ? 600 : 400 }}>
            {s !== "all" && <Icon name={ICON[s]} size={16} />}{s === "all" ? t("fAll") : (l.st?.[s] ?? s)}</button>)}
        </div>
        {l.all && <span style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
          <button type="button" data-testid="expand-all" style={btnS} onClick={() => setAll(true)}>{l.all}</button>
          <button type="button" data-testid="collapse-all" style={btnS} onClick={() => setAll(false)}>{l.none}</button>
        </span>}
      </div>
      {shown.length === 0 ? <p data-testid="no-match" role="status" style={{ margin: "12px 0" }}>{t("noMatch")}</p> :
      <section aria-label={l.heading} style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(420px, 100%), 1fr))", margin: "12px 0" }}>
        {shown.map(p => <ProjectCard key={p.id} p={p} l={l} t={t} onOpen={onOpen} count={counts?.[p.id]} open={!!open[p.id]} onToggle={() => setOpen(o => ({ ...o, [p.id]: !o[p.id] }))} />)}
      </section>}
      </>}
    </div>
  );
}

export const NONPROJ = "_nonproject";
const PIDS = new Set(PROJECTS.map(p => p.id));
export const nonProject = (ps: P[]) => ps.filter(p => !PIDS.has(PROJECT_OF[p[0]]));
export function NonProjectPanel({ items, title, name, status, onOpen, onOpenAll, tx = (v: string) => v, pipe, pipeTag, piped = [], onOpenPipe, pipeProject }: { pipeProject?: string; tx?: (v: string) => string; pipe?: P; pipeTag?: string; piped?: string[]; onOpenPipe?: () => void; items: P[]; title: string; name: (p: P) => string; status: (p: P) => string; onOpen?: (id: string) => void; onOpenAll?: () => void }) {
  if (items.length === 0) return null;
  const amber = "rgb(214 158 46";
  return (
    <section data-testid="nonproject-panel" aria-labelledby="np-h" role={onOpenAll ? "button" : undefined} tabIndex={onOpenAll ? 0 : undefined} onClick={onOpenAll} onKeyDown={onOpenAll ? (e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpenAll(); } } : undefined} style={{ cursor: onOpenAll ? "pointer" : undefined,  border: `1px solid ${amber} / 0.38)`, borderRadius: 12, padding: "12px 16px", margin: "16px 0", background: `${amber} / 0.06)` }}>
      <h2 id="np-h" style={{ ...meta, margin: "0 0 8px", fontSize: 18, color: "var(--text)" }}><span style={{ color: `${amber} / 0.9)`, display: "inline-flex" }}><Icon name="loose" size={20} /></span>{title} ({items.length})</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
        {pipe && <li><a data-testid="nonproject-pipe" href={href(pipeProject ?? "")} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPipe?.(); }}
          style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${amber} / 0.18)`, color: "inherit", textDecoration: "none" }}>
          <span style={{ ...meta }}><Icon name="arrow" size={16} /><strong>{name(pipe)}</strong></span>
          <span data-testid="pipe-tag" style={{ fontSize: 14, border: "1px solid var(--border, #8884)", borderRadius: 999, padding: "0 8px", color: "var(--muted)" }}>{pipeTag}</span>
          <span style={{ color: "var(--muted)" }}>{status(pipe)} · {tx(pipe[8])}</span>
          <span style={{ ...meta, marginLeft: "auto", color: "var(--accent)" }}><Icon name="arrow" /></span></a></li>}
        {items.map(p => <li key={p[0]}><a data-testid={`nonproject-${p[0]}`} href={href(NONPROJ)} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen?.(p[0]); }}
          style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${amber} / 0.18)`, color: "inherit", textDecoration: "none" }}>
          <strong style={{ paddingLeft: pipe && piped.includes(p[0]) ? 20 : 0 }}>{name(p)}</strong>{pipe && piped.includes(p[0]) && <span data-testid={`piped-${p[0]}`} style={{ color: "var(--muted)", fontSize: 14 }}>← {name(pipe)}</span>}<span style={{ color: "var(--muted)" }}>{status(p)} · {tx(p[8])}{p[10] && !["—", "–"].includes(p[10]) ? ` · ${tx(p[10])}` : ""}</span>
          <span style={{ ...meta, marginLeft: "auto", color: "var(--accent)" }}><Icon name="arrow" /></span></a></li>)}
      </ul>
    </section>
  );
}
