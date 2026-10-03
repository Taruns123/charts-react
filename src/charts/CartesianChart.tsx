import React, { useEffect, useMemo, useRef, useState } from "react";
import { darkPalette, lightPalette, themes } from "./palette";
import { linearScale, niceTicks, formatCompact, formatFull } from "./scale";
import { areaPath, curvePath, roundedBar, Point } from "./curve";
import { useContainerWidth } from "./useSize";
import { injectStyles } from "./styles";
import type { AreaChartProps, BarChartProps, Datum, LineChartProps, SeriesConfig } from "./types";

type Kind = "line" | "area" | "bar";

export type CartesianProps = LineChartProps & AreaChartProps & BarChartProps & { kind: Kind };

interface ResolvedSeries {
  key: string;
  label: string;
  color: string;
}

let uid = 0;

function resolveSeries(data: Datum[], xKey: string, series: Array<string | SeriesConfig> | undefined, palette: string[]): ResolvedSeries[] {
  let list: SeriesConfig[];
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
  }));
}

function num(v: any): number {
  const n = typeof v === "number" ? v : parseFloat(v);
  return isFinite(n) ? n : 0;
}

export default function CartesianChart(props: CartesianProps) {
  const {
    kind,
    data,
    xKey,
    width: fixedWidth,
    height = 280,
    theme = "light",
    showGrid = true,
    showTooltip = true,
    showCrosshair = true,
    animate = true,
    yTickCount = 5,
    smooth = false,
    strokeWidth = 2,
    showDots = false,
    showEndDot = true,
    zeroBaseline = true,
    gradient = true,
    stacked = false,
    radius = 4,
    maxBarWidth = 28,
    title,
    description,
    className,
    style,
    onHover,
  } = props;

  const tokens = themes[theme] || themes.light;
  const palette = props.colors && props.colors.length ? props.colors : theme === "dark" ? darkPalette : lightPalette;
  const series = useMemo(() => resolveSeries(data, xKey, props.series, palette), [data, xKey, props.series, palette]);
  const showLegend = props.showLegend !== undefined ? props.showLegend : series.length > 1;
  const formatX = props.formatX || ((v: any) => String(v));
  const formatY = props.formatY || formatCompact;
  const formatValue = props.formatValue || ((v: number) => formatFull(v));

  const { ref, width } = useContainerWidth(fixedWidth);
  const [active, setActive] = useState<number | null>(null);
  const [pointerY, setPointerY] = useState(0);
  const idRef = useRef<string>("");
  if (!idRef.current) idRef.current = "tc" + ++uid;
  const id = idRef.current;

  useEffect(() => {
    injectStyles();
  }, []);

  const isStacked = stacked && kind !== "line";
  const n = data.length;

  // ----- y domain -----
  const stacks = useMemo(() => {
    // per index cumulative values (only used when stacked)
    return data.map((d) => {
      let pos = 0;
      let neg = 0;
      return series.map((s) => {
        const v = num(d[s.key]);
        if (v >= 0) {
          const r: [number, number] = [pos, pos + v];
          pos += v;
          return r;
        }
        const r: [number, number] = [neg, neg + v];
        neg += v;
        return r;
      });
    });
  }, [data, series]);

  let lo = Infinity;
  let hi = -Infinity;
  data.forEach((d, i) => {
    series.forEach((s, j) => {
      if (isStacked) {
        lo = Math.min(lo, stacks[i][j][0], stacks[i][j][1]);
        hi = Math.max(hi, stacks[i][j][0], stacks[i][j][1]);
      } else {
        const v = num(d[s.key]);
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    });
  });
  if (!isFinite(lo)) {
    lo = 0;
    hi = 1;
  }
  if (kind !== "line" || zeroBaseline) {
    lo = Math.min(0, lo);
    hi = Math.max(0, hi);
  }
  const nice = props.yDomain ? { domain: props.yDomain, ticks: niceTicks(props.yDomain[0], props.yDomain[1], yTickCount).ticks.filter((t) => t >= props.yDomain![0] && t <= props.yDomain![1]) } : niceTicks(lo, hi, yTickCount);
  const yLabels = nice.ticks.map((t) => formatY(t));
  const longest = yLabels.reduce((m, l) => Math.max(m, l.length), 0);

  // ----- layout -----
  const margin = { top: 10, right: kind === "bar" ? 4 : 12, bottom: 30, left: Math.round(longest * 6.6 + 14) };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);
  const y = linearScale(nice.domain, [innerH, 0]);
  const band = n ? innerW / n : innerW;
  const xAt = (i: number) => (kind === "bar" ? band * (i + 0.5) : n > 1 ? (innerW * i) / (n - 1) : innerW / 2);

  // x tick thinning: keep labels roughly >= 72px apart
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 72))));

  // ----- hover -----
  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!n) return;
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    let idx: number;
    if (kind === "bar") idx = Math.floor(px / band);
    else idx = n > 1 ? Math.round((px / innerW) * (n - 1)) : 0;
    idx = Math.max(0, Math.min(n - 1, idx));
    setPointerY(e.clientY - rect.top);
    if (idx !== active) {
      setActive(idx);
      if (onHover) onHover(idx, data[idx]);
    }
  };
  const clear = () => {
    setActive(null);
    if (onHover) onHover(null, null);
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if (!n) return;
    let next: number | null = active;
    if (e.key === "ArrowRight") next = active === null ? 0 : Math.min(n - 1, active + 1);
    else if (e.key === "ArrowLeft") next = active === null ? n - 1 : Math.max(0, active - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Escape") next = null;
    else return;
    e.preventDefault();
    setPointerY(innerH * 0.3);
    setActive(next);
    if (onHover) onHover(next, next === null ? null : data[next]);
  };

  // ----- marks -----
  const marks: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  const baseY = y(Math.max(nice.domain[0], Math.min(nice.domain[1], 0)));

  if (kind === "line" || kind === "area") {
    const pointsFor = (j: number, which: 0 | 1): Point[] =>
      data.map((d, i) => [xAt(i), y(isStacked ? stacks[i][j][which] : which === 0 ? 0 : num(d[series[j].key]))]);
    // overlapping (unstacked) areas get a lighter wash so lower series stay visible
    const overlapping = !isStacked && series.length > 1;
    const fillTop = props.fillOpacity !== undefined ? props.fillOpacity : gradient ? (overlapping ? 0.16 : 0.28) : overlapping ? 0.08 : 0.12;

    // draw areas first (back to front), then lines on top
    if (kind === "area") {
      series.forEach((s, j) => {
        const top = pointsFor(j, 1);
        const bottom = isStacked ? pointsFor(j, 0) : data.map((_, i) => [xAt(i), baseY] as Point);
        const gid = `${id}-g${j}`;
        if (gradient) {
          defs.push(
            <linearGradient key={gid} id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={fillTop} />
              <stop offset="100%" stopColor={s.color} stopOpacity={isStacked ? fillTop * 0.45 : 0.02} />
            </linearGradient>
          );
        }
        marks.push(
          <path
            key={`a-${s.key}`}
            d={areaPath(top, bottom, smooth)}
            fill={gradient ? `url(#${gid})` : s.color}
            fillOpacity={gradient ? 1 : fillTop}
          />
        );
      });
    }
    series.forEach((s, j) => {
      const pts = pointsFor(j, 1);
      marks.push(
        <path
          key={`l-${s.key}`}
          d={curvePath(pts, smooth)}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
      if (showDots) {
        pts.forEach((p, i) =>
          marks.push(<circle key={`d-${s.key}-${i}`} cx={p[0]} cy={p[1]} r={3.5} fill={s.color} stroke={tokens.surface} strokeWidth={2} />)
        );
      } else if (showEndDot && kind === "line" && pts.length) {
        const p = pts[pts.length - 1];
        marks.push(<circle key={`e-${s.key}`} cx={p[0]} cy={p[1]} r={4} fill={s.color} stroke={tokens.surface} strokeWidth={2} />);
      }
    });
  } else {
    // bars
    const groups = isStacked ? 1 : series.length;
    const gap = 2;
    const slot = band * 0.72;
    const barW = Math.max(2, Math.min(maxBarWidth, (slot - gap * (groups - 1)) / groups));
    const groupW = barW * groups + gap * (groups - 1);
    data.forEach((d, i) => {
      const left = xAt(i) - groupW / 2;
      const dim = active !== null && active !== i;
      series.forEach((s, j) => {
        let v0: number;
        let v1: number;
        if (isStacked) {
          v0 = stacks[i][j][0];
          v1 = stacks[i][j][1];
        } else {
          v0 = 0;
          v1 = num(d[s.key]);
        }
        if (v1 === v0) return;
        const up = v1 >= v0;
        const yA = y(Math.max(v0, v1));
        const yB = y(Math.min(v0, v1));
        // 2px surface gap between stacked segments (not at the baseline)
        const segGap = isStacked && v0 !== 0 ? gap : 0;
        const top = up ? yA : yA + segGap;
        const h = Math.max(0, yB - yA - segGap);
        const isEnd = !isStacked || j === lastNonZero(stacks[i], up);
        const bx = isStacked ? left : left + j * (barW + gap);
        const dPath = roundedBar(bx, top, barW, h, isEnd ? radius : 0, up);
        if (!dPath) return;
        marks.push(
          <path
            key={`b-${i}-${s.key}`}
            className={"tc-bar" + (up ? "" : " tc-neg")}
            d={dPath}
            fill={s.color}
            opacity={dim ? 0.45 : 1}
            style={{ animationDelay: animate ? `${Math.min(i * 28, 420)}ms` : undefined, transition: "opacity 140ms" }}
          />
        );
      });
    });
  }

  // ----- tooltip & crosshair -----
  let tooltip: React.ReactNode = null;
  const overlay: React.ReactNode[] = [];
  if (active !== null && n) {
    const cx = xAt(active);
    if (kind === "bar") {
      overlay.push(<rect key="band" x={band * active} y={0} width={band} height={innerH} fill={tokens.hoverBand} rx={4} />);
    } else {
      if (showCrosshair) {
        overlay.push(<line key="xh" x1={cx} x2={cx} y1={0} y2={innerH} stroke={tokens.crosshair} strokeWidth={1} />);
      }
      series.forEach((s, j) => {
        const v = isStacked ? stacks[active][j][1] : num(data[active][s.key]);
        overlay.push(<circle key={`h-${s.key}`} cx={cx} cy={y(v)} r={5} fill={s.color} stroke={tokens.surface} strokeWidth={2} />);
      });
    }
    if (showTooltip) {
      const tipW = 190;
      // bars: sit beside the hovered band so the active bars stay visible
      const offset = kind === "bar" ? band / 2 + 6 : 16;
      const flip = margin.left + cx + offset + tipW > width;
      const tx = flip ? margin.left + cx - offset : margin.left + cx + offset;
      const ty = Math.max(0, Math.min(innerH - 40, pointerY - 30)) + margin.top;
      const rows = isStacked ? series.slice().reverse() : series.slice().sort((a, b) => num(data[active][b.key]) - num(data[active][a.key]));
      tooltip = (
        <div
          className="tc-tooltip"
          role="presentation"
          style={{
            transform: `translate(${tx}px, ${ty}px)${flip ? " translateX(-100%)" : ""}`,
            background: tokens.tooltipBg,
            border: `1px solid ${tokens.tooltipBorder}`,
            color: tokens.tooltipText,
          }}
        >
          <div className="tc-tooltip-title">{formatX(data[active][xKey], active)}</div>
          {rows.map((s) => (
            <div className="tc-tooltip-row" key={s.key}>
              <span className={kind === "line" ? "tc-key tc-key-line" : "tc-key"} style={{ background: s.color }} />
              <span className="tc-tooltip-label">{s.label}</span>
              <span className="tc-tooltip-value">{formatValue(num(data[active][s.key]), s.key)}</span>
            </div>
          ))}
        </div>
      );
    }
  }

  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const summary =
    description ||
    `${kind === "bar" ? "Bar" : kind === "area" ? "Area" : "Line"} chart of ${series.map((s) => s.label).join(", ")} across ${n} ${n === 1 ? "point" : "points"}.`;

  return (
    <div
      ref={ref}
      className={"tc-root" + (animate ? " tc-animate" : "") + (className ? " " + className : "")}
      style={{ color: tokens.text, ...style }}
      tabIndex={0}
      onKeyDown={handleKey}
      onBlur={clear}
      aria-roledescription="chart"
      aria-label={title || summary}
    >
      {showLegend && series.length > 0 && (
        <ul className="tc-legend" aria-hidden="true" style={{ color: tokens.muted }}>
          {series.map((s) => (
            <li key={s.key}>
              <span className={kind === "line" ? "tc-key tc-key-line" : "tc-key"} style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div style={{ position: "relative", height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-labelledby={`${titleId} ${descId}`}>
            <title id={titleId}>{title || summary}</title>
            <desc id={descId}>{summary}</desc>
            <defs>{defs}</defs>
            <g transform={`translate(${margin.left},${margin.top})`}>
              {/* grid + y ticks */}
              <g aria-hidden="true">
                {nice.ticks.map((t, i) => (
                  <g key={`yt-${t}`} transform={`translate(0,${y(t)})`}>
                    {showGrid && t !== 0 && <line x1={0} x2={innerW} stroke={tokens.grid} strokeWidth={1} shapeRendering="crispEdges" />}
                    <text className="tc-tick" x={-10} dy="0.32em" textAnchor="end" fill={tokens.muted}>
                      {yLabels[i]}
                    </text>
                  </g>
                ))}
                <line x1={0} x2={innerW} y1={baseY} y2={baseY} stroke={tokens.axis} strokeWidth={1} shapeRendering="crispEdges" />
                {data.map((d, i) =>
                  i % labelEvery === 0 ? (
                    <text
                      key={`xt-${i}`}
                      className="tc-tick"
                      x={xAt(i)}
                      y={innerH + 20}
                      textAnchor={kind !== "bar" && i === 0 && n > 1 ? "start" : kind !== "bar" && i === n - 1 && n > 1 ? "end" : "middle"}
                      fill={active === i ? tokens.text : tokens.muted}
                      fontWeight={active === i ? 600 : 400}
                    >
                      {formatX(d[xKey], i)}
                    </text>
                  ) : null
                )}
              </g>
              {kind === "bar" && <g aria-hidden="true">{overlay}</g>}
              <g className={kind === "bar" ? undefined : "tc-reveal"} aria-hidden="true">
                {marks}
              </g>
              {kind !== "bar" && <g aria-hidden="true">{overlay}</g>}
              <rect
                x={0}
                y={0}
                width={innerW}
                height={innerH}
                fill="transparent"
                onPointerMove={handleMove}
                onPointerDown={handleMove}
                onPointerLeave={clear}
                style={{ cursor: "crosshair", touchAction: "pan-y" }}
              />
            </g>
          </svg>
        )}
        {tooltip}
      </div>
      <table className="tc-sr-only">
        <caption>{title || summary}</caption>
        <thead>
          <tr>
            <th scope="col">{xKey}</th>
            {series.map((s) => (
              <th scope="col" key={s.key}>
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <th scope="row">{formatX(d[xKey], i)}</th>
              {series.map((s) => (
                <td key={s.key}>{formatValue(num(d[s.key]), s.key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function lastNonZero(stack: Array<[number, number]>, up: boolean): number {
  for (let j = stack.length - 1; j >= 0; j--) {
    const v = stack[j][1] - stack[j][0];
    if (v !== 0 && v > 0 === up) return j;
  }
  return -1;
}
