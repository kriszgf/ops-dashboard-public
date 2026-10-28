// Local shim replacing the canvas runtime components and theme.
import React, { useEffect, useState } from "react";
const light = { kind: "light" as const, bg: { base: "#ffffff", elevated: "#f6f7f9", subtle: "#eef0f3" }, border: { default: "#c9ced6", strong: "#8a93a0", subtle: "#e1e4e9" }, text: { primary: "#111418", secondary: "#3d4450", tertiary: "#525a66", accent: "#0b57d0", danger: "#b3261e", dangerDeep: "#8c1d18", success: "#146c2e", warning: "#8a5300", warningDeep: "#6b4000" }, fill: { accentSubtle: "#e3ecfb", dangerSubtle: "#fbe4e2", warningSubtle: "#fdf0d8", secondary: "#e8eaee" }, font: { heading: "system-ui, sans-serif", heading1: { fontSize: 26, lineHeight: "32px" } }, radius: { md: 6, lg: 10 }, dataviz: { categorical: ["#0b57d0", "#b3261e", "#146c2e", "#8a5300", "#6f3fb5", "#00796b", "#c2185b", "#455a64"] } };
const dark = { ...light, kind: "dark" as const, bg: { base: "#121417", elevated: "#1b1e23", subtle: "#24282e" }, border: { default: "#3a4049", strong: "#6b7380", subtle: "#2a2f36" }, text: { primary: "#f1f3f5", secondary: "#c4c9d0", tertiary: "#a3aab4", accent: "#8ab4f8", danger: "#f28b82", dangerDeep: "#f6aea9", success: "#81c995", warning: "#fdd663", warningDeep: "#fde293" }, fill: { accentSubtle: "#1c2b45", dangerSubtle: "#3b1d1b", warningSubtle: "#3a2f10", secondary: "#2a2f36" } };
export function useTheme(): any {
  const q = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [d, setD] = useState(!!q?.matches);
  useEffect(() => { if (!q) return; const f = () => setD(q.matches); q.addEventListener("change", f); return () => q.removeEventListener("change", f); }, []);
  return d ? dark : light;
}
export const Fragment = React.Fragment;
export const Page = ({ children }: any) => <main style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>{children}</main>;
export const Section = ({ heading, caption, children, collapsible, defaultOpen = true }: any) => {
  const [open, setOpen] = useState(defaultOpen);
  return <section style={{ margin: "16px 0" }}><h2 style={{ fontSize: 18, margin: "4px 0", cursor: collapsible ? "pointer" : undefined }} onClick={() => collapsible && setOpen(!open)}>{collapsible ? (open ? "▾ " : "▸ ") : ""}{heading}</h2>{caption && <div style={{ fontSize: 13, opacity: 0.8 }}>{caption}</div>}{(!collapsible || open) && children}</section>;
};
export const Grid = ({ columns = 2, children }: any) => <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap: 12 }}>{children}</div>;
export const Properties = ({ items }: any) => <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>{items.map((it: any, i: number) => <React.Fragment key={i}><dt style={{ fontWeight: 600 }}>{it.label}</dt><dd style={{ margin: 0 }}>{it.value}</dd></React.Fragment>)}</dl>;
const tones: any = { success: "#146c2e", warning: "#8a5300", danger: "#b3261e", accent: "#0b57d0", neutral: "#525a66" };
export const Status = ({ tone = "neutral", children, label }: any) => <span style={{ border: `1px solid ${tones[tone]}`, color: tones[tone], borderRadius: 10, padding: "0 8px", fontSize: 12 }}>{label ?? children}</span>;
export const Button = ({ label, onClick, variant, disabled, children }: any) => <button disabled={disabled} onClick={onClick} style={{ padding: "4px 10px", margin: 2, borderRadius: 6, border: "1px solid #8a93a0", background: variant === "primary" ? "#0b57d0" : "transparent", color: variant === "primary" ? "#fff" : "inherit", cursor: "pointer" }}>{label ?? children}</button>;
export const Segmented = ({ options, value, onChange }: any) => <div role="tablist" style={{ display: "inline-flex", gap: 2, flexWrap: "wrap" }}>{options.map((o: any) => <button key={o.value} onClick={() => onChange(o.value)} aria-pressed={o.value === value} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid #8a93a0", background: o.value === value ? "#0b57d0" : "transparent", color: o.value === value ? "#fff" : "inherit" }}>{o.label}{o.count != null ? ` (${o.count})` : ""}</button>)}</div>;
export const Select = ({ options, value, onChange }: any) => <select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o: any) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
export const Text = ({ children, style, ...rest }: any) => <span style={style} {...rest}>{children}</span>;
