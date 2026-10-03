import React, { useMemo, useState } from "react";
import { linearScale, niceTicks, sqrtRadius, formatCompact, formatFull } from "./scale";
import { num } from "./stack";
import { useContainerWidth } from "./useSize";
import { getTheme, navKey, SrTable, Tooltip, useChartId, useHiddenSeries } from "./shared";
import { collectReferenceLines } from "./ReferenceLine";
import Legend from "./Legend";
import type { ScatterChartProps } from "./types";

/**
 * Two numeric measures per record, optionally a third as bubble area and a
 * category as colour. Supports quadrant splits and reference lines.
 */
const ScatterChart = (props: ScatterChartProps) => {
  const {
    data,
    xKey,
    yKey,
    sizeKey,
    groupKey,
    labelKey,
    width: fixedWidth,
    height = 320,
    theme = "light",
    showGrid = true,
    showTooltip = true,
    animate = true,
    pointRadius = 5,
    sizeRange = [4, 24],
    xTickCount = 6,
    yTickCount = 5,
    legendToggle = true,
    quadrants,
    title,
    description,
    className,
    style,
    onHover,
  } = props;
  const { tokens, palette } = getTheme(theme, props.colors);
  const formatX = props.formatX || formatCompact;
  const formatY = props.formatY || formatCompact;
  const formatSize = props.formatSize || formatFull;
  const xLabel = props.xLabel || xKey;
  const yLabel = props.yLabel || yKey;
  const sizeLabel = props.sizeLabel || sizeKey || "";
  const fillOpacity = props.fillOpacity !== undefined ? props.fillOpacity : sizeKey ? 0.55 : 0.75;
  const refLines = collectReferenceLines(props.referenceLines, props.children);

  const id = useChartId("tcx");
  const { ref, width } = useContainerWidth(fixedWidth);
  const [active, setActive] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  // groups, in order of first appearance
  const groups = useMemo(() => {
    const out: string[] = [];
    if (groupKey) data.forEach((d) => {
      const g = String(d[groupKey]);
      if (out.indexOf(g) < 0) out.push(g);
    });
    return out;
  }, [data, groupKey]);
  const colorOf = (g: string) => palette[Math.max(0, groups.indexOf(g)) % palette.length];
  const [hidden, toggle] = useHiddenSeries(groups, props.defaultHiddenSeries, props.hiddenSeries, props.onLegendToggle);
  const showLegend = props.showLegend !== undefined ? props.showLegend : groups.length > 1;

  // points sorted by x, so arrow keys walk left to right
  const points = data
    .map((d, i) => ({ d, i, x: num(d[xKey]), y: num(d[yKey]), s: sizeKey ? num(d[sizeKey]) : 0, g: groupKey ? String(d[groupKey]) : "" }))
    .filter((p) => !groupKey || hidden.indexOf(p.g) < 0)
    .sort((a, b) => a.x - b.x || a.y - b.y);
  const n = points.length;

  const ext = (vals: number[], extra: number[]): [number, number] => {
    const all = vals.concat(extra);
    if (!all.length) return [0, 1];
    return [Math.min.apply(null, all), Math.max.apply(null, all)];
  };
  const xExtra: number[] = [];
  const yExtra: number[] = [];
  refLines.forEach((r) => {
    if (typeof r.x === "number") xExtra.push(r.x);
    if (r.y !== undefined) yExtra.push(r.y);
  });
  if (quadrants) {
    xExtra.push(quadrants.x);
    yExtra.push(quadrants.y);
  }
  const [xlo, xhi] = props.xDomain || ext(points.map((p) => p.x), xExtra);
  const [ylo, yhi] = props.yDomain || ext(points.map((p) => p.y), yExtra);
  const xNice = props.xDomain ? { domain: props.xDomain, ticks: niceTicks(xlo, xhi, xTickCount).ticks.filter((t) => t >= xlo && t <= xhi) } : niceTicks(xlo, xhi, xTickCount);
  const yNice = props.yDomain ? { domain: props.yDomain, ticks: niceTicks(ylo, yhi, yTickCount).ticks.filter((t) => t >= ylo && t <= yhi) } : niceTicks(ylo, yhi, yTickCount);
  const yLabels = yNice.ticks.map(formatY);
  const longest = yLabels.reduce((m, l) => Math.max(m, l.length), 0);

  const margin = { top: 12, right: 16, bottom: 46, left: Math.round(longest * 6.6 + 30) };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);
  const maxSize = sizeKey ? Math.max.apply(null, data.map((d) => num(d[sizeKey])).concat([0])) : 0;
  const rOf = sizeKey ? sqrtRadius(maxSize, sizeRange) : () => pointRadius;
  // inset by part of the largest bubble so edge bubbles are not cut by the axes
  const inset = Math.min(sizeKey ? sizeRange[1] * 0.6 : pointRadius + 2, 18);
  const x = linearScale(xNice.domain, [inset, innerW - inset]);
  // leave a lane for quadrant labels so bubbles never sit under them
  const lane = quadrants && quadrants.labels ? 20 : 0;
  const y = linearScale(yNice.domain, [innerH - inset - lane, inset + lane]);

  const setIndex = (i: number | null) => {
    if (i === active) return;
    setActive(i);
    if (onHover) onHover(i === null ? null : points[i].i, i === null ? null : points[i].d);
  };
  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    let best = -1;
    let bestD = Infinity;
    points.forEach((p, i) => {
      const dx = x(p.x) - px;
      const dy = y(p.y) - py;
      const dist = Math.sqrt(dx * dx + dy * dy) - rOf(p.s);
      if (dist < bestD) {
        bestD = dist;
        best = i;
      }
    });
    setIndex(best >= 0 && bestD < 28 ? best : null);
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    const next = navKey(e.key, active, n);
    if (next === undefined) return;
    e.preventDefault();
    setIndex(next);
  };

  // ----- marks: largest bubbles first so small ones stay on top -----
  const order = points.map((_, i) => i).sort((a, b) => points[b].s - points[a].s);
  const marks = order.map((i) => {
    const p = points[i];
    const c = groupKey ? colorOf(p.g) : palette[0];
    const dim = (active !== null && active !== i) || (highlight !== null && highlight !== p.g);
    return (
      <circle
        key={p.i}
        className="tc-dot tc-pt"
        cx={x(p.x)}
        cy={y(p.y)}
        r={rOf(p.s)}
        fill={c}
        fillOpacity={dim ? fillOpacity * 0.4 : fillOpacity}
        stroke={c}
        strokeOpacity={dim ? 0.35 : 1}
        strokeWidth={1.25}
        style={{ animationDelay: animate ? `${Math.min(i * 14, 360)}ms` : undefined }}
      />
    );
  });

  const guides: React.ReactNode[] = [];
  const quadLabels: React.ReactNode[] = [];
  if (quadrants) {
    const qx = x(quadrants.x);
    const qy = y(quadrants.y);
    guides.push(
      <line key="qx" x1={qx} x2={qx} y1={0} y2={innerH} stroke={tokens.reference} strokeWidth={1} strokeDasharray="4 4" shapeRendering="crispEdges" />,
      <line key="qy" x1={0} x2={innerW} y1={qy} y2={qy} stroke={tokens.reference} strokeWidth={1} strokeDasharray="4 4" shapeRendering="crispEdges" />
    );
    if (quadrants.labels) {
      const [tr, tl, bl, br] = quadrants.labels;
      const L = (key: string, t: string, xx: number, yy: number, anchor: "start" | "end") => (
        <text key={key} className="tc-quad" x={xx} y={yy} textAnchor={anchor} fill={tokens.muted} stroke={tokens.surface}>
          {t}
        </text>
      );
      quadLabels.push(L("tr", tr, innerW - 6, 14, "end"), L("tl", tl, 6, 14, "start"), L("bl", bl, 6, innerH - 6, "start"), L("br", br, innerW - 6, innerH - 6, "end"));
    }
  }
  refLines.forEach((r, k) => {
    const color = r.color || tokens.reference;
    const dash = r.dashed === false ? undefined : "4 4";
    if (r.y !== undefined) {
      const yy = y(r.y);
      guides.push(
        <g key={"ry" + k}>
          <line x1={0} x2={innerW} y1={yy} y2={yy} stroke={color} strokeDasharray={dash} strokeWidth={r.strokeWidth || 1} shapeRendering="crispEdges" />
          {r.label && (
            <text className="tc-ref-label" x={r.labelPosition === "start" ? 4 : innerW - 4} y={yy - 6} textAnchor={r.labelPosition === "start" ? "start" : "end"} fill={color} stroke={tokens.surface}>
              {r.label}
            </text>
          )}
        </g>
      );
    } else if (typeof r.x === "number") {
      const xx = x(r.x);
      guides.push(
        <g key={"rx" + k}>
          <line x1={xx} x2={xx} y1={0} y2={innerH} stroke={color} strokeDasharray={dash} strokeWidth={r.strokeWidth || 1} shapeRendering="crispEdges" />
          {r.label && (
            <text className="tc-ref-label" x={xx + 6} y={10} fill={color} stroke={tokens.surface}>
              {r.label}
            </text>
          )}
        </g>
      );
    }
  });

  let tip: React.ReactNode = null;
  const focus: React.ReactNode[] = [];
  if (active !== null && points[active]) {
    const p = points[active];
    const px = x(p.x);
    const py = y(p.y);
    const pr = rOf(p.s);
    const c = groupKey ? colorOf(p.g) : palette[0];
    focus.push(
      <line key="fx" x1={px} x2={px} y1={py + pr} y2={innerH} stroke={tokens.crosshair} strokeDasharray="2 3" />,
      <line key="fy" x1={0} x2={px - pr} y1={py} y2={py} stroke={tokens.crosshair} strokeDasharray="2 3" />,
      <circle key="fr" cx={px} cy={py} r={pr + 3} fill="none" stroke={c} strokeWidth={2} />
    );
    if (showTooltip) {
      const flip = margin.left + px + pr + 200 > width;
      const rows = [
        { key: "x", label: xLabel, value: formatX(p.x) },
        { key: "y", label: yLabel, value: formatY(p.y) },
      ];
      if (sizeKey) rows.push({ key: "s", label: sizeLabel, value: formatSize(p.s) });
      tip = (
        <Tooltip
          x={margin.left + px + (flip ? -(pr + 10) : pr + 10)}
          y={Math.max(0, margin.top + py - 30)}
          flip={flip}
          tokens={tokens}
          title={
            <span className="tc-tooltip-head">
              <span className="tc-key tc-key-circle" style={{ background: c }} />
              {labelKey ? String(p.d[labelKey]) : groupKey ? p.g : `Point ${active + 1}`}
              {labelKey && groupKey && <span style={{ color: tokens.muted, fontWeight: 400 }}> · {p.g}</span>}
            </span>
          }
          rows={rows}
        />
      );
    }
  }

  const summary =
    description ||
    `Scatter chart of ${yLabel} against ${xLabel}${sizeKey ? `, bubble size ${sizeLabel}` : ""}${groupKey ? `, grouped by ${groupKey}` : ""}; ${n} points.`;

  return (
    <div
      ref={ref}
      className={"tc-root" + (animate ? " tc-animate" : "") + (className ? " " + className : "")}
      style={{ color: tokens.text, ...style }}
      tabIndex={0}
      onKeyDown={handleKey}
      onBlur={(e) => {
        if (e.target === e.currentTarget) setIndex(null);
      }}
      aria-roledescription="chart"
      aria-label={title || summary}
    >
      {showLegend && (
        <Legend
          items={groups.map((g) => ({ key: g, label: g, color: colorOf(g) }))}
          hidden={hidden}
          onToggle={legendToggle ? toggle : undefined}
          onHighlight={setHighlight}
          marker="circle"
          theme={theme}
        />
      )}
      <div style={{ position: "relative", height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-labelledby={`${id}-t`}>
            <title id={`${id}-t`}>{title ? `${title}. ${summary}` : summary}</title>
            <g transform={`translate(${margin.left},${margin.top})`}>
              <g aria-hidden="true">
                {yNice.ticks.map((t, i) => (
                  <g key={"y" + t} transform={`translate(0,${y(t)})`}>
                    {showGrid && <line x1={0} x2={innerW} stroke={tokens.grid} shapeRendering="crispEdges" />}
                    <text className="tc-tick" x={-10} dy="0.32em" textAnchor="end" fill={tokens.muted}>
                      {yLabels[i]}
                    </text>
                  </g>
                ))}
                {xNice.ticks.map((t) => (
                  <g key={"x" + t} transform={`translate(${x(t)},0)`}>
                    {showGrid && <line y1={0} y2={innerH} stroke={tokens.grid} shapeRendering="crispEdges" />}
                    <text className="tc-tick" y={innerH + 18} textAnchor="middle" fill={tokens.muted}>
                      {formatX(t)}
                    </text>
                  </g>
                ))}
                <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke={tokens.axis} shapeRendering="crispEdges" />
                <text className="tc-axis-title" x={innerW / 2} y={innerH + 40} textAnchor="middle" fill={tokens.muted}>
                  {xLabel}
                </text>
                <text className="tc-axis-title" transform={`translate(${-margin.left + 12},${innerH / 2}) rotate(-90)`} textAnchor="middle" fill={tokens.muted}>
                  {yLabel}
                </text>
                {guides}
              </g>
              <g aria-hidden="true">{marks}</g>
              <g aria-hidden="true">{quadLabels}</g>
              <g aria-hidden="true">{focus}</g>
              <rect
                x={0}
                y={0}
                width={innerW}
                height={innerH}
                fill="transparent"
                onPointerMove={handleMove}
                onPointerDown={handleMove}
                onPointerLeave={() => setIndex(null)}
                style={{ cursor: "crosshair", touchAction: "pan-y" }}
              />
            </g>
          </svg>
        )}
        {tip}
      </div>
      <SrTable
        caption={title || summary}
        columns={[labelKey || "Point"].concat(groupKey ? [groupKey] : [], [xLabel, yLabel], sizeKey ? [sizeLabel] : [])}
        rows={points.map((p, i) =>
          [labelKey ? String(p.d[labelKey]) : String(i + 1)].concat(groupKey ? [p.g] : [], [formatX(p.x), formatY(p.y)], sizeKey ? [formatSize(p.s)] : [])
        )}
      />
    </div>
  );
};

export default ScatterChart;
