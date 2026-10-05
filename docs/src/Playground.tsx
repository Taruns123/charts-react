import { useMemo, useState } from "react";
import { AreaChart, BarChart, ComboChart, DonutChart, Gauge, LineChart, ScatterChart, Sparkline, lightPalette, darkPalette } from "t-charts";
import { Code } from "./Code";
import { accounts, datasets, DatasetId, kpis, pct, planRevenue, revenueMargin, usd, usdCompact, usdK } from "./data";

const palettes: Record<string, { label: string; colors?: string[] }> = {
  default: { label: "Default" },
  cobalt: { label: "Cobalt", colors: ["#0b6bcb", "#e0782f", "#7a5af5", "#1f9d74", "#c2410c"] },
  berry: { label: "Berry", colors: ["#d6336c", "#1c7ed6", "#f08c00", "#2b8a3e", "#7048e8"] },
};

type Kind = "area" | "line" | "bar" | "combo" | "scatter" | "donut" | "sparkline" | "gauge";
const kinds: Array<[Kind, string]> = [
  ["area", "Area"],
  ["line", "Line"],
  ["bar", "Bar"],
  ["combo", "Combo"],
  ["scatter", "Scatter"],
  ["donut", "Donut"],
  ["sparkline", "Spark"],
  ["gauge", "Gauge"],
];
const compName: Record<Kind, string> = {
  area: "AreaChart",
  line: "LineChart",
  bar: "BarChart",
  combo: "ComboChart",
  scatter: "ScatterChart",
  donut: "DonutChart",
  sparkline: "Sparkline",
  gauge: "Gauge",
};
const cartesian = (k: Kind) => k === "area" || k === "line" || k === "bar";

export default function Playground() {
  const [kind, setKind] = useState<Kind>("area");
  const [ds, setDs] = useState<DatasetId>("signups");
  const [smooth, setSmooth] = useState(true);
  const [gradient, setGradient] = useState(true);
  const [stacked, setStacked] = useState(false);
  const [paletteId, setPaletteId] = useState("default");
  const [dark, setDark] = useState(false);
  const [refLine, setRefLine] = useState(false);
  const [legend, setLegend] = useState(true);
  // combo
  const [rightAxis, setRightAxis] = useState(true);
  // scatter
  const [bubbles, setBubbles] = useState(true);
  const [quadrants, setQuadrants] = useState(true);
  // donut
  const [hole, setHole] = useState(true);
  const [rounded, setRounded] = useState(false);
  const [half, setHalf] = useState(false);
  // sparkline
  const [sparkType, setSparkType] = useState<"line" | "area" | "bar">("area");
  const [markers, setMarkers] = useState(true);
  // gauge
  const [gaugeValue, setGaugeValue] = useState(68);
  const [ring, setRing] = useState(false);
  const [useThresholds, setUseThresholds] = useState(true);
  const [hover, setHover] = useState<string | null>(null);

  const set = datasets[ds];
  const pal = palettes[paletteId].colors;
  const theme = (dark ? "dark" : "light") as "dark" | "light";
  const swatches = pal || (dark ? darkPalette : lightPalette);
  const key = [kind, ds, smooth, gradient, stacked, paletteId, dark, refLine, legend, rightAxis, bubbles, quadrants, hole, rounded, half, sparkType, markers, ring, useThresholds].join("-");
  const avg = useMemo(() => {
    const s = set.series[0].key;
    const vals = (set.data as any[]).map((d) => d[s] as number);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [set]);

  const describe = (title: string, rows: Array<[string, string, string?]>) => (
    <>
      Hovering <strong>{title}</strong> ·{" "}
      {rows.map(([k, v, c]) => (
        <span key={k} className="hover-val">
          {c && <i style={{ background: c }} />}
          {v}
        </span>
      ))}
    </>
  );

  let chart: React.ReactNode;
  let code: string[];
  let stageTitle: string = set.label;
  if (cartesian(kind)) {
    const common = {
      data: set.data as any[],
      xKey: set.xKey,
      series: set.series as any,
      height: 340,
      colors: pal,
      theme,
      showLegend: legend,
      formatY: set.currency ? usdCompact : undefined,
      formatValue: set.currency ? usd : undefined,
      referenceLines: refLine ? [{ y: avg, label: "Avg " + (set.currency ? usdCompact(avg) : avg.toLocaleString()) }] : undefined,
      onHover: (i: number | null) =>
        setHover(
          i === null
            ? null
            : JSON.stringify(
                [String((set.data as any[])[i][set.xKey])].concat(
                  set.series.map((s) => (set.currency ? usd((set.data as any[])[i][s.key]) : (set.data as any[])[i][s.key].toLocaleString()))
                )
              )
        ),
      title: set.label,
    };
    chart =
      kind === "area" ? (
        <AreaChart key={key} {...common} smooth={smooth} gradient={gradient} stacked={stacked} />
      ) : kind === "line" ? (
        <LineChart key={key} {...common} smooth={smooth} />
      ) : (
        <BarChart key={key} {...common} stacked={stacked} />
      );
    code = [`  data={${ds}}`, `  xKey="${set.xKey}"`, `  series={[${set.series.map((s) => `"${s.key}"`).join(", ")}]}`];
    if (smooth && kind !== "bar") code.push("  smooth");
    if (kind === "area" && !gradient) code.push("  gradient={false}");
    if (stacked && kind !== "line") code.push("  stacked");
    if (!legend) code.push("  showLegend={false}");
    if (refLine) code.push(`  referenceLines={[{ y: ${avg}, label: "Avg" }]}`);
  } else if (kind === "combo") {
    stageTitle = "Revenue & gross margin";
    chart = (
      <ComboChart
        key={key}
        data={revenueMargin}
        xKey="month"
        series={[
          { key: "revenue", label: "Revenue", type: "bar" },
          { key: "margin", label: "Gross margin", type: "line", axis: rightAxis ? "right" : "left" },
        ]}
        smooth={smooth}
        height={340}
        colors={pal}
        theme={theme}
        showLegend={legend}
        formatY={rightAxis ? usdK : undefined}
        formatYRight={pct}
        formatValue={(v, k) => (k === "margin" ? (v * 100).toFixed(0) + "%" : "$" + v + "K")}
        referenceLines={refLine ? [{ y: 0.65, axis: "right", label: "Margin goal 65%" }] : undefined}
        onHover={(i) => setHover(i === null ? null : JSON.stringify([revenueMargin[i].month, "$" + revenueMargin[i].revenue + "K", pct(revenueMargin[i].margin)]))}
        title="Revenue and gross margin"
      />
    );
    code = [
      "  data={revenueMargin}",
      '  xKey="month"',
      "  series={[",
      '    { key: "revenue", type: "bar" },',
      `    { key: "margin", type: "line"${rightAxis ? ', axis: "right"' : ""} },`,
      "  ]}",
    ];
    if (smooth) code.push("  smooth");
    if (rightAxis) code.push("  formatYRight={(v) => v * 100 + \"%\"}");
    if (refLine) code.push('  referenceLines={[{ y: 0.65, axis: "right", label: "Margin goal" }]}');
    if (!legend) code.push("  showLegend={false}");
  } else if (kind === "scatter") {
    stageTitle = "Accounts: adoption vs retention";
    chart = (
      <ScatterChart
        key={key}
        data={accounts}
        xKey="adoption"
        yKey="retention"
        sizeKey={bubbles ? "arr" : undefined}
        groupKey="plan"
        labelKey="name"
        xLabel="Feature adoption"
        yLabel="12-mo retention"
        sizeLabel="ARR"
        formatX={(v) => v + "%"}
        formatY={(v) => v + "%"}
        formatSize={usd}
        quadrants={quadrants ? { x: 50, y: 75, labels: ["Champions", "Loyal, under-using", "At risk", "Exploring"] } : undefined}
        referenceLines={refLine ? [{ y: 75, label: "Retention target" }] : undefined}
        showLegend={legend}
        colors={pal}
        theme={theme}
        height={360}
        onHover={(i) => setHover(i === null ? null : JSON.stringify([accounts[i].name, accounts[i].adoption + "% adoption", accounts[i].retention + "% retained", usd(accounts[i].arr)]))}
        title="Accounts by adoption and retention"
      />
    );
    code = ["  data={accounts}", '  xKey="adoption"', '  yKey="retention"', '  groupKey="plan"', '  labelKey="name"'];
    if (bubbles) code.push('  sizeKey="arr"');
    if (quadrants) code.push("  quadrants={{ x: 50, y: 75, labels: [...] }}");
    if (refLine) code.push('  referenceLines={[{ y: 75, label: "Retention target" }]}');
    if (!legend) code.push("  showLegend={false}");
  } else if (kind === "donut") {
    stageTitle = "Revenue by plan";
    chart = (
      <DonutChart
        key={key}
        data={planRevenue}
        nameKey="plan"
        valueKey="revenue"
        innerRadius={hole ? 0.64 : 0}
        cornerRadius={rounded ? 6 : 0}
        padAngle={rounded ? 2.5 : undefined}
        startAngle={half ? -90 : 0}
        endAngle={half ? 90 : 360}
        showLegend={legend}
        showTooltip={!hole}
        legendValue="both"
        colors={pal}
        theme={theme}
        height={half ? 200 : 320}
        formatValue={(v) => usdCompact(v)}
        centerLabel="Revenue"
        onHover={(i, d) => setHover(i === null || !d ? null : JSON.stringify([d.plan, usd(d.revenue)]))}
        title="Revenue by plan"
      />
    );
    code = ["  data={planRevenue}", '  nameKey="plan"', '  valueKey="revenue"'];
    if (!hole) code.push("  innerRadius={0}");
    if (rounded) code.push("  cornerRadius={6}", "  padAngle={2.5}");
    if (half) code.push("  startAngle={-90}", "  endAngle={90}");
    if (!legend) code.push("  showLegend={false}");
  } else if (kind === "sparkline") {
    stageTitle = "MRR, last 30 days";
    chart = (
      <div className="pg-spark">
        <div className="pg-spark-value">{usd(kpis.mrr[kpis.mrr.length - 1])}</div>
        <Sparkline
          key={key}
          data={kpis.mrr}
          type={sparkType}
          markers={markers ? true : ["last"]}
          referenceValue={refLine ? 58000 : undefined}
          smooth={smooth}
          color={pal ? pal[0] : undefined}
          theme={theme}
          height={120}
          formatValue={usd}
          onHover={(i, v) => setHover(i === null || v === null ? null : JSON.stringify(["Day " + (i + 1), usd(v)]))}
          title="MRR, last 30 days"
        />
        <div className="pg-spark-inline">
          Inline, word-sized: revenue is up <Sparkline data={kpis.mrr} type={sparkType} width={90} height={20} theme={theme} color={pal ? pal[0] : undefined} animate={false} /> this month.
        </div>
      </div>
    );
    code = ["  data={mrr} // number[]", `  type="${sparkType}"`];
    if (markers) code.push("  markers // min, max, last");
    if (refLine) code.push("  referenceValue={58000}");
    if (!smooth) code.push("  smooth={false}");
  } else {
    stageTitle = "Q3 quota attainment";
    chart = (
      <div className="pg-gauge">
        <Gauge
          key={key}
          value={gaugeValue}
          target={80}
          label="Q3 quota"
          arc={ring ? 360 : 240}
          thresholds={
            useThresholds
              ? [
                  { value: 0, color: dark ? "#e66767" : "#e34948", label: "Off track" },
                  { value: 50, color: dark ? "#c98500" : "#eda100", label: "At risk" },
                  { value: 80, color: dark ? "#199e70" : "#1baf7a", label: "On track" },
                ]
              : undefined
          }
          color={useThresholds ? undefined : pal ? pal[0] : undefined}
          theme={theme}
          height={300}
          formatValue={(v) => v + "%"}
          animate={false}
          title="Q3 quota attainment"
        />
        <label className="slider">
          <span>value</span>
          <input type="range" min={0} max={100} value={gaugeValue} onChange={(e) => setGaugeValue(+e.target.value)} />
          <output>{gaugeValue}</output>
        </label>
      </div>
    );
    code = [`  value={${gaugeValue}}`, "  target={80}", '  label="Q3 quota"'];
    if (ring) code.push("  arc={360}");
    if (useThresholds) code.push("  thresholds={[", '    { value: 0, color: "#e34948", label: "Off track" },', '    { value: 50, color: "#eda100", label: "At risk" },', '    { value: 80, color: "#1baf7a", label: "On track" },', "  ]}");
  }
  if (pal && kind !== "gauge") code.push(`  colors={[${pal.slice(0, 3).map((c) => `"${c}"`).join(", ")}, …]}`);
  if (dark) code.push('  theme="dark"');
  const comp = compName[kind];
  const codeStr = `import { ${comp} } from "@taruns123/charts-react";\n\n<${comp}\n${code.join("\n")}\n/>`;

  const hoverRow = hover ? (JSON.parse(hover) as string[]) : null;
  const legendApplies = kind !== "sparkline" && kind !== "gauge";

  return (
    <section className="section section-alt" id="playground">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">Playground</span>
          <h2>Try every prop, see the code.</h2>
          <p>Pick a component, flip the switches; it re-renders and the snippet below updates to match.</p>
        </div>
        <div className="pg">
          <aside className="pg-controls" aria-label="Chart options">
            <fieldset>
              <legend>Component</legend>
              <div className="seg seg-grid">
                {kinds.map(([k, label]) => (
                  <button
                    key={k}
                    className={kind === k ? "on" : ""}
                    onClick={() => {
                      setKind(k);
                      setHover(null);
                    }}
                    aria-pressed={kind === k}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            {cartesian(kind) && (
              <fieldset>
                <legend>Dataset</legend>
                <div className="ds-list">
                  {(Object.keys(datasets) as DatasetId[]).map((id) => (
                    <button key={id} className={"ds" + (ds === id ? " on" : "")} onClick={() => setDs(id)} aria-pressed={ds === id}>
                      <span>{datasets[id].label}</span>
                      <span className="ds-meta">
                        {datasets[id].series.length} series · {datasets[id].data.length} pts
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {kind === "sparkline" && (
              <fieldset>
                <legend>Type</legend>
                <div className="seg seg-lg">
                  {(["line", "area", "bar"] as const).map((t) => (
                    <button key={t} className={sparkType === t ? "on" : ""} onClick={() => setSparkType(t)} aria-pressed={sparkType === t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset>
              <legend>Options</legend>
              {(cartesian(kind) || kind === "combo" || kind === "sparkline") && (
                <Toggle label="Smooth curve" on={smooth} set={setSmooth} disabled={kind === "bar" || (kind === "sparkline" && sparkType === "bar")} />
              )}
              {cartesian(kind) && <Toggle label="Gradient fill" on={gradient} set={setGradient} disabled={kind !== "area"} />}
              {cartesian(kind) && <Toggle label="Stacked" on={stacked} set={setStacked} disabled={kind === "line"} />}
              {kind === "combo" && <Toggle label="Second y axis" on={rightAxis} set={setRightAxis} />}
              {kind === "scatter" && <Toggle label="Bubble size (ARR)" on={bubbles} set={setBubbles} />}
              {kind === "scatter" && <Toggle label="Quadrants" on={quadrants} set={setQuadrants} />}
              {kind === "donut" && <Toggle label="Hole (donut)" on={hole} set={setHole} />}
              {kind === "donut" && <Toggle label="Rounded corners" on={rounded} set={setRounded} />}
              {kind === "donut" && <Toggle label="Half circle" on={half} set={setHalf} />}
              {kind === "sparkline" && <Toggle label="Min / max markers" on={markers} set={setMarkers} />}
              {kind === "gauge" && <Toggle label="Threshold colours" on={useThresholds} set={setUseThresholds} />}
              {kind === "gauge" && <Toggle label="Full ring" on={ring} set={setRing} />}
              {kind !== "donut" && kind !== "gauge" && <Toggle label={kind === "sparkline" ? "Target line" : "Reference line"} on={refLine} set={setRefLine} />}
              {legendApplies && <Toggle label="Legend" on={legend} set={setLegend} />}
              <Toggle label="Dark theme" on={dark} set={setDark} />
            </fieldset>
            <fieldset>
              <legend>Palette</legend>
              <div className="pal-list">
                {Object.entries(palettes).map(([id, p]) => {
                  const cs = (p.colors || (dark ? darkPalette : lightPalette)).slice(0, 3);
                  return (
                    <button key={id} className={"pal" + (paletteId === id ? " on" : "")} onClick={() => setPaletteId(id)} aria-pressed={paletteId === id}>
                      <span className="pal-sw">
                        {cs.map((c) => (
                          <i key={c} style={{ background: c }} />
                        ))}
                      </span>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </aside>
          <div className="pg-main">
            <div className={"pg-stage" + (dark ? " dark-surface" : "")}>
              <div className="pg-stage-head">
                <div>
                  <div className="card-title">{stageTitle}</div>
                  <div className="card-sub">
                    {hoverRow
                      ? describe(
                          hoverRow[0],
                          hoverRow.slice(1).map((v, i) => [String(i), v, cartesian(kind) || kind === "combo" ? swatches[i] : undefined] as [string, string, string?])
                        )
                      : kind === "gauge"
                      ? "Drag the slider to move between states"
                      : "Hover the chart, or focus it and use ← →"}
                  </div>
                </div>
                <span className="pill pill-soft">{kind === "gauge" ? "role=meter" : "onHover"}</span>
              </div>
              {chart}
            </div>
            <Code code={codeStr} label="Playground.tsx" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Toggle({ label, on, set, disabled }: { label: string; on: boolean; set: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={"toggle" + (disabled ? " disabled" : "")}>
      <span>{label}</span>
      <input type="checkbox" checked={on && !disabled} disabled={disabled} onChange={(e) => set(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}
