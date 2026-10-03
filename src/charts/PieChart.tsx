import React, { useState } from "react";
import { arcPath, pieLayout, polar, toRad } from "./arc";
import { formatFull } from "./scale";
import { num } from "./stack";
import { useContainerWidth } from "./useSize";
import { getTheme, navKey, SrTable, Tooltip, useChartId, useHiddenSeries } from "./shared";
import Legend from "./Legend";
import type { PieChartProps } from "./types";

const pct = (v: number, total: number) => {
  if (!total) return "0%";
  const p = (v / total) * 100;
  return (p < 10 && p % 1 !== 0 ? p.toFixed(1) : Math.round(p).toString()) + "%";
};

/** Engine for PieChart and DonutChart. */
export function RadialPart(props: PieChartProps & { variant: "pie" | "donut" }) {
  const {
    variant,
    data,
    nameKey,
    valueKey,
    width: fixedWidth,
    height = 240,
    theme = "light",
    showTooltip = variant === "pie",
    animate = true,
    cornerRadius = 0,
    startAngle = 0,
    endAngle = 360,
    popOut = 6,
    showLegend = true,
    legendPosition = "auto",
    legendValue = "percent",
    legendToggle = true,
    sort = false,
    title,
    description,
    className,
    style,
    onHover,
  } = props;
  const innerRatio = Math.max(0, Math.min(0.95, props.innerRadius !== undefined ? props.innerRadius : variant === "donut" ? 0.64 : 0));
  const padAngle = props.padAngle !== undefined ? props.padAngle : innerRatio > 0 ? 1.6 : 1;
  const { tokens, palette } = getTheme(theme, props.colors);
  const formatValue = props.formatValue || ((v: number) => formatFull(v));

  const id = useChartId("tcp");
  const { ref, width } = useContainerWidth(fixedWidth);
  const [active, setActive] = useState<number | null>(null);

  // colour by original position so sorting / hiding never recolours a segment
  const items = data.map((d, i) => ({
    key: String(d[nameKey]),
    name: String(d[nameKey]),
    value: Math.max(0, num(d[valueKey])),
    color: (d.color as string) || palette[i % palette.length],
    datum: d,
  }));
  const ordered = sort ? items.slice().sort((a, b) => b.value - a.value) : items;
  const [hidden, toggle] = useHiddenSeries(
    items.map((it) => it.key),
    props.defaultHiddenSeries,
    props.hiddenSeries,
    props.onLegendToggle
  );
  const visible = ordered.filter((it) => hidden.indexOf(it.key) < 0);
  const total = visible.reduce((a, it) => a + it.value, 0);
  const slices = pieLayout(
    visible.map((it) => it.value),
    toRad(startAngle),
    toRad(endAngle)
  );

  // ----- layout: legend beside the chart when there is room -----
  const side = legendPosition === "right" || (legendPosition === "auto" && width >= 440);
  const legendW = showLegend && side ? Math.min(220, Math.max(150, width * 0.38)) : 0;
  const room = Math.max(0, width - legendW - (legendW ? 32 : 0));
  // beside a legend, keep the plot about as wide as the circle so the two read as one unit
  const plotW = side && showLegend ? Math.min(room, height + 2 * popOut + 8) : room;
  const sweep = Math.abs(endAngle - startAngle);
  const half = sweep <= 180 + 1e-6;
  // a half donut only needs half the height
  const R = Math.max(0, Math.min(plotW / 2, half ? height - 12 : height / 2) - popOut - 2);
  const r = R * innerRatio;
  const cx = plotW / 2;
  const cy = half ? height - 6 : height / 2;
  const padWidth = toRad(padAngle) * ((R + r) / 2);
  const corner = Math.min(cornerRadius, (R - r) / 2);

  const setIndex = (i: number | null) => {
    if (i === active) return;
    setActive(i);
    if (onHover) onHover(i, i === null ? null : visible[i].datum);
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    const next = navKey(e.key, active, visible.length, true);
    if (next === undefined) return;
    e.preventDefault();
    setIndex(next);
  };

  const segs = slices.map((s, i) => {
    const it = visible[i];
    const mid = (s.startAngle + s.endAngle) / 2;
    const isActive = active === i;
    const [dx, dy] = polar(0, 0, isActive ? popOut : 0, mid);
    const d = arcPath({ cx, cy, innerRadius: r, outerRadius: R, startAngle: s.startAngle, endAngle: s.endAngle, padWidth, cornerRadius: corner });
    if (!d) return null;
    return (
      <path
        key={it.key}
        className="tc-seg"
        d={d}
        fill={it.color}
        opacity={active !== null && !isActive ? 0.55 : 1}
        style={{ transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` }}
        onPointerEnter={() => setIndex(i)}
        onPointerDown={() => setIndex(i)}
      />
    );
  });

  // ----- centre label (donut) -----
  const act = active !== null ? visible[active] : null;
  let center: React.ReactNode = null;
  if (r > 24) {
    const big = Math.max(14, Math.min(34, r * 0.36));
    const small = Math.max(11, Math.min(13, r * 0.16));
    const vY = half ? cy - big * 0.35 : cy + big * 0.12;
    center = (
      <g className="tc-center" aria-hidden="true">
        <text x={cx} y={vY - big * 0.78} textAnchor="middle" fontSize={small} fill={tokens.muted}>
          {act ? (half ? `${act.name} · ${pct(act.value, total)}` : act.name) : props.centerLabel !== undefined ? props.centerLabel : "Total"}
        </text>
        <text x={cx} y={vY + big * 0.22} textAnchor="middle" fontSize={big} fontWeight={650} fill={tokens.text} style={{ letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
          {act ? formatValue(act.value, act.name) : props.centerValue !== undefined ? props.centerValue : formatValue(total, "Total")}
        </text>
        {act && !half && (
          <text x={cx} y={vY + big * 0.22 + small + 6} textAnchor="middle" fontSize={small} fill={act.color} fontWeight={600}>
            {pct(act.value, total)}
          </text>
        )}
      </g>
    );
  }

  let tip: React.ReactNode = null;
  if (showTooltip && act && active !== null) {
    const s = slices[active];
    const mid = (s.startAngle + s.endAngle) / 2;
    const [px, py] = polar(cx, cy, R * 0.72 + popOut, mid);
    const flip = px > plotW * 0.55;
    tip = (
      <Tooltip
        x={flip ? px - 10 : px + 10}
        y={Math.max(0, py - 20)}
        flip={flip}
        tokens={tokens}
        title={act.name}
        rows={[
          { key: "v", label: "Value", value: formatValue(act.value, act.name), color: act.color },
          { key: "p", label: "Share", value: pct(act.value, total) },
        ]}
      />
    );
  }

  const name = variant === "donut" ? "Donut" : "Pie";
  const summary =
    description ||
    `${name} chart of ${valueKey} by ${nameKey}: ${visible
      .map((it) => `${it.name} ${pct(it.value, total)}`)
      .join(", ")}.`;

  const legendItems = ordered.map((it) => ({
    key: it.key,
    label: it.name,
    color: it.color,
    value:
      legendValue === "none"
        ? undefined
        : hidden.indexOf(it.key) >= 0
        ? "–"
        : legendValue === "value"
        ? formatValue(it.value, it.name)
        : legendValue === "both"
        ? `${formatValue(it.value, it.name)} · ${pct(it.value, total)}`
        : pct(it.value, total),
  }));

  return (
    <div
      ref={ref}
      className={"tc-root tc-pie" + (animate ? " tc-animate" : "") + (className ? " " + className : "")}
      style={{ color: tokens.text, ...style }}
      tabIndex={0}
      onKeyDown={handleKey}
      onBlur={(e) => {
        if (e.target === e.currentTarget) setIndex(null);
      }}
      aria-roledescription="chart"
      aria-label={title || summary}
    >
      <div className={"tc-pie-body" + (side ? " tc-pie-side" : "")}>
        <div style={{ position: "relative", height, width: side ? plotW : "100%", flex: "none" }} onPointerLeave={() => setIndex(null)}>
          {width > 0 && (
            <svg width={plotW} height={height} role="img" aria-labelledby={`${id}-t`}>
              <title id={`${id}-t`}>{title ? `${title}. ${summary}` : summary}</title>
              <g className="tc-pop" aria-hidden="true">
                {segs}
              </g>
              {center}
            </svg>
          )}
          {tip}
        </div>
        {showLegend && (
          <Legend
            items={legendItems}
            hidden={hidden}
            onToggle={legendToggle ? toggle : undefined}
            onHighlight={(k) => {
              let idx: number | null = null;
              visible.forEach((it, i) => {
                if (it.key === k) idx = i;
              });
              setIndex(idx);
            }}
            layout={side ? "column" : "row"}
            marker="circle"
            theme={theme}
            style={side ? { width: legendW, margin: 0 } : { margin: "12px 0 0", justifyContent: "center" }}
          />
        )}
      </div>
      <SrTable
        caption={title || summary}
        columns={[nameKey, valueKey, "Share"]}
        rows={visible.map((it) => [it.name, formatValue(it.value, it.name), pct(it.value, total)])}
      />
    </div>
  );
}

/** Parts of a whole as slices of a circle. Prefer a donut or bars past ~6 segments. */
const PieChart = (props: PieChartProps) => <RadialPart {...props} variant="pie" />;

export default PieChart;
