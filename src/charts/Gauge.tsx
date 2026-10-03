import React from "react";
import { arcLine, polar, toRad } from "./arc";
import { formatFull } from "./scale";
import { useContainerWidth } from "./useSize";
import { getTheme, useChartId } from "./shared";
import type { GaugeProps, GaugeThreshold } from "./types";

/** Which threshold band a value falls in (the highest threshold at or below it). */
export function thresholdFor(value: number, thresholds: GaugeThreshold[] | undefined): GaugeThreshold | undefined {
  if (!thresholds || !thresholds.length) return undefined;
  const sorted = thresholds.slice().sort((a, b) => a.value - b.value);
  let hit: GaugeThreshold | undefined;
  sorted.forEach((t) => {
    if (value >= t.value) hit = t;
  });
  return hit || sorted[0];
}

/**
 * One KPI against its range and, optionally, a target. Threshold bands colour
 * the arc by status (e.g. off track / at risk / on track).
 */
const Gauge = (props: GaugeProps) => {
  const {
    value,
    min = 0,
    max = 100,
    target,
    label,
    arc = 240,
    rounded = true,
    width: fixedWidth,
    height = 200,
    theme = "light",
    animate = true,
    thresholds,
    title,
    description,
    className,
    style,
  } = props;
  const { tokens, palette } = getTheme(theme);
  const formatValue = props.formatValue || ((v: number) => formatFull(v));
  const id = useChartId("tcg");
  const { ref, width } = useContainerWidth(fixedWidth);

  const sweep = Math.max(10, Math.min(360, arc));
  const full = sweep >= 360;
  const showMinMax = props.showMinMax !== undefined ? props.showMinMax : !full;
  const a0 = -toRad(sweep) / 2;
  const a1 = toRad(sweep) / 2;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const t = (v: number) => (max === min ? 0 : (clamp(v) - min) / (max - min));
  const angleOf = (v: number) => a0 + (a1 - a0) * t(v);

  // fit the arc: how far below the centre it reaches depends on the sweep
  const below = full || sweep >= 180 ? Math.max(0, -Math.cos(a1)) : 0;
  // the status / target line sits under an open arc (inside a full ring)
  const hasStatusLine = !!(thresholds && thresholds.length) || target !== undefined;
  const statusBelow = hasStatusLine && !full;
  const footer = (showMinMax ? 18 : 4) + (statusBelow ? 20 : 0);
  const R = Math.max(10, Math.min(width / 2 - 6, (height - footer - 8) / (1 + (full ? 1 : below))));
  const thick = props.thickness || Math.max(6, R * 0.13);
  const rMid = R - thick / 2;
  const cx = width / 2;
  const cy = 6 + R;

  const band = thresholdFor(value, thresholds);
  const color = props.color || (band ? band.color : palette[0]);
  const status = band && band.label;
  const frac = t(value);

  const track = arcLine(cx, cy, rMid, a0, a1);
  const fill = frac > 0 ? arcLine(cx, cy, rMid, a0, a0 + (a1 - a0) * frac) : "";

  // faint threshold bands on the track
  const bands: React.ReactNode[] = [];
  if (thresholds && thresholds.length) {
    const sorted = thresholds.slice().sort((a, b) => a.value - b.value);
    sorted.forEach((th, i) => {
      const from = Math.max(min, th.value);
      const to = i + 1 < sorted.length ? Math.min(max, sorted[i + 1].value) : max;
      if (to <= from) return;
      bands.push(
        <path key={i} d={arcLine(cx, cy, R + 5, angleOf(from) + 0.01, angleOf(to) - 0.01)} fill="none" stroke={th.color} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      );
    });
  }

  let targetMark: React.ReactNode = null;
  if (target !== undefined) {
    const at = angleOf(target);
    const [x0, y0] = polar(cx, cy, R - thick - 3, at);
    const [x1, y1] = polar(cx, cy, R + 3, at);
    targetMark = (
      <g className="tc-fade">
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={tokens.surface} strokeWidth={5} strokeLinecap="round" />
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={tokens.text} strokeWidth={2} strokeLinecap="round" />
      </g>
    );
  }

  const big = Math.max(18, Math.min(44, R * 0.36));
  const small = Math.max(11, Math.min(13, R * 0.12));
  const valueY = full ? cy + big * 0.12 : cy + big * 0.05;
  const pctOfTarget = target ? Math.round((value / target) * 100) : null;
  const summary =
    description ||
    `${label || title || "Value"}: ${formatValue(value)} on a scale of ${formatValue(min)} to ${formatValue(max)}` +
      (target !== undefined ? `, target ${formatValue(target)} (${pctOfTarget}% of target)` : "") +
      (status ? `, ${status}` : "") +
      ".";

  const [mnx, mny] = polar(cx, cy, rMid, a0);
  const [mxx, mxy] = polar(cx, cy, rMid, a1);

  return (
    <div
      ref={ref}
      className={"tc-root tc-gauge" + (animate ? " tc-animate" : "") + (className ? " " + className : "")}
      style={{ color: tokens.text, height, ...style }}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={summary}
      aria-label={title || label || "Gauge"}
    >
      {width > 0 && (
        <svg width={width} height={height} aria-hidden="true" focusable="false">
          <title id={`${id}-t`}>{summary}</title>
          {bands}
          <path d={track} fill="none" stroke={tokens.track} strokeWidth={thick} strokeLinecap={rounded ? "round" : "butt"} />
          {fill && (
            <path
              className="tc-gauge-fill"
              d={fill}
              fill="none"
              stroke={color}
              strokeWidth={thick}
              strokeLinecap={rounded ? "round" : "butt"}
              pathLength={1}
              strokeDasharray="1 1"
            />
          )}
          {targetMark}
          <text x={cx} y={valueY} textAnchor="middle" fontSize={big} fontWeight={650} fill={tokens.text} style={{ letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>
            {formatValue(value)}
          </text>
          {label && (
            <text x={cx} y={valueY + small + 8} textAnchor="middle" fontSize={small} fill={tokens.muted}>
              {label}
            </text>
          )}
          {(status || target !== undefined) && (
            <text x={cx} y={statusBelow ? Math.min(height - 4, cy + R * below + thick / 2 + (showMinMax ? 34 : 18)) : valueY + (label ? 2 : 1) * (small + 8) + 2} textAnchor="middle" fontSize={small} fontWeight={600} fill={status ? color : tokens.muted}>
              {status ? status : ""}
              {status && target !== undefined ? " · " : ""}
              {target !== undefined ? <tspan fill={tokens.muted} fontWeight={400}>{`Target ${formatValue(target)}`}</tspan> : null}
            </text>
          )}
          {showMinMax && (
            <g className="tc-tick" fill={tokens.muted}>
              <text x={mnx} y={mny + thick / 2 + 14} textAnchor="middle">
                {formatValue(min)}
              </text>
              <text x={mxx} y={mxy + thick / 2 + 14} textAnchor="middle">
                {formatValue(max)}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
};

export default Gauge;
