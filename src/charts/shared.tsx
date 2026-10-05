import React, { useEffect, useRef, useState } from "react";
import { darkPalette, lightPalette, themes } from "./palette";
import type { ChartTheme, ThemeTokens } from "./palette";
import { injectStyles } from "./styles";
import type { Datum, SeriesConfig } from "./types";

export interface ResolvedSeries {
  key: string;
  label: string;
  color: string;
  /** Mark type (combo charts). */
  mark: "line" | "area" | "bar";
  /** 0 = left axis, 1 = right axis. */
  axis: 0 | 1;
}

/**
 * Normalises the `series` prop. Colours are assigned by position in the full
 * list, so hiding a series from the legend never recolours the others.
 */
export function resolveSeries(
  data: Datum[],
  xKey: string,
  series: Array<string | (SeriesConfig & { type?: "line" | "area" | "bar"; axis?: "left" | "right" })> | undefined,
  palette: string[],
  defaultMark: "line" | "area" | "bar"
): ResolvedSeries[] {
  let list: Array<SeriesConfig & { type?: "line" | "area" | "bar"; axis?: "left" | "right" }>;
  if (series && series.length) {
    list = series.map((s) => (typeof s === "string" ? { key: s } : s));
  } else {
    const first = data[0] || {};
    list = Object.keys(first)
      .filter((k) => k !== xKey && typeof first[k] === "number")
      .map((k) => ({ key: k }));
  }
  return list.map((s, i) => ({
    key: s.key,
    label: s.label || s.key,
    color: s.color || palette[i % palette.length],
    mark: s.type || defaultMark,
    axis: s.axis === "right" ? 1 : 0,
  }));
}

export function getTheme(theme: ChartTheme | undefined, colors?: string[]): { tokens: ThemeTokens; palette: string[] } {
  const t = theme === "dark" ? "dark" : "light";
  return {
    tokens: themes[t],
    palette: colors && colors.length ? colors : t === "dark" ? darkPalette : lightPalette,
  };
}

let uid = 0;

/** Stable per-instance id for SVG defs and aria wiring; also injects the base styles. */
export function useChartId(prefix = "tc"): string {
  const ref = useRef<string>("");
  if (!ref.current) ref.current = prefix + ++uid;
  useEffect(() => {
    injectStyles();
  }, []);
  return ref.current;
}

/** Hidden-series state for legend toggling; controlled when `controlled` is passed. */
export function useHiddenSeries(
  allKeys: string[],
  defaultHidden: string[] | undefined,
  controlled: string[] | undefined,
  onChange: ((key: string, hidden: string[]) => void) | undefined
): [string[], (key: string) => void] {
  const [inner, setInner] = useState<string[]>(defaultHidden || []);
  const hidden = controlled || inner;
  const toggle = (key: string) => {
    let next: string[];
    if (hidden.indexOf(key) >= 0) next = hidden.filter((k) => k !== key);
    else {
      next = hidden.concat(key);
      // never hide the last visible series: an empty chart reads as broken
      if (allKeys.every((k) => next.indexOf(k) >= 0)) return;
    }
    if (!controlled) setInner(next);
    if (onChange) onChange(key, next);
  };
  return [hidden, toggle];
}

export interface TooltipRow {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  color?: string;
  marker?: "square" | "line" | "circle";
}

/** Floating tooltip box, positioned in px relative to the chart's plot wrapper. */
export function Tooltip({
  x,
  y,
  flip,
  tokens,
  title,
  rows,
  footer,
}: {
  x: number;
  y: number;
  flip?: boolean;
  tokens: ThemeTokens;
  title?: React.ReactNode;
  rows: TooltipRow[];
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="tc-tooltip"
      role="presentation"
      style={{
        transform: `translate(${x}px, ${y}px)${flip ? " translateX(-100%)" : ""}`,
        background: tokens.tooltipBg,
        border: `1px solid ${tokens.tooltipBorder}`,
        color: tokens.tooltipText,
      }}
    >
      {title !== undefined && <div className="tc-tooltip-title">{title}</div>}
      {rows.map((r) => (
        <div className="tc-tooltip-row" key={r.key}>
          {r.color && <span className={markerClass(r.marker)} style={{ background: r.color }} />}
          <span className="tc-tooltip-label">{r.label}</span>
          <span className="tc-tooltip-value">{r.value}</span>
        </div>
      ))}
      {footer && <div className="tc-tooltip-footer" style={{ color: tokens.muted }}>{footer}</div>}
    </div>
  );
}

export function markerClass(marker?: "square" | "line" | "circle") {
  return "tc-key" + (marker === "line" ? " tc-key-line" : marker === "circle" ? " tc-key-circle" : "");
}

/** Visually hidden data table: the screen-reader equivalent of the chart. */
export function SrTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: Array<Array<string>> }) {
  return (
    <table className="tc-sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th scope="col" key={i}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) =>
              j === 0 ? (
                <th scope="row" key={j}>
                  {cell}
                </th>
              ) : (
                <td key={j}>{cell}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Arrow / Home / End / Escape handling shared by every chart. Returns the next index, `null` to clear, or `undefined` if the key is not ours. */
export function navKey(key: string, active: number | null, n: number, vertical = false): number | null | undefined {
  if (!n) return undefined;
  if (vertical && key === "ArrowDown") key = "ArrowRight";
  if (vertical && key === "ArrowUp") key = "ArrowLeft";
  if (key === "ArrowRight") return active === null ? 0 : Math.min(n - 1, active + 1);
  if (key === "ArrowLeft") return active === null ? n - 1 : Math.max(0, active - 1);
  if (key === "Home") return 0;
  if (key === "End") return n - 1;
  if (key === "Escape") return null;
  return undefined;
}

/** Rough text width for 11–12px UI sans text; good enough for label boxes and margins. */
export function textWidth(s: string, size = 11): number {
  return s.length * size * 0.6;
}
