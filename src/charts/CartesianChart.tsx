import React, { useMemo, useState } from "react";
import { linearScale, niceTicks, alignedTicks, formatCompact, formatFull } from "./scale";
import { areaPath, curvePath, roundedBar, Point } from "./curve";
import { num, stackSeries, lastNonZero } from "./stack";
import { useContainerWidth } from "./useSize";
import { getTheme, navKey, resolveSeries, ResolvedSeries, SrTable, textWidth, Tooltip, useChartId, useHiddenSeries } from "./shared";
import { collectReferenceLines } from "./ReferenceLine";
import Legend from "./Legend";
import type { AreaChartProps, BarChartProps, ComboChartProps, LineChartProps } from "./types";

type Kind = "line" | "area" | "bar" | "combo";

export type CartesianProps = Omit<LineChartProps & AreaChartProps & BarChartProps, "series"> &
  Partial<Pick<ComboChartProps, "yDomainRight" | "formatYRight">> & { kind: Kind; series?: ComboChartProps["series"] };

interface Axis {
  ticks: number[];
  domain: [number, number];
  scale: (v: number) => number;
  labels: string[];
}

/** Engine behind LineChart, AreaChart, BarChart and ComboChart. */
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
    zeroBaseline = true,
    gradient = true,
    stacked = false,
    radius = 4,
    maxBarWidth = 28,
    legendToggle = true,
    title,
    description,
    className,
    style,
    onHover,
  } = props;
  const showDots = props.showDots !== undefined ? props.showDots : kind === "combo";
  const showEndDot = props.showEndDot !== undefined ? props.showEndDot : kind === "line";

  const { tokens, palette } = getTheme(theme, props.colors);
  const defaultMark = kind === "combo" ? "bar" : kind;
  const paletteSig = palette.join();
  const series = useMemo(
    () => resolveSeries(data, xKey, props.series, palette, defaultMark),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, xKey, props.series, paletteSig, defaultMark]
  );
  const [hidden, toggle] = useHiddenSeries(
    series.map((s) => s.key),
    props.defaultHiddenSeries,
    props.hiddenSeries,
    props.onLegendToggle
  );
  const [highlight, setHighlight] = useState<string | null>(null);
  const visible = series.filter((s) => hidden.indexOf(s.key) < 0);
  const showLegend = props.showLegend !== undefined ? props.showLegend : series.length > 1;
  const formatX = props.formatX || ((v: any) => String(v));
  const formatY = props.formatY || formatCompact;
  const formatYRight = props.formatYRight || formatY;
  const formatValue = props.formatValue || ((v: number) => formatFull(v));
  const refLines = collectReferenceLines(props.referenceLines, props.children);
  const annotations = props.annotations || [];

  const { ref, width } = useContainerWidth(fixedWidth);
  const [active, setActive] = useState<number | null>(null);
  const [pointerY, setPointerY] = useState(0);
  const id = useChartId();

  const n = data.length;
  const banded = kind === "bar" || (kind === "combo" && series.some((s) => s.mark === "bar"));
  const hasRight = series.some((s) => s.axis === 1);

  // ----- stacking: per (mark, axis) group of visible series; lines never stack -----
  const visibleSig = visible.map((s) => s.key + s.mark + s.axis).join();
  const stackOf = useMemo(() => {
    const out: Record<string, Array<[number, number]>> = {};
    if (!stacked) return out;
    const groups: Record<string, ResolvedSeries[]> = {};
    visible.forEach((s) => {
      if (s.mark === "line") return;
      const g = s.mark + s.axis;
      (groups[g] = groups[g] || []).push(s);
    });
    Object.keys(groups).forEach((g) => {
      const keys = groups[g].map((s) => s.key);
      const st = stackSeries(data, keys);
      keys.forEach((k, j) => {
        out[k] = st.map((row) => row[j]);
      });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, stacked, visibleSig]);
  const isStacked = (s: ResolvedSeries) => !!stackOf[s.key];
  const topOf = (s: ResolvedSeries, i: number) => (isStacked(s) ? stackOf[s.key][i][1] : num(data[i][s.key]));

  // ----- y domains (one per axis) -----
  const extent = (axis: 0 | 1): [number, number] => {
    let lo = Infinity;
    let hi = -Infinity;
    const take = (v: number) => {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    };
    visible.forEach((s) => {
      if (s.axis !== axis) return;
      data.forEach((d, i) => {
        if (isStacked(s)) {
          take(stackOf[s.key][i][0]);
          take(stackOf[s.key][i][1]);
        } else take(num(d[s.key]));
      });
    });
    refLines.forEach((r) => {
      if (r.y !== undefined && (r.axis === "right" ? 1 : 0) === axis) take(r.y);
    });
    annotations.forEach((a) => {
      if (a.y !== undefined && axis === 0) take(a.y);
    });
    if (!isFinite(lo)) return [0, 1];
    const filled = series.some((s) => s.axis === axis && s.mark !== "line");
    if (filled || zeroBaseline) {
      lo = Math.min(0, lo);
      hi = Math.max(0, hi);
    }
    return [lo, hi];
  };

  const [lo0, hi0] = extent(0);
  const leftNice = props.yDomain
    ? {
        domain: props.yDomain,
        ticks: niceTicks(props.yDomain[0], props.yDomain[1], yTickCount).ticks.filter((t) => t >= props.yDomain![0] && t <= props.yDomain![1]),
      }
    : niceTicks(lo0, hi0, yTickCount);
  let rightNice: { domain: [number, number]; ticks: number[] } | null = null;
  if (hasRight) {
    if (props.yDomainRight) {
      const d = props.yDomainRight;
      rightNice = { domain: d, ticks: niceTicks(d[0], d[1], yTickCount).ticks.filter((t) => t >= d[0] && t <= d[1]) };
    } else {
      const [lo1, hi1] = extent(1);
      // same number of intervals as the left axis, so both share one grid
      rightNice = alignedTicks(lo1, hi1, Math.max(1, leftNice.ticks.length - 1));
    }
  }

  const leftLabels = leftNice.ticks.map((t) => formatY(t));
  const rightLabels = rightNice ? rightNice.ticks.map((t) => formatYRight(t)) : [];
  const widest = (ls: string[]) => ls.reduce((m, l) => Math.max(m, l.length), 0);

  // ----- layout -----
  const margin = {
    top: 10,
    right: hasRight ? Math.round(widest(rightLabels) * 6.6 + 14) : banded ? 4 : 12,
    bottom: 30,
    left: Math.round(widest(leftLabels) * 6.6 + 14),
  };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);
  const axes: Axis[] = [{ domain: leftNice.domain, ticks: leftNice.ticks, scale: linearScale(leftNice.domain, [innerH, 0]), labels: leftLabels }];
  if (rightNice) axes.push({ domain: rightNice.domain, ticks: rightNice.ticks, scale: linearScale(rightNice.domain, [innerH, 0]), labels: rightLabels });
  const yOf = (s: { axis: 0 | 1 }) => (axes[s.axis] || axes[0]).scale;
  const y = axes[0].scale;
  const band = n ? innerW / n : innerW;
  const xAt = (i: number) => (banded ? band * (i + 0.5) : n > 1 ? (innerW * i) / (n - 1) : innerW / 2);
  const baseYFor = (axis: 0 | 1) => {
    const a = axes[axis] || axes[0];
    return a.scale(Math.max(a.domain[0], Math.min(a.domain[1], 0)));
  };
  const baseY = baseYFor(0);

  // x tick thinning: keep labels roughly >= 72px apart
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 72))));

  const indexOfX = (x: string | number): number => {
    for (let i = 0; i < n; i++) if (data[i][xKey] === x) return i;
    return typeof x === "number" && x >= 0 && x < n ? Math.round(x) : -1;
  };

  // ----- hover -----
  const setIndex = (idx: number | null) => {
    if (idx !== active) {
      setActive(idx);
      if (onHover) onHover(idx, idx === null ? null : data[idx]);
    }
  };
  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!n) return;
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    let idx = banded ? Math.floor(px / band) : n > 1 ? Math.round((px / innerW) * (n - 1)) : 0;
    idx = Math.max(0, Math.min(n - 1, idx));
    setPointerY(e.clientY - rect.top);
    setIndex(idx);
  };
  const clear = () => setIndex(null);
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return; // legend buttons handle their own keys
    const next = navKey(e.key, active, n);
    if (next === undefined) return;
    e.preventDefault();
    setPointerY(innerH * 0.3);
    setIndex(next);
  };

  // ----- marks -----
  const fade = (s: ResolvedSeries) => (highlight && highlight !== s.key ? 0.22 : 1);
  const defs: React.ReactNode[] = [];
  const areaMarks: React.ReactNode[] = [];
  const barMarks: React.ReactNode[] = [];
  const lineMarks: React.ReactNode[] = [];

  const pointsFor = (s: ResolvedSeries, which: 0 | 1): Point[] => {
    const ys = yOf(s);
    return data.map((d, i) => [xAt(i), ys(isStacked(s) ? stackOf[s.key][i][which] : which === 0 ? 0 : num(d[s.key]))]);
  };

  const areas = visible.filter((s) => s.mark === "area");
  // overlapping (unstacked) areas get a lighter wash so lower series stay visible
  const overlapping = areas.length > 1 && !areas.every(isStacked);
  const fillTop = props.fillOpacity !== undefined ? props.fillOpacity : gradient ? (overlapping ? 0.16 : 0.28) : overlapping ? 0.08 : 0.12;
  areas.forEach((s) => {
    const top = pointsFor(s, 1);
    const b = baseYFor(s.axis);
    const bottom = isStacked(s) ? pointsFor(s, 0) : data.map((_, i) => [xAt(i), b] as Point);
    const gid = `${id}-g-${s.key.replace(/[^\w-]/g, "_")}`;
    if (gradient) {
      defs.push(
        <linearGradient key={gid} id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s.color} stopOpacity={fillTop} />
          <stop offset="100%" stopColor={s.color} stopOpacity={isStacked(s) ? fillTop * 0.45 : 0.02} />
        </linearGradient>
      );
    }
    areaMarks.push(
      <path
        key={`a-${s.key}`}
        d={areaPath(top, bottom, smooth)}
        fill={gradient ? `url(#${gid})` : s.color}
        fillOpacity={gradient ? 1 : fillTop}
        opacity={fade(s)}
        style={{ transition: "opacity 160ms" }}
      />
    );
  });

  // bars: one slot per unstacked series, or one per stacked axis group
  const bars = visible.filter((s) => s.mark === "bar");
  if (bars.length) {
    const slotKeys: string[] = [];
    const slotOf: Record<string, number> = {};
    bars.forEach((s) => {
      const k = isStacked(s) ? "stack" + s.axis : s.key;
      if (slotKeys.indexOf(k) < 0) slotKeys.push(k);
      slotOf[s.key] = slotKeys.indexOf(k);
    });
    const groups = slotKeys.length;
    const gap = 2;
    const slot = band * 0.72;
    const barW = Math.max(2, Math.min(maxBarWidth, (slot - gap * (groups - 1)) / groups));
    const groupW = barW * groups + gap * (groups - 1);
    data.forEach((d, i) => {
      const left = xAt(i) - groupW / 2;
      const dim = active !== null && active !== i;
      bars.forEach((s) => {
        const ys = yOf(s);
        const st = isStacked(s);
        const v0 = st ? stackOf[s.key][i][0] : 0;
        const v1 = st ? stackOf[s.key][i][1] : num(d[s.key]);
        if (v1 === v0) return;
        const up = v1 >= v0;
        const yA = ys(Math.max(v0, v1));
        const yB = ys(Math.min(v0, v1));
        // 2px surface gap between stacked segments (not at the baseline)
        const segGap = st && v0 !== 0 ? gap : 0;
        const top = up ? yA : yA + segGap;
        const h = Math.max(0, yB - yA - segGap);
        let isEnd = true;
        if (st) {
          const peers = bars.filter((p) => isStacked(p) && p.axis === s.axis);
          isEnd = peers[lastNonZero(peers.map((p) => stackOf[p.key][i]), up)] === s;
        }
        const bx = left + slotOf[s.key] * (barW + gap);
        const dPath = roundedBar(bx, top, barW, h, isEnd ? radius : 0, up);
        if (!dPath) return;
        barMarks.push(
          <path
            key={`b-${i}-${s.key}`}
            className={"tc-bar" + (up ? "" : " tc-neg")}
            d={dPath}
            fill={s.color}
            opacity={(dim ? 0.45 : 1) * fade(s)}
            style={{ animationDelay: animate ? `${Math.min(i * 28, 420)}ms` : undefined, transition: "opacity 140ms" }}
          />
        );
      });
    });
  }

  // lines (and area outlines), drawn after bars so they sit on top
  visible.forEach((s) => {
    if (s.mark === "bar") return;
    const pts = pointsFor(s, 1);
    lineMarks.push(
      <path
        key={`l-${s.key}`}
        d={curvePath(pts, smooth)}
        fill="none"
        stroke={s.color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={fade(s)}
        style={{ transition: "opacity 160ms" }}
      />
    );
    if (showDots && s.mark === "line") {
      pts.forEach((p, i) =>
        lineMarks.push(
          <circle key={`d-${s.key}-${i}`} cx={p[0]} cy={p[1]} r={3.5} fill={s.color} stroke={tokens.surface} strokeWidth={2} opacity={fade(s)} />
        )
      );
    } else if (showEndDot && s.mark === "line" && pts.length) {
      const p = pts[pts.length - 1];
      lineMarks.push(<circle key={`e-${s.key}`} cx={p[0]} cy={p[1]} r={4} fill={s.color} stroke={tokens.surface} strokeWidth={2} opacity={fade(s)} />);
    }
  });

  // ----- reference lines & annotations -----
  const refMarks: React.ReactNode[] = [];
  // labels go in a top layer so bars and areas never cover them
  const refLabels: React.ReactNode[] = [];
  refLines.forEach((r, k) => {
    const color = r.color || tokens.reference;
    const dash = r.dashed === false ? undefined : "4 4";
    const sw = r.strokeWidth || 1;
    if (r.y !== undefined) {
      const axis: 0 | 1 = r.axis === "right" && axes[1] ? 1 : 0;
      const yy = axes[axis].scale(r.y);
      if (yy < -0.5 || yy > innerH + 0.5) return;
      const atStart = r.labelPosition === "start";
      refMarks.push(
        <g key={`ry-${k}`} className="tc-ref">
          <line x1={0} x2={innerW} y1={yy} y2={yy} stroke={color} strokeWidth={sw} strokeDasharray={dash} shapeRendering="crispEdges" />
        </g>
      );
      if (r.label)
        refLabels.push(
          <text key={`ryl-${k}`} className="tc-ref-label" x={atStart ? 4 : innerW - 4} y={yy - 6} textAnchor={atStart ? "start" : "end"} fill={color} stroke={tokens.surface}>
            {r.label}
          </text>
        );
    } else if (r.x !== undefined) {
      const idx = indexOfX(r.x);
      if (idx < 0) return;
      const xx = xAt(idx);
      const right = xx + textWidth(r.label || "") + 8 > innerW;
      refMarks.push(
        <g key={`rx-${k}`} className="tc-ref">
          <line x1={xx} x2={xx} y1={0} y2={innerH} stroke={color} strokeWidth={sw} strokeDasharray={dash} shapeRendering="crispEdges" />
        </g>
      );
      if (r.label)
        refLabels.push(
          <text key={`rxl-${k}`} className="tc-ref-label" x={right ? xx - 6 : xx + 6} y={10} textAnchor={right ? "end" : "start"} fill={color} stroke={tokens.surface}>
            {r.label}
          </text>
        );
    }
  });

  const noteMarks: React.ReactNode[] = [];
  annotations.forEach((a, k) => {
    const idx = indexOfX(a.x);
    if (idx < 0) return;
    let s: ResolvedSeries | undefined;
    for (let j = 0; j < visible.length; j++) if (visible[j].key === a.seriesKey) s = visible[j];
    if (!s && a.seriesKey) return; // annotated series is hidden
    if (!s && a.y === undefined) s = visible[0];
    if (!s && a.y === undefined) return;
    const ys = s ? yOf(s) : y;
    const v = a.y !== undefined ? a.y : topOf(s!, idx);
    const cx = xAt(idx);
    const cy = ys(v);
    const color = a.color || (s ? s.color : tokens.text);
    const w = textWidth(a.label) + 14;
    const below = cy < 34;
    const ly = below ? cy + 14 : cy - 34;
    const lx = Math.max(0, Math.min(innerW - w, cx - w / 2));
    noteMarks.push(
      <g key={`n-${k}`} className="tc-fade">
        <line x1={cx} x2={cx} y1={below ? cy + 5 : cy - 5} y2={below ? ly : ly + 20} stroke={color} strokeWidth={1} />
        <circle cx={cx} cy={cy} r={4.5} fill={tokens.surface} stroke={color} strokeWidth={2} />
        <rect x={lx} y={ly} width={w} height={20} rx={6} fill={tokens.surface} stroke={color} strokeOpacity={0.55} />
        <text x={lx + w / 2} y={ly + 13.5} textAnchor="middle" className="tc-note-label" fill={tokens.text}>
          {a.label}
        </text>
      </g>
    );
  });

  // ----- tooltip & crosshair -----
  let tooltip: React.ReactNode = null;
  const under: React.ReactNode[] = [];
  const over: React.ReactNode[] = [];
  if (active !== null && n) {
    const cx = xAt(active);
    if (banded) {
      under.push(<rect key="band" x={band * active} y={0} width={band} height={innerH} fill={tokens.hoverBand} rx={4} />);
    } else if (showCrosshair) {
      over.push(<line key="xh" x1={cx} x2={cx} y1={0} y2={innerH} stroke={tokens.crosshair} strokeWidth={1} />);
    }
    visible.forEach((s) => {
      if (s.mark === "bar") return;
      over.push(<circle key={`h-${s.key}`} cx={cx} cy={yOf(s)(topOf(s, active))} r={5} fill={s.color} stroke={tokens.surface} strokeWidth={2} />);
    });
    if (showTooltip && visible.length) {
      const tipW = 190;
      // banded: sit beside the hovered band so the active bars stay visible
      const offset = banded ? band / 2 + 6 : 16;
      const flip = margin.left + cx + offset + tipW > width;
      const tx = flip ? margin.left + cx - offset : margin.left + cx + offset;
      const ty = Math.max(0, Math.min(innerH - 40, pointerY - 30)) + margin.top;
      const anyStack = visible.some(isStacked);
      const rows =
        kind === "combo"
          ? visible
          : anyStack
          ? visible.slice().reverse()
          : visible.slice().sort((a, b) => num(data[active][b.key]) - num(data[active][a.key]));
      tooltip = (
        <Tooltip
          x={tx}
          y={ty}
          flip={flip}
          tokens={tokens}
          title={formatX(data[active][xKey], active)}
          rows={rows.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            marker: s.mark === "line" ? "line" : "square",
            value: formatValue(num(data[active][s.key]), s.key),
          }))}
        />
      );
    }
  }

  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const kindName = kind === "bar" ? "Bar" : kind === "area" ? "Area" : kind === "combo" ? "Combination" : "Line";
  const summary = description || `${kindName} chart of ${visible.map((s) => s.label).join(", ")} across ${n} ${n === 1 ? "point" : "points"}.`;

  return (
    <div
      ref={ref}
      className={"tc-root" + (animate ? " tc-animate" : "") + (className ? " " + className : "")}
      style={{ color: tokens.text, ...style }}
      tabIndex={0}
      onKeyDown={handleKey}
      onBlur={(e) => {
        if (e.target === e.currentTarget) clear();
      }}
      aria-roledescription="chart"
      aria-label={title || summary}
    >
      {showLegend && series.length > 0 && (
        <Legend
          items={series.map((s) => ({ key: s.key, label: s.label, color: s.color }))}
          hidden={hidden}
          onToggle={legendToggle ? toggle : undefined}
          onHighlight={setHighlight}
          marker={kind === "line" ? "line" : "square"}
          theme={theme}
        />
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
                {axes[0].ticks.map((t, i) => (
                  <g key={`yt-${t}`} transform={`translate(0,${y(t)})`}>
                    {showGrid && t !== 0 && <line x1={0} x2={innerW} stroke={tokens.grid} strokeWidth={1} shapeRendering="crispEdges" />}
                    <text className="tc-tick" x={-10} dy="0.32em" textAnchor="end" fill={tokens.muted}>
                      {axes[0].labels[i]}
                    </text>
                  </g>
                ))}
                {axes[1] &&
                  axes[1].ticks.map((t, i) => (
                    <text key={`yr-${t}`} className="tc-tick" x={innerW + 10} y={axes[1].scale(t)} dy="0.32em" textAnchor="start" fill={tokens.muted}>
                      {axes[1].labels[i]}
                    </text>
                  ))}
                <line x1={0} x2={innerW} y1={baseY} y2={baseY} stroke={tokens.axis} strokeWidth={1} shapeRendering="crispEdges" />
                {data.map((d, i) =>
                  i % labelEvery === 0 ? (
                    <text
                      key={`xt-${i}`}
                      className="tc-tick"
                      x={xAt(i)}
                      y={innerH + 20}
                      textAnchor={!banded && i === 0 && n > 1 ? "start" : !banded && i === n - 1 && n > 1 ? "end" : "middle"}
                      fill={active === i ? tokens.text : tokens.muted}
                      fontWeight={active === i ? 600 : 400}
                    >
                      {formatX(d[xKey], i)}
                    </text>
                  ) : null
                )}
              </g>
              <g aria-hidden="true">{under}</g>
              <g aria-hidden="true">{refMarks}</g>
              <g className="tc-reveal" aria-hidden="true">
                {areaMarks}
              </g>
              <g aria-hidden="true">{barMarks}</g>
              <g className="tc-reveal" aria-hidden="true">
                {lineMarks}
              </g>
              <g aria-hidden="true">{over}</g>
              <g aria-hidden="true">{refLabels}</g>
              <g aria-hidden="true">{noteMarks}</g>
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
      <SrTable
        caption={title || summary}
        columns={[xKey].concat(visible.map((s) => s.label))}
        rows={data.map((d, i) => [formatX(d[xKey], i)].concat(visible.map((s) => formatValue(num(d[s.key]), s.key))))}
      />
    </div>
  );
}
