import type { ReactNode } from "react";
import { AreaChart, BarChart, ComboChart, DonutChart, Gauge, LineChart, PieChart, ReferenceLine, ScatterChart, Sparkline } from "t-charts";
import {
  accounts,
  activeUsers,
  bookings,
  cashFlow,
  cloudSpend,
  datasets,
  kpis,
  mrr,
  pct,
  planRevenue,
  regionalSales,
  revenueMargin,
  revenueMix,
  signups,
  trafficSources,
  usd,
  usdCompact,
  usdK,
} from "./data";

const signupSeries = datasets.signups.series as any;
const regionSeries = datasets.regional.series as any;
const mixSeries = [
  { key: "subscriptions", label: "Subscriptions" },
  { key: "services", label: "Services" },
  { key: "addons", label: "Add-ons" },
];

function Tile({ label, note, children, span, dark, id }: { label: string; note?: string; children: ReactNode; span?: 2 | 3; dark?: boolean; id?: string }) {
  return (
    <figure className={"tile" + (span ? " span-" + span : "") + (dark ? " tile-dark" : "")} id={id}>
      <figcaption>
        <span className="tile-label">{label}</span>
        {note && <code className="tile-note">{note}</code>}
      </figcaption>
      {children}
    </figure>
  );
}

function Group({ id, name, comp, blurb, children, cols = 3 }: { id: string; name: string; comp: string; blurb: string; children: ReactNode; cols?: 2 | 3 | 4 }) {
  return (
    <section className="group" id={id} aria-labelledby={id + "-h"}>
      <div className="group-head">
        <h3 id={id + "-h"}>{name}</h3>
        <code className="group-comp">{comp}</code>
        <p>{blurb}</p>
      </div>
      <div className={"tiles cols-" + cols}>{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  delta,
  good,
  children,
  dark,
}: {
  label: string;
  value: string;
  delta: string;
  good: boolean;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={"kpi" + (dark ? " kpi-dark" : "")}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className={"kpi-delta " + (good ? "good" : "bad")}>{delta}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-spark">{children}</div>
      <div className="kpi-foot">Last 30 days</div>
    </div>
  );
}

const thresholds = [
  { value: 0, color: "#e34948", label: "Off track" },
  { value: 50, color: "#eda100", label: "At risk" },
  { value: 80, color: "#1baf7a", label: "On track" },
];
const thresholdsDark = [
  { value: 0, color: "#e66767", label: "Off track" },
  { value: 50, color: "#c98500", label: "At risk" },
  { value: 80, color: "#199e70", label: "On track" },
];

const nav = [
  ["c-line", "Line"],
  ["c-area", "Area"],
  ["c-bar", "Bar"],
  ["c-combo", "Combo"],
  ["c-scatter", "Scatter"],
  ["c-pie", "Pie & donut"],
  ["c-spark", "Sparkline"],
  ["c-gauge", "Gauge"],
  ["c-theme", "Light & dark"],
];

export default function AllCharts() {
  const last = (a: number[]) => a[a.length - 1];
  return (
    <section className="section all" id="charts">
      <div className="wrap">
        <div className="section-head">
          <span className="kicker">All charts</span>
          <h2>Nine components, every option side by side.</h2>
          <p>
            Each tile is a live component. Hover or tab into any of them; click legend entries to toggle series. The grey
            caption is the prop that makes the difference.
          </p>
        </div>
        <nav className="chips" aria-label="Chart types">
          {nav.map(([id, label]) => (
            <a key={id} href={"#" + id}>
              {label}
            </a>
          ))}
        </nav>

        <Group id="c-line" name="Line" comp="<LineChart>" blurb="Trends over an ordered axis. Straight or monotone-smooth, with optional dots, guide lines and point annotations.">
          <Tile label="Straight" note="smooth={false}">
            <LineChart data={signups} xKey="week" series={signupSeries} height={210} showLegend={false} title="Weekly signups, straight lines" />
          </Tile>
          <Tile label="Smooth" note="smooth">
            <LineChart data={signups} xKey="week" series={signupSeries} smooth height={210} showLegend={false} title="Weekly signups, smooth lines" />
          </Tile>
          <Tile label="Reference line + annotation" note="<ReferenceLine y={…} />">
            <LineChart
              data={mrr}
              xKey="month"
              series={[{ key: "mrr", label: "MRR" }]}
              smooth
              showDots
              height={210}
              formatY={usdCompact}
              formatValue={usd}
              annotations={[{ x: "Aug", label: "Pricing v2" }]}
              title="MRR with goal and launch annotation"
            >
              <ReferenceLine y={50000} label="Goal $50K" color="#d9400c" labelPosition="start" />
            </LineChart>
          </Tile>
        </Group>

        <Group id="c-area" name="Area" comp="<AreaChart>" blurb="Volume under a trend. Gradient or flat fills; stacked to show how parts build a total.">
          <Tile label="Gradient" note="gradient">
            <AreaChart data={mrr} xKey="month" series={[{ key: "mrr", label: "MRR" }]} smooth height={210} formatY={usdCompact} formatValue={usd} title="MRR, gradient fill" />
          </Tile>
          <Tile label="Flat fill, overlapping" note="gradient={false}">
            <AreaChart data={activeUsers} xKey="day" series={datasets.users.series as any} gradient={false} height={210} showLegend={false} title="Daily active users, flat fill" />
          </Tile>
          <Tile label="Stacked" note="stacked">
            <AreaChart data={activeUsers} xKey="day" series={datasets.users.series as any} stacked smooth height={210} showLegend={false} title="Daily active users, stacked" />
          </Tile>
        </Group>

        <Group id="c-bar" name="Bar" comp="<BarChart>" blurb="Compare categories. Grouped side by side, stacked to a total, and diverging below zero.">
          <Tile label="Grouped" note="stacked={false}">
            <BarChart data={regionalSales} xKey="quarter" series={regionSeries} height={210} showLegend={false} formatY={usdCompact} formatValue={usd} title="Sales by region, grouped" />
          </Tile>
          <Tile label="Stacked" note="stacked">
            <BarChart data={revenueMix} xKey="month" series={mixSeries} stacked height={210} showLegend={false} formatY={usdK} formatValue={usdK} title="Revenue mix, stacked" />
          </Tile>
          <Tile label="Negative values + zero line" note="colors={[…]}">
            <BarChart
              data={cashFlow}
              xKey="month"
              series={[{ key: "net", label: "Net cash flow" }]}
              height={210}
              radius={3}
              formatY={usdK}
              formatValue={usdK}
              colors={["#1baf7a"]}
              title="Monthly net cash flow"
            >
              <ReferenceLine y={10} label="Avg $11K" />
            </BarChart>
          </Tile>
        </Group>

        <Group id="c-combo" name="Combo" comp="<ComboChart>" blurb="Bars and lines on one x axis. Give a series its own right-hand axis when the units differ." cols={2}>
          <Tile label="Bars + line, dual axis" note={'axis: "right"'} id="tile-combo">
            <ComboChart
              data={revenueMargin}
              xKey="month"
              series={[
                { key: "revenue", label: "Revenue", type: "bar" },
                { key: "margin", label: "Gross margin", type: "line", axis: "right" },
              ]}
              smooth
              height={232}
              formatY={usdK}
              formatYRight={pct}
              formatValue={(v, k) => (k === "margin" ? (v * 100).toFixed(0) + "%" : "$" + v + "K")}
              title="Revenue and gross margin"
            />
          </Tile>
          <Tile label="Stacked bars + target line" note={'type: "line", stacked'}>
            <ComboChart
              data={bookings}
              xKey="month"
              series={[
                { key: "fresh", label: "New", type: "bar" },
                { key: "expansion", label: "Expansion", type: "bar" },
                { key: "target", label: "Target", type: "line", color: "#111110" },
              ]}
              stacked
              showDots={false}
              height={232}
              formatY={usdK}
              formatValue={usdK}
              title="Bookings vs target"
            />
          </Tile>
        </Group>

        <Group id="c-scatter" name="Scatter & bubble" comp="<ScatterChart>" blurb="Two measures per record. Colour by group, size by a third value, split into quadrants." cols={2}>
          <Tile label="Grouped scatter + reference lines" note="groupKey">
            <ScatterChart
              data={accounts}
              xKey="adoption"
              yKey="retention"
              groupKey="plan"
              labelKey="name"
              xLabel="Feature adoption"
              yLabel="12-mo retention"
              formatX={(v) => v + "%"}
              formatY={(v) => v + "%"}
              height={272}
              referenceLines={[{ y: 75, label: "Retention target" }]}
              title="Adoption vs retention by plan"
            />
          </Tile>
          <Tile label="Bubble + quadrants" note="sizeKey, quadrants" id="tile-bubble">
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
              quadrants={{ x: 50, y: 75, labels: ["Champions", "Loyal, under-using", "At risk", "Exploring"] }}
              showLegend={false}
              height={272}
              title="Accounts by adoption, retention and ARR"
            />
          </Tile>
        </Group>

        <Group id="c-pie" name="Pie & donut" comp="<DonutChart> <PieChart>" blurb="Parts of a whole. Hover a segment to pop it out; the donut's centre follows the pointer and keyboard.">
          <Tile label="Donut + legend" note="legendValue='both'" span={2} id="tile-donut">
            <DonutChart
              data={planRevenue}
              nameKey="plan"
              valueKey="revenue"
              height={230}
              legendValue="both"
              formatValue={(v) => usdCompact(v)}
              centerLabel="Revenue"
              title="Revenue by plan"
            />
          </Tile>
          <Tile label="Pie, legend below" note="<PieChart>">
            <PieChart data={trafficSources} nameKey="source" valueKey="sessions" height={170} legendPosition="bottom" title="Sessions by source" />
          </Tile>
          <Tile label="Rounded, no legend" note="cornerRadius={6}">
            <DonutChart data={planRevenue} nameKey="plan" valueKey="revenue" cornerRadius={6} padAngle={3} innerRadius={0.7} showLegend={false} height={200} formatValue={(v) => usdCompact(v)} title="Revenue by plan, rounded" />
          </Tile>
          <Tile label="Half donut" note="startAngle={-90} endAngle={90}">
            <DonutChart
              data={cloudSpend}
              nameKey="service"
              valueKey="cost"
              startAngle={-90}
              endAngle={90}
              innerRadius={0.68}
              cornerRadius={4}
              height={130}
              legendPosition="bottom"
              legendValue="none"
              formatValue={(v) => usdCompact(v)}
              centerLabel="Cloud spend"
              title="Cloud spend by service"
            />
          </Tile>
          <Tile label="Thin ring, sorted" note="innerRadius={0.82} sort">
            <DonutChart data={trafficSources} nameKey="source" valueKey="sessions" innerRadius={0.82} padAngle={2.5} sort legendPosition="bottom" legendValue="none" height={170} centerLabel="Sessions" title="Sessions by source, ring" />
          </Tile>
        </Group>

        <Group id="c-spark" name="Sparklines in KPI cards" comp="<Sparkline>" blurb="Word-sized trends with no axes. Mark the min, max or last point; add a dashed target; use bars for counts." cols={4}>
          <Kpi label="MRR" value={usd(last(kpis.mrr))} delta="▲ 12.4%" good>
            <Sparkline data={kpis.mrr} type="area" height={44} formatValue={usd} title="MRR, last 30 days" />
          </Kpi>
          <Kpi label="Active users" value={last(kpis.active).toLocaleString()} delta="▲ 6.1%" good>
            <Sparkline data={kpis.active} markers height={44} color="#4a3aa7" title="Active users, last 30 days" />
          </Kpi>
          <Kpi label="Churn" value={last(kpis.churn).toFixed(2) + "%"} delta="▼ 0.6pt" good>
            <Sparkline data={kpis.churn} height={44} color="#eb6834" referenceValue={2.5} markers={["max", "last"]} formatValue={(v) => v.toFixed(2) + "%"} title="Churn, last 30 days" />
          </Kpi>
          <Kpi label="Daily signups" value={String(last(kpis.signups))} delta="▼ 3.2%" good={false}>
            <Sparkline data={kpis.signups} type="bar" height={44} color="#1baf7a" markers={["max", "last"]} referenceValue={150} title="Daily signups, last 30 days" />
          </Kpi>
        </Group>

        <Group id="c-gauge" name="Gauge" comp="<Gauge>" blurb="One number against its range and a target. Threshold bands colour the arc by status." cols={4}>
          <Tile label="Off track">
            <Gauge value={34} target={80} label="Q3 quota" thresholds={thresholds} formatValue={(v) => v + "%"} height={180} title="Q3 quota attainment" />
          </Tile>
          <Tile label="At risk">
            <Gauge value={68} target={80} label="Q3 quota" thresholds={thresholds} formatValue={(v) => v + "%"} height={180} title="Q3 quota attainment" />
          </Tile>
          <Tile label="On track">
            <Gauge value={92} target={80} label="Q3 quota" thresholds={thresholds} formatValue={(v) => v + "%"} height={180} title="Q3 quota attainment" />
          </Tile>
          <Tile label="Full ring" note="arc={360}">
            <Gauge value={7.4} max={10} arc={360} label="CSAT" color="#4a3aa7" formatValue={(v) => v.toFixed(1)} height={180} title="Customer satisfaction" />
          </Tile>
        </Group>

        <Group id="c-theme" name="Light & dark" comp={'theme="dark"'} blurb="Every component takes theme. The dark palette is stepped for dark surfaces, not inverted." cols={2}>
          <Tile label="Light" note={'theme="light"'}>
            <AreaChart data={signups} xKey="week" series={signupSeries} smooth height={230} title="Signups, light theme" />
          </Tile>
          <Tile label="Dark" note={'theme="dark"'} dark>
            <AreaChart data={signups} xKey="week" series={signupSeries} smooth height={230} theme="dark" title="Signups, dark theme" />
          </Tile>
        </Group>

        <div className="dark-dash" id="dark-dash">
          <div className="dark-dash-head">
            <div>
              <div className="card-title">Acme Cloud · Operations</div>
              <div className="card-sub">A dark dashboard built only from T-Charts components</div>
            </div>
            <span className="pill pill-dark">theme="dark"</span>
          </div>
          <div className="dd-kpis">
            <Kpi label="MRR" value={usd(last(kpis.mrr))} delta="▲ 12.4%" good dark>
              <Sparkline data={kpis.mrr} type="area" height={40} theme="dark" formatValue={usd} title="MRR" />
            </Kpi>
            <Kpi label="Active users" value={last(kpis.active).toLocaleString()} delta="▲ 6.1%" good dark>
              <Sparkline data={kpis.active} height={40} theme="dark" markers color="#9085e9" title="Active users" />
            </Kpi>
            <Kpi label="Daily signups" value={String(last(kpis.signups))} delta="▼ 3.2%" good={false} dark>
              <Sparkline data={kpis.signups} type="bar" height={40} theme="dark" color="#199e70" markers={["max", "last"]} title="Daily signups" />
            </Kpi>
            <div className="kpi kpi-dark kpi-gauge">
              <Gauge value={68} target={80} label="Q3 quota" thresholds={thresholdsDark} theme="dark" formatValue={(v) => v + "%"} height={150} title="Q3 quota" />
            </div>
          </div>
          <div className="dd-grid">
            <div className="dd-card">
              <div className="dd-title">Revenue &amp; margin</div>
              <ComboChart
                data={revenueMargin}
                xKey="month"
                series={[
                  { key: "revenue", label: "Revenue", type: "bar" },
                  { key: "margin", label: "Gross margin", type: "line", axis: "right" },
                ]}
                theme="dark"
                smooth
                height={240}
                formatY={usdK}
                formatYRight={pct}
                formatValue={(v, k) => (k === "margin" ? (v * 100).toFixed(0) + "%" : "$" + v + "K")}
                title="Revenue and gross margin, dark"
              />
            </div>
            <div className="dd-card">
              <div className="dd-title">Revenue by plan</div>
              <DonutChart data={planRevenue} nameKey="plan" valueKey="revenue" theme="dark" height={200} legendPosition="bottom" formatValue={(v) => usdCompact(v)} centerLabel="Revenue" cornerRadius={3} title="Revenue by plan, dark" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
