// Local shim replacing the canvas runtime components and theme.
import React, { useEffect, useState } from "react";
const light = { kind: "light" as const, bg: { base: "#ffffff", elevated: "#f6f7f9", subtle: "#eef0f3" }, border: { default: "#c9ced6", strong: "#8a93a0", subtle: "#e1e4e9" }, text: { primary: "#111418", secondary: "#3d4450", tertiary: "#525a66", accent: "#0b57d0", danger: "#b3261e", dangerDeep: "#8c1d18", success: "#146c2e", warning: "#8a5300", warningDeep: "#6b4000" }, fill: { accentSubtle: "#e3ecfb", dangerSubtle: "#fbe4e2", warningSubtle: "#fdf0d8", secondary: "#e8eaee" }, font: { heading: "system-ui, sans-serif", heading1: { fontSize: 26, lineHeight: "32px" } }, radius: { md: 6, lg: 10 }, dataviz: { categorical: ["#0b57d0", "#b3261e", "#146c2e", "#8a5300", "#6f3fb5", "#00695c", "#c2185b", "#455a64"] } };
const dark = { ...light, kind: "dark" as const, bg: { base: "#0f1115", elevated: "#181b22", subtle: "#20242c" }, border: { default: "#2a2f38", strong: "#7d8794", subtle: "#22262e" }, text: { primary: "#e6e8eb", secondary: "#c4c9d0", tertiary: "#9aa3ad", accent: "#8ab4f8", danger: "#f28b82", dangerDeep: "#f6aea9", success: "#81c995", warning: "#fdd663", warningDeep: "#fde293" }, fill: { accentSubtle: "#1c2b45", dangerSubtle: "#3b1d1b", warningSubtle: "#3a2f10", secondary: "#262a33" }, dataviz: { categorical: ["#8ab4f8", "#f28b82", "#81c995", "#fdd663", "#c58af9", "#4ecdc4", "#ff8bcb", "#a8b8c4"] } };
export const THEMES = { light, dark };
export type Mode = "auto" | "light" | "dark";
export const MODE_KEY = "odp-theme";
export function loadMode(): Mode { try { const v = localStorage.getItem(MODE_KEY); return v === "light" || v === "dark" ? v : "auto"; } catch { return "auto"; } }
export function saveMode(m: Mode) { try { localStorage.setItem(MODE_KEY, m); } catch {} }
export function useTheme(mode: Mode = "auto"): any {
  const q = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [d, setD] = useState(!!q?.matches);
  useEffect(() => { if (!q) return; const f = () => setD(q.matches); q.addEventListener?.("change", f); return () => q.removeEventListener?.("change", f); }, []);
  const th = mode === "dark" || (mode === "auto" && d) ? dark : light;
  useEffect(() => {
    if (typeof document === "undefined") return;
    const r = document.documentElement; r.dataset.theme = th.kind; r.style.colorScheme = th.kind;
    r.style.setProperty("--bg", th.bg.base); r.style.setProperty("--surface", th.bg.elevated); r.style.setProperty("--text", th.text.primary); r.style.setProperty("--muted", th.text.tertiary); r.style.setProperty("--accent", th.text.accent); r.style.setProperty("--border", th.border.default);
    r.style.background = th.bg.base; r.style.color = th.text.primary; document.body.style.background = th.bg.base; document.body.style.color = th.text.primary; document.body.style.margin = "0";
  }, [th]);
  return th;
}
let cur: any = light;
export const setCurrent = (t: any) => { cur = t; };
export const Fragment = React.Fragment;
export const Page = ({ children }: any) => <main style={{ fontFamily: "system-ui, sans-serif", padding: 16, background: "var(--bg)", color: "var(--text)", minHeight: "100vh", boxSizing: "border-box" }}>{children}</main>;
export const Section = ({ heading, caption, children, collapsible, defaultOpen = true }: any) => {
  const [open, setOpen] = useState(defaultOpen);
  return <section style={{ margin: "16px 0" }}><h2 style={{ fontSize: 18, margin: "4px 0" }}>{collapsible ? <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} style={{ font: "inherit", fontWeight: 700, background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer" }}>{open ? "▾ " : "▸ "}{heading}</button> : heading}</h2>{caption && <div style={{ fontSize: 13, opacity: 0.8 }}>{caption}</div>}{(!collapsible || open) && children}</section>;
};
export const Grid = ({ columns = 2, children }: any) => <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: 12 }}>{children}</div>;
export const Properties = ({ items }: any) => <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>{items.map((it: any, i: number) => <React.Fragment key={i}><dt style={{ fontWeight: 600 }}>{it.label}</dt><dd style={{ margin: 0 }}>{it.value}</dd></React.Fragment>)}</dl>;
const tone = (k: string) => ({ success: cur.text.success, warning: cur.text.warning, danger: cur.text.danger, accent: cur.text.accent, neutral: cur.text.tertiary } as any)[k] ?? cur.text.tertiary;
export const Status = ({ tone: tn = "neutral", children, label }: any) => <span style={{ border: `1px solid ${tone(tn)}`, color: tone(tn), borderRadius: 10, padding: "0 8px", fontSize: 12 }}>{label ?? children}</span>;
export const Button = ({ label, onClick, variant, disabled, children }: any) => <button disabled={disabled} onClick={onClick} style={{ padding: "4px 10px", margin: 2, borderRadius: 6, border: `1px solid ${cur.border.strong}`, background: variant === "primary" ? cur.text.accent : "transparent", color: variant === "primary" ? (cur.kind === "dark" ? "#0f1115" : "#ffffff") : "inherit", cursor: "pointer" }}>{label ?? children}</button>;
export const Segmented = ({ options, value, onChange }: any) => <div role="tablist" style={{ display: "inline-flex", gap: 2, flexWrap: "wrap" }}>{options.map((o: any) => <button key={o.value} onClick={() => onChange(o.value)} aria-pressed={o.value === value} style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${cur.border.strong}`, background: o.value === value ? cur.text.accent : "transparent", color: o.value === value ? (cur.kind === "dark" ? "#0f1115" : "#ffffff") : "inherit" }}>{o.label}{o.count != null ? ` (${o.count})` : ""}</button>)}</div>;
export const Select = ({ options, value, onChange }: any) => <select style={{ background: cur.bg.elevated, color: cur.text.primary, border: `1px solid ${cur.border.strong}` }} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o: any) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
export const Text = ({ children, style, ...rest }: any) => <span style={style} {...rest}>{children}</span>;
