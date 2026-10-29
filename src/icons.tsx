// Original inline SVG icons for ops-dashboard (MIT, same licence as this project).
// Thin 1.5px line / geometric style, drawn on a 24px grid; colour = currentColor.
// No third-party icon set is bundled, so no extra licence notice is needed.
import type { ReactNode } from "react";
export type IconName = "active" | "paused" | "waiting" | "blocked" | "nodata" | "stopped" | "planned" | "decision" | "search" | "clock" | "cost" | "bot" | "pulse" | "arrow" | "back" | "chevron" | "guide" | "summary";
const P: Record<IconName, ReactNode> = {
  active: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></>,
  paused: <><circle cx="12" cy="12" r="8.5" /><path d="M10 8.5v7M14 8.5v7" /></>,
  waiting: <><path d="M12 3.5 20.5 12 12 20.5 3.5 12Z" /><path d="M12 8v4.5l2.5 1.5" /></>,
  blocked: <><path d="M8.5 3.5h7l5 5v7l-5 5h-7l-5-5v-7Z" /><path d="M8.5 15.5l7-7" /></>,
  nodata: <circle cx="12" cy="12" r="8.5" strokeDasharray="2.5 3" />,
  stopped: <><circle cx="12" cy="12" r="8.5" /><rect x="9" y="9" width="6" height="6" rx="1" /></>,
  planned: <><path d="M12 3.5 20.5 12 12 20.5 3.5 12Z" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></>,
  decision: <><path d="M12 3 21 12 12 21 3 12Z" /><path d="M12 8v5" /><circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5.5 5.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  cost: <><circle cx="12" cy="12" r="8.5" /><path d="M14.5 9a3 3 0 1 0 0 6M8 11h5M8 13h5" /></>,
  bot: <><rect x="5" y="8" width="14" height="10" rx="3" /><path d="M12 4.5V8M9.5 13h0M14.5 13h0" strokeWidth="2.2" /></>,
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
  chevron: <path d="m8 10 4 4 4-4" />,
  guide: <><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M9 8.5h6M9 12h6M9 15.5h3.5" /></>,
  summary: <><path d="M4 18.5h16" /><path d="M7 15V11M12 15V6.5M17 15V9" /></>,
};
export function Icon({ name, size = 18, glow, title, style }: { name: IconName; size?: number; glow?: boolean; title?: string; style?: any }) {
  return (
    <svg data-icon={name} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}
      style={{ flex: "none", verticalAlign: "-0.2em", filter: glow ? "drop-shadow(0 0 3px currentColor)" : undefined, ...style }}>{P[name]}</svg>
  );
}
