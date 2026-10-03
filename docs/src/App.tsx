import { useMemo, useState } from "react";
import { AreaChart, BarChart, LineChart, lightPalette, darkPalette } from "t-charts";
import { Code } from "./Code";
import { activeUsers, datasets, DatasetId, mrr, regionalSales, revenueMix, signups, usd, usdCompact } from "./data";

const GITHUB = "https://github.com/Taruns123/charts-react";

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--ink)" />
      <rect x="7" y="16" width="4" height="9" rx="1.5" fill="var(--accent)" />
      <rect x="14" y="10" width="4" height="15" rx="1.5" fill="var(--bg)" />
      <rect x="21" y="6" width="4" height="19" rx="1.5" fill="var(--bg)" />
    </svg>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a className="brand" href="#top">
          <Logo />
          <span>T-Charts</span>
          <span className="pill">v0.1</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#gallery">Gallery</a>
          <a href="#playground">Playground</a>
          <a href="#install">Docs</a>
          <a className="nav-gh" href={GITHUB}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

function Stat({ label, value, delta, up = true, good = true }: { label: string; value: string; delta: string; up?: boolean; good?: boolean }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={"stat-delta " + (good ? "good" : "bad")}>
        <span aria-hidden="true">{up ? "▲" : "▼"}</span> {delta} <span className="muted">vs last month</span>
      </div>
    </div>
  );
}

function Hero() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <a className="eyebrow" href="#playground">
            <span className="eyebrow-dot" /> New: smooth curves, gradients &amp; crosshair tooltips
          </a>
          <h1>
            Charts that bend
            <br />
            to <em>your</em> data.
          </h1>
          <p className="lede">
            T-Charts is a small, dependency-free React library for line, area and bar charts. Pure SVG, responsive out
            of the box, keyboard accessible, and every default tuned so your first render already looks finished.
          </p>
          <div className="hero-actions">
            <a className="btn btn-accent" href="#install">
              Get started
            </a>
            <a className="btn btn-primary" href="#playground">
              Open the playground →
            </a>
          </div>
          <button
            className="install"
            onClick={() => {
              navigator.clipboard?.writeText("npm i @taruns123/charts-react");
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            }}
          >
            <span className="prompt">$</span> npm i @taruns123/charts-react
            <span className="install-copy">{copied ? "copied" : "copy"}</span>
          </button>
          <ul className="hero-facts">
            <li>
              <strong>~9 KB</strong> gzipped
            </li>
            <li>
              <strong>0</strong> dependencies
            </li>
            <li>
              <strong>TypeScript</strong> first
            </li>
          </ul>
        </div>
        <div className="hero-card" aria-label="Example analytics dashboard built with T-Charts">
          <div className="card-head">
            <div>
              <div className="card-title">Revenue overview</div>
              <div className="card-sub">Acme Cloud · Jan – Dec 2025</div>
            </div>
            <div className="seg" role="group" aria-label="Range">
              <span>3M</span>
              <span>6M</span>
              <span className="on">12M</span>
            </div>
          </div>
          <div className="stats">
            <Stat label="MRR" value="$61,840" delta="11.8%" />
            <Stat label="Active users" value="3,810" delta="6.4%" />
            <Stat label="Churn" value="2.1%" delta="0.3pt" up={false} />
          </div>
          <AreaChart
            data={mrr}
            xKey="month"
            series={[{ key: "mrr", label: "MRR" }]}
            smooth
            height={230}
            formatY={usdCompact}
            formatValue={usd}
            title="Monthly recurring revenue, 2025"
          />
          <div className="hero-minis">
            <div className="mini">
              <div className="mini-title">Signups by channel</div>
              <LineChart data={signups.slice(4)} xKey="week" series={datasets.signups.series as any} smooth height={130} showLegend={false} showEndDot={false} yTickCount={3} />
            </div>
            <div className="mini">
              <div className="mini-title">Sales by region</div>
              <BarChart data={regionalSales} xKey="quarter" series={datasets.regional.series as any} height={130} showLegend={false} formatY={usdCompact} formatValue={usd} yTickCount={3} maxBarWidth={12} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  ["Pure SVG", "Crisp at any zoom, styleable with CSS, printable. No canvas, no runtime dependencies."],
  ["Truthful smoothing", "Monotone cubic curves look soft but never overshoot a peak or dip below zero."],
  ["Tooltips & crosshair", "Hover, tap or arrow-key through points. Every series value for that x, at a glance."],
  ["Accessible by default", "role=img with titles, a screen-reader data table and full keyboard navigation."],
  ["Responsive", "Charts measure their container with ResizeObserver. Set a width only if you want one."],
  ["Colour-safe palette", "Eight hues ordered so adjacent series stay distinct for colour-blind readers."],
];

function Features() {
  return (
    <section className="features wrap" aria-label="Features">
      {features.map(([t, d], i) => (
        <div className="feature" key={t}>
          <span className="feature-n">0{i + 1}</span>
          <h3>{t}</h3>
          <p>{d}</p>
        </div>
      ))}
    </section>
  );
}

type Example = { id: string; title: string; blurb: string; chart: React.ReactNode; code: string };

const examples: Example[] = [
  {
    id: "area",
    title: "Area chart with gradient",
    blurb: "A single KPI over time. Smooth curve, soft gradient, currency formatting on axis and tooltip.",
    chart: (
      <AreaChart data={mrr} xKey="month" series={[{ key: "mrr", label: "MRR" }]} smooth height={260} formatY={usdCompact} formatValue={usd} title="Monthly recurring revenue" />
    ),
    code: `import { AreaChart } from "@taruns123/charts-react";

<AreaChart
  data={mrr} // [{ month: "Jan", mrr: 18200 }]
  xKey="month"
  series={[{ key: "mrr", label: "MRR" }]}
  smooth
  formatY={(v) => "$" + v / 1000 + "K"}
  formatValue={(v) => "$" + v.toLocaleString()}
/>`,
  },
  {
    id: "line",
    title: "Multi-series line",
    blurb: "Compare channels week over week. Legend, end dots and a crosshair tooltip sorted by value.",
    chart: <LineChart data={signups} xKey="week" series={datasets.signups.series as any} smooth height={260} title="Weekly signups by channel" />,
    code: `<LineChart
  data={signups}
  xKey="week"
  series={[
    { key: "organic", label: "Organic" },
    { key: "paid", label: "Paid" },
    { key: "referral", label: "Referral" },
  ]}
  smooth
/>`,
  },
  {
    id: "bar",
    title: "Grouped bars",
    blurb: "Regions side by side for each quarter, with a 2px gap between bars and rounded data ends.",
    chart: <BarChart data={regionalSales} xKey="quarter" series={datasets.regional.series as any} height={260} formatY={usdCompact} formatValue={usd} title="Quarterly sales by region" />,
    code: `<BarChart
  data={regionalSales}
  xKey="quarter"
  series={[
    { key: "na", label: "North America" },
    { key: "emea", label: "EMEA" },
    { key: "apac", label: "APAC" },
  ]}
  formatY={(v) => "$" + v / 1000 + "K"}
/>`,
  },
  {
    id: "stacked",
    title: "Stacked bars",
    blurb: "Revenue mix that adds up to a total. Segments are separated by surface gaps, not borders.",
    chart: (
      <BarChart
        data={revenueMix}
        xKey="month"
        stacked
        series={[
          { key: "subscriptions", label: "Subscriptions" },
          { key: "services", label: "Services" },
          { key: "addons", label: "Add-ons" },
        ]}
        height={260}
        formatY={(v) => (v ? "$" + v + "K" : "$0")}
        formatValue={(v) => "$" + v + "K"}
        title="Revenue mix by month"
      />
    ),
    code: `<BarChart
  data={revenueMix}
  xKey="month"
  stacked
  series={["subscriptions", "services", "addons"]}
  formatY={(v) => "$" + v + "K"}
/>`,
  },
  {
    id: "stacked-area",
    title: "Stacked area",
    blurb: "Daily active users split by platform. Weekend dips are easy to spot in the combined shape.",
    chart: (
      <AreaChart
        data={activeUsers}
        xKey="day"
        stacked
        smooth
        series={[
          { key: "web", label: "Web" },
          { key: "mobile", label: "Mobile" },
        ]}
        height={260}
        title="Daily active users by platform"
      />
    ),
    code: `<AreaChart
  data={activeUsers}
  xKey="day"
  series={[
    { key: "web", label: "Web" },
    { key: "mobile", label: "Mobile" },
  ]}
  stacked
  smooth
/>`,
  },
  {
    id: "dark",
    title: "Dark theme",
    blurb: "Pass theme=\"dark\" for a palette stepped for dark surfaces — not a naive inversion.",
    chart: (
      <div className="dark-surface">
        <LineChart data={signups} xKey="week" series={datasets.signups.series as any} theme="dark" height={236} title="Weekly signups, dark theme" />
      </div>
    ),
    code: `<LineChart
  data={signups}
  xKey="week"
  series={["organic", "paid", "referral"]}
  theme="dark"
/>`,
  },
];

function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">Gallery</span>
          <h2>Three chart types. Dozens of shapes.</h2>
          <p>Every example below is a live component rendering realistic data. Hover any chart, or tab to it and use the arrow keys.</p>
        </div>
        <div className="examples">
          {examples.map((ex) => (
            <article className="example" key={ex.id} id={"ex-" + ex.id}>
              <div className="example-chart">
                <h3>{ex.title}</h3>
                <p>{ex.blurb}</p>
                {ex.chart}
              </div>
              <Code code={ex.code} compact />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const palettes: Record<string, { label: string; colors?: string[] }> = {
  default: { label: "Default" },
  cobalt: { label: "Cobalt", colors: ["#0b6bcb", "#e0782f", "#7a5af5"] },
  berry: { label: "Berry", colors: ["#d6336c", "#1c7ed6", "#f08c00"] },
};

type Kind = "area" | "line" | "bar";

function Playground() {
  const [kind, setKind] = useState<Kind>("area");
  const [ds, setDs] = useState<DatasetId>("signups");
  const [smooth, setSmooth] = useState(true);
  const [gradient, setGradient] = useState(true);
  const [stacked, setStacked] = useState(false);
  const [paletteId, setPaletteId] = useState("default");
  const [dark, setDark] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const set = datasets[ds];
  const pal = palettes[paletteId].colors;
  const swatches = pal || (dark ? darkPalette : lightPalette).slice(0, 3);
  const fmtY = set.currency ? usdCompact : undefined;
  const fmtV = set.currency ? usd : undefined;
  const common = {
    data: set.data as any[],
    xKey: set.xKey,
    series: set.series as any,
    height: 340,
    colors: pal,
    theme: (dark ? "dark" : "light") as "dark" | "light",
    formatY: fmtY,
    formatValue: fmtV,
    onHover: (i: number | null) => setHover(i),
    title: set.label,
  };
  const key = [kind, ds, smooth, gradient, stacked, paletteId, dark].join("-");
  const chart =
    kind === "area" ? (
      <AreaChart key={key} {...common} smooth={smooth} gradient={gradient} stacked={stacked} />
    ) : kind === "line" ? (
      <LineChart key={key} {...common} smooth={smooth} />
    ) : (
      <BarChart key={key} {...common} stacked={stacked} />
    );

  const code = useMemo(() => {
    const comp = kind === "area" ? "AreaChart" : kind === "line" ? "LineChart" : "BarChart";
    const lines = [`<${comp}`, `  data={${ds}}`, `  xKey="${set.xKey}"`];
    lines.push(`  series={[${set.series.map((s) => `"${s.key}"`).join(", ")}]}`);
    if (smooth && kind !== "bar") lines.push("  smooth");
    if (kind === "area" && !gradient) lines.push("  gradient={false}");
    if (stacked && kind !== "line") lines.push("  stacked");
    if (pal) lines.push(`  colors={[${pal.map((c) => `"${c}"`).join(", ")}]}`);
    if (dark) lines.push('  theme="dark"');
    lines.push("/>");
    return `import { ${comp} } from "@taruns123/charts-react";\n\n` + lines.join("\n");
  }, [kind, ds, smooth, gradient, stacked, pal, dark, set]);

  const hovered = hover !== null ? (set.data as any[])[hover] : null;

  return (
    <section className="section section-alt" id="playground">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">Playground</span>
          <h2>Try every prop, see the code.</h2>
          <p>Flip the switches; the component re-renders and the snippet below updates to match.</p>
        </div>
        <div className="pg">
          <aside className="pg-controls" aria-label="Chart options">
            <fieldset>
              <legend>Chart type</legend>
              <div className="seg seg-lg">
                {(["area", "line", "bar"] as Kind[]).map((k) => (
                  <button key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)} aria-pressed={kind === k}>
                    {k[0].toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
            </fieldset>
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
            <fieldset>
              <legend>Options</legend>
              <Toggle label="Smooth curve" on={smooth} set={setSmooth} disabled={kind === "bar"} />
              <Toggle label="Gradient fill" on={gradient} set={setGradient} disabled={kind !== "area"} />
              <Toggle label="Stacked" on={stacked} set={setStacked} disabled={kind === "line"} />
              <Toggle label="Dark theme" on={dark} set={setDark} />
            </fieldset>
            <fieldset>
              <legend>Palette</legend>
              <div className="pal-list">
                {Object.entries(palettes).map(([id, p]) => {
                  const cs = p.colors || (dark ? darkPalette : lightPalette).slice(0, 3);
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
                  <div className="card-title">{set.label}</div>
                  <div className="card-sub">
                    {hovered ? (
                      <>
                        Hovering <strong>{String(hovered[set.xKey])}</strong> ·{" "}
                        {set.series.map((s, i) => (
                          <span key={s.key} className="hover-val">
                            <i style={{ background: swatches[i] }} />
                            {set.currency ? usd(hovered[s.key]) : hovered[s.key].toLocaleString()}
                          </span>
                        ))}
                      </>
                    ) : (
                      "Hover the chart, or focus it and use ← →"
                    )}
                  </div>
                </div>
                <span className="pill pill-soft">onHover</span>
              </div>
              {chart}
            </div>
            <Code code={code} label="Playground.tsx" />
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

const props: [string, string, string, string][] = [
  ["data", "Datum[]", "—", "Array of records, one per x position."],
  ["xKey", "string", "—", "Key holding the category / time value."],
  ["series", "(string | SeriesConfig)[]", "numeric keys", "Which keys to plot, with optional label and colour."],
  ["height", "number", "280", "Plot height in px. Width follows the container."],
  ["smooth", "boolean", "false", "Monotone cubic curve (line & area)."],
  ["gradient", "boolean", "true", "Vertical gradient fill (area)."],
  ["stacked", "boolean", "false", "Stack series (area & bar)."],
  ["colors", "string[]", "palette", "Replace the categorical palette."],
  ["theme", '"light" | "dark"', '"light"', "Axis, grid, tooltip and palette steps."],
  ["formatY / formatValue", "(v) => string", "compact", "Axis tick and tooltip formatting."],
  ["showTooltip / showCrosshair", "boolean", "true", "Hover layer."],
  ["animate", "boolean", "true", "Entry animation; honours reduced motion."],
  ["onHover", "(i, datum) => void", "—", "Sync other UI with the hovered point."],
];

function Install() {
  return (
    <section className="section" id="install">
      <div className="wrap install-grid">
        <div>
          <span className="kicker">Get started</span>
          <h2>Install in a minute.</h2>
          <ol className="steps">
            <li>
              <span>1</span>
              <div>
                <h4>Add the package</h4>
                <p>React 16.8+ is the only peer dependency.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h4>Pass data and keys</h4>
                <p>Plain arrays of objects — no special data structures.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h4>Customise when you need to</h4>
                <p>Everything else is an optional prop with a considered default.</p>
              </div>
            </li>
          </ol>
        </div>
        <div className="install-code">
          <Code label="Terminal" code={`npm install @taruns123/charts-react`} />
          <Code
            label="Dashboard.tsx"
            code={`import { LineChart } from "@taruns123/charts-react";

const data = [
  { month: "Jan", signups: 412 },
  { month: "Feb", signups: 438 },
  { month: "Mar", signups: 455 },
];

export function Dashboard() {
  return <LineChart data={data} xKey="month" smooth />;
}`}
          />
        </div>
      </div>
      <div className="wrap">
        <h3 className="props-title">Props</h3>
        <div className="props-scroll">
          <table className="props">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {props.map(([p, t, d, desc]) => (
                <tr key={p}>
                  <td>
                    <code>{p}</code>
                  </td>
                  <td>
                    <code className="type">{t}</code>
                  </td>
                  <td>
                    <code className="muted">{d}</code>
                  </td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="brand">
          <Logo />
          <span>T-Charts</span>
        </div>
        <span className="muted">Open source · ISC licence · Built by Tarun Shetty</span>
        <a href={GITHUB}>github.com/Taruns123/charts-react</a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Gallery />
        <Playground />
        <Install />
      </main>
      <Footer />
    </>
  );
}
