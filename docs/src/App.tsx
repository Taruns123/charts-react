import { useState } from "react";
import { AreaChart, BarChart, ComboChart, DonutChart, LineChart, ScatterChart, Sparkline } from "t-charts";
import { Code } from "./Code";
import AllCharts from "./AllCharts";
import Playground from "./Playground";
import { accounts, activeUsers, datasets, kpis, mrr, pct, planRevenue, regionalSales, revenueMargin, revenueMix, signups, usd, usdCompact, usdK } from "./data";

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
          <a href="#charts">All charts</a>
          <a href="#gallery">Examples</a>
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

function Stat({ label, value, delta, up = true, good = true, spark }: { label: string; value: string; delta: string; up?: boolean; good?: boolean; spark?: React.ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-row">
        <div className="stat-value">{value}</div>
        {spark && <div className="stat-spark">{spark}</div>}
      </div>
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
            <span className="eyebrow-dot" /> New in v0.1: donut, scatter, combo, sparkline &amp; gauge
          </a>
          <h1>
            Charts that bend
            <br />
            to <em>your</em> data.
          </h1>
          <p className="lede">
            T-Charts is a small, dependency-free React library: line, area, bar, combo, scatter, pie and donut charts,
            plus sparklines and gauges. Pure SVG, responsive, keyboard accessible, and every default tuned so your first
            render already looks finished.
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
              <strong>~16 KB</strong> gzipped, all nine
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
            <Stat label="MRR" value="$61,840" delta="11.8%" spark={<Sparkline data={kpis.mrr} type="area" width={64} height={26} markers={false} showTooltip={false} title="MRR trend" />} />
            <Stat label="Active users" value="3,810" delta="6.4%" spark={<Sparkline data={kpis.active} width={64} height={26} color="#4a3aa7" showTooltip={false} title="Active users trend" />} />
            <Stat label="Churn" value="2.1%" delta="0.3pt" up={false} spark={<Sparkline data={kpis.churn} width={64} height={26} color="#eb6834" showTooltip={false} title="Churn trend" />} />
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
              <div className="mini-title">Revenue by plan</div>
              <DonutChart data={planRevenue} nameKey="plan" valueKey="revenue" height={130} legendPosition="right" legendValue="none" padAngle={2} formatValue={(v) => usdCompact(v)} centerLabel="Total" title="Revenue by plan" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  ["Nine components", "Line, area, bar, combo, scatter, pie, donut, sparkline and gauge, one consistent API."],
  ["Truthful smoothing", "Monotone cubic curves look soft but never overshoot a peak or dip below zero."],
  ["Tooltips & crosshair", "Hover, tap or arrow-key through points. Every series value for that x, at a glance."],
  ["Accessible by default", "role=img with titles, a screen-reader data table and full keyboard navigation."],
  ["Legends & guides", "Click legend entries to toggle series. Add reference lines, targets and point annotations."],
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
    id: "combo",
    title: "Combo with a second axis",
    blurb: "Revenue as bars, gross margin as a line on its own percentage axis. Both axes share one grid.",
    chart: (
      <ComboChart
        data={revenueMargin}
        xKey="month"
        series={[
          { key: "revenue", label: "Revenue", type: "bar" },
          { key: "margin", label: "Gross margin", type: "line", axis: "right" },
        ]}
        smooth
        height={260}
        formatY={usdK}
        formatYRight={pct}
        formatValue={(v, k) => (k === "margin" ? (v * 100).toFixed(0) + "%" : "$" + v + "K")}
        title="Revenue and gross margin"
      />
    ),
    code: `<ComboChart
  data={revenueMargin}
  xKey="month"
  series={[
    { key: "revenue", type: "bar" },
    { key: "margin", type: "line", axis: "right" },
  ]}
  formatYRight={(v) => v * 100 + "%"}
/>`,
  },
  {
    id: "donut",
    title: "Donut with legend",
    blurb: "Hover or arrow through segments: the hovered one pops out and the centre shows its value and share.",
    chart: <DonutChart data={planRevenue} nameKey="plan" valueKey="revenue" height={240} legendValue="both" formatValue={(v) => usdCompact(v)} centerLabel="Revenue" title="Revenue by plan" />,
    code: `<DonutChart
  data={planRevenue}
  nameKey="plan"
  valueKey="revenue"
  legendValue="both"
  centerLabel="Revenue"
/>`,
  },
  {
    id: "scatter",
    title: "Bubble scatter",
    blurb: "Adoption against retention for each account, sized by ARR and coloured by plan.",
    chart: (
      <ScatterChart
        data={accounts}
        xKey="adoption"
        yKey="retention"
        sizeKey="arr"
        groupKey="plan"
        labelKey="name"
        xLabel="Feature adoption"
        yLabel="12-mo retention"
        sizeLabel="ARR"
        formatX={(v) => v + "%"}
        formatY={(v) => v + "%"}
        formatSize={usd}
        height={280}
        title="Accounts by adoption, retention and ARR"
      />
    ),
    code: `<ScatterChart
  data={accounts}
  xKey="adoption"
  yKey="retention"
  sizeKey="arr"
  groupKey="plan"
  labelKey="name"
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
          <h2>Copy-paste examples.</h2>
          <p>Live components with realistic data and the code that renders them. Hover any chart, or tab to it and use the arrow keys.</p>
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

const components: [string, string, string][] = [
  ["LineChart", "Trends over time", "smooth, showDots, zeroBaseline"],
  ["AreaChart", "Volume and composition over time", "smooth, gradient, stacked"],
  ["BarChart", "Comparing categories", "stacked, radius, maxBarWidth"],
  ["ComboChart", "Bars + lines, two units", "series[].type, series[].axis, formatYRight"],
  ["ScatterChart", "Relationships, bubbles, quadrants", "yKey, sizeKey, groupKey, quadrants"],
  ["PieChart / DonutChart", "Parts of a whole", "nameKey, valueKey, padAngle, cornerRadius, centerValue"],
  ["Sparkline", "Inline trends in KPI cards and tables", "type, markers, referenceValue"],
  ["Gauge", "One KPI against a target", "value, target, thresholds, arc"],
  ["Legend / ReferenceLine", "Shared building blocks", "onToggle, hidden · y, x, label"],
];

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
  ["referenceLines", "ReferenceLineConfig[]", "—", "Targets, averages and events as dashed guide lines."],
  ["annotations", "AnnotationConfig[]", "—", "Labelled markers on individual points."],
  ["legendToggle", "boolean", "true", "Click legend entries to hide and show series."],
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
        <h3 className="props-title">Components</h3>
        <div className="props-scroll">
          <table className="props">
            <thead>
              <tr>
                <th>Component</th>
                <th>Use it for</th>
                <th>Key props</th>
              </tr>
            </thead>
            <tbody>
              {components.map(([c, use, keys]) => (
                <tr key={c}>
                  <td>
                    <code>{"<" + c + ">"}</code>
                  </td>
                  <td>{use}</td>
                  <td>
                    <code className="type">{keys}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="props-title props-title-2">Shared cartesian props</h3>
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
        <AllCharts />
        <Gallery />
        <Playground />
        <Install />
      </main>
      <Footer />
    </>
  );
}
