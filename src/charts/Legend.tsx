import React, { useEffect } from "react";
import { themes } from "./palette";
import { markerClass } from "./shared";
import { injectStyles } from "./styles";
import type { LegendProps } from "./types";

/**
 * Series legend. With `onToggle` every entry is a toggle button
 * (aria-pressed = shown); without it the legend is a plain list.
 * Every chart renders one of these, and it can be used on its own to drive
 * several charts from one set of toggles.
 */
const Legend = ({ items, hidden = [], onToggle, onHighlight, marker = "square", layout = "row", theme = "light", className, style }: LegendProps) => {
  useEffect(() => {
    injectStyles();
  }, []);
  const tokens = themes[theme] || themes.light;
  const interactive = !!onToggle;
  return (
    <ul
      className={"tc-legend" + (layout === "column" ? " tc-legend-col" : "") + (className ? " " + className : "")}
      style={{ color: tokens.muted, ...style }}
      aria-label={interactive ? "Series" : undefined}
      onPointerLeave={onHighlight ? () => onHighlight(null) : undefined}
    >
      {items.map((it) => {
        const off = hidden.indexOf(it.key) >= 0;
        const swatch = (
          <span
            className={markerClass(marker)}
            style={off ? { background: "transparent", boxShadow: `inset 0 0 0 1.5px ${it.color}` } : { background: it.color }}
          />
        );
        const content = (
          <>
            {swatch}
            <span className="tc-legend-label" style={{ color: off ? tokens.muted : tokens.text }}>
              {it.label}
            </span>
            {it.value !== undefined && <span className="tc-legend-value">{it.value}</span>}
          </>
        );
        return (
          <li key={it.key} className={off ? "tc-off" : undefined} onPointerEnter={onHighlight && !off ? () => onHighlight(it.key) : undefined}>
            {interactive ? (
              <button
                type="button"
                className="tc-legend-btn"
                aria-pressed={!off}
                onClick={() => onToggle!(it.key)}
                onFocus={onHighlight && !off ? () => onHighlight(it.key) : undefined}
                onBlur={onHighlight ? () => onHighlight(null) : undefined}
                title={(off ? "Show " : "Hide ") + (typeof it.label === "string" ? it.label : it.key)}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default Legend;
