import React, { useState } from "react";
import { linearScale, formatFull } from "./scale";
import { areaPath, curvePath, roundedBar, Point } from "./curve";
import { num } from "./stack";
import { useContainerWidth } from "./useSize";
import { getTheme, navKey, SrTable, useChartId } from "./shared";
import type { SparklineProps } from "./types";

type MarkerKind = "min" | "max" | "first" | "last";

/**
 * A word-sized chart: no axes, no grid, just the shape of a series with
 * optional min / max / last markers. Built for KPI cards and table cells.
 */
const Sparkline = (props: SparklineProps) => {
  const {
    data,
    valueKey = "value",
    xKey,
    type = "line",
    width: fixedWidth,
    height = 36,
    theme = "light",
    smooth = true,
    strokeWidth = 1.75,
    showTooltip = true,
    animate = true,
    referenceValue,
    title,
    description,
    className,
    style,
    onHover,
  } = props;
  const { tokens, palette } = getTheme(theme);
  const color = props.color || palette[0];
  const negativeColor = props.negativeColor || palette[7];
  const formatValue = props.formatValue || formatFull;
  const formatX = props.formatX || ((v: any, i: number) => (v === undefined ? `#${i + 1}` : String(v)));
  const markerList: MarkerKind[] =
    props.markers === true ? ["min", "max", "last"] : props.markers === false ? [] : props.markers || ["last"];

  const id = useChartId("tcs");
  const { ref, width } = useContainerWidth(fixedWidth);
  const [active, setActive] = useState<number | null>(null);

  const values = data.map((d) => (typeof d === "number" ? d : num(d[valueKey])));
  const labels = data.map((d, i) => formatX(typeof d === "number" || !xKey ? undefined : d[xKey], i));
  const n = values.length;

  let lo = Math.min.apply(null, values.length ? values : [0]);
  let hi = Math.max.apply(null, values.length ? values : [1]);
  if (referenceValue !== undefined) {
    lo = Math.min(lo, referenceValue);
    hi = Math.max(hi, referenceValue);
  }
  if (type === "bar") {
    lo = Math.min(0, lo);
    hi = Math.max(0, hi);
  }
  if (props.yDomain) {
    lo = props.yDomain[0];
    hi = props.yDomain[1];
  }
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }

  // inset so markers and the stroke never clip at the edges
  const pad = type === "bar" ? 1 : 4;
  const y = linearScale([lo, hi], [height - pad, pad]);
  const band = n ? (width - (type === "bar" ? 0 : 2 * pad)) / n : 0;
  const xAt = (i: number) => (type === "bar" ? band * (i + 0.5) : n > 1 ? pad + ((width - 2 * pad) * i) / (n - 1) : width / 2);

  const iMin = values.indexOf(Math.min.apply(null, values));
  const iMax = values.indexOf(Math.max.apply(null, values));
  const marked: Record<number, MarkerKind> = {};
  markerList.forEach((m) => {
    const i = m === "min" ? iMin : m === "max" ? iMax : m === "first" ? 0 : n - 1;
    if (i >= 0 && n) marked[i] = m;
  });

  const setIndex = (i: number | null) => {
    if (i === active) return;
    setActive(i);
    if (onHover) onHover(i, i === null ? null : values[i]);
  };
  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!n) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = type === "bar" ? Math.floor(px / band) : Math.round(((px - pad) / Math.max(1, width - 2 * pad)) * (n - 1));
    setIndex(Math.max(0, Math.min(n - 1, i)));
  };
  const handleKey = (e: React.KeyboardEvent) => {
    const next = navKey(e.key, active, n);
    if (next === undefined) return;
    e.preventDefault();
    setIndex(next);
  };

  const marks: React.ReactNode[] = [];
  const pts: Point[] = values.map((v, i) => [xAt(i), y(v)]);
  const baseY = y(Math.max(lo, Math.min(hi, type === "bar" ? 0 : lo)));
  if (type === "bar") {
    const w = Math.max(1, Math.min(band * 0.7, 14));
    const zero = y(Math.max(lo, Math.min(hi, 0)));
    values.forEach((v, i) => {
      const up = v >= 0;
      const top = up ? y(v) : zero;
      const h = Math.abs(y(v) - zero);
      const emph = marked[i] !== undefined || active === i;
      const below = referenceValue !== undefined ? v < referenceValue : v < 0;
      marks.push(
        <path
          key={i}
          className={"tc-bar" + (up ? "" : " tc-neg")}
          d={roundedBar(xAt(i) - w / 2, top, w, Math.max(h, 1), 1.5, up)}
          fill={below ? negativeColor : color}
          opacity={active !== null ? (active === i ? 1 : 0.35) : emph || !markerList.length ? 1 : 0.5}
          style={{ animationDelay: animate ? `${Math.min(i * 18, 300)}ms` : undefined, transition: "opacity 120ms" }}
        />
      );
    });
  } else {
    if (type === "area") {
      const gid = `${id}-fill`;
      marks.push(
        <defs key="defs">
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
      );
      marks.push(<path key="area" d={areaPath(pts, pts.map((p) => [p[0], baseY] as Point), smooth)} fill={`url(#${gid})`} />);
    }
    marks.push(
      <path key="line" d={curvePath(pts, smooth)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    );
  }

  const dots: React.ReactNode[] = [];
  if (type !== "bar") {
    Object.keys(marked).forEach((k) => {
      const i = +k;
      const m = marked[i];
      const c = m === "min" ? negativeColor : color;
      dots.push(
        <circle key={"m" + i} className="tc-fade" cx={pts[i][0]} cy={pts[i][1]} r={m === "last" ? 3 : 2.5} fill={c} stroke={tokens.surface} strokeWidth={1.5} />
      );
    });
    if (active !== null) {
      dots.push(<line key="xh" x1={pts[active][0]} x2={pts[active][0]} y1={0} y2={height} stroke={tokens.crosshair} strokeWidth={1} />);
      dots.push(<circle key="act" cx={pts[active][0]} cy={pts[active][1]} r={3.5} fill={color} stroke={tokens.surface} strokeWidth={1.5} />);
    }
  }

  const first = values[0];
  const last = values[n - 1];
  const summary =
    description ||
    (n
      ? `Sparkline of ${n} values, from ${formatValue(first)} to ${formatValue(last)}; low ${formatValue(values[iMin])}, high ${formatValue(values[iMax])}.`
      : "Empty sparkline.");

  let tip: React.ReactNode = null;
  if (showTooltip && active !== null) {
    const x = xAt(active);
    const flip = x > width / 2;
    tip = (
      <div
        className="tc-tooltip tc-tooltip-sm"
        role="presentation"
        style={{
          transform: `translate(${flip ? x - 8 : x + 8}px, ${-6}px) translateY(-100%)${flip ? " translateX(-100%)" : ""}`,
          background: tokens.tooltipBg,
          border: `1px solid ${tokens.tooltipBorder}`,
          color: tokens.tooltipText,
        }}
      >
        <span className="tc-tooltip-label">{labels[active]}</span> <strong>{formatValue(values[active])}</strong>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={"tc-root tc-spark" + (animate ? " tc-animate" : "") + (className ? " " + className : "")}
      style={{ height, width: fixedWidth, color: tokens.text, ...style }}
      tabIndex={0}
      onKeyDown={handleKey}
      onBlur={() => setIndex(null)}
      aria-roledescription="sparkline"
      aria-label={title ? `${title}. ${summary}` : summary}
    >
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={title || summary}>
          {referenceValue !== undefined && (
            <line x1={0} x2={width} y1={y(referenceValue)} y2={y(referenceValue)} stroke={tokens.reference} strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
          )}
          <g className={type === "bar" ? undefined : "tc-reveal"} aria-hidden="true">
            {marks}
          </g>
          <g aria-hidden="true">{dots}</g>
          <rect x={0} y={0} width={width} height={height} fill="transparent" onPointerMove={handleMove} onPointerDown={handleMove} onPointerLeave={() => setIndex(null)} />
        </svg>
      )}
      {tip}
      <SrTable caption={title || "Sparkline"} columns={["Point", "Value"]} rows={values.map((v, i) => [labels[i], formatValue(v)])} />
    </div>
  );
};

export default Sparkline;
