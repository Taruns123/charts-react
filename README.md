# T-Charts

Small, accessible SVG charts for React: line, area, bar, combo, scatter, pie, donut, sparkline and gauge.

- **Pure SVG, no runtime dependencies.** React is the only peer dependency.
- **Truthful smoothing.** Monotone cubic curves never overshoot a peak or dip below zero.
- **Accessible by default.** Every chart has a title and description, a visually hidden data table, and keyboard navigation.
- **Responsive.** Charts measure their container with `ResizeObserver`; pass `width` only if you want a fixed one.
- **Themeable.** `theme="light" | "dark"`, a colour-blind-aware categorical palette, or your own `colors`.
- **Typed.** Written in TypeScript; every prop is documented in the bundled `.d.ts`.

The docs site with live examples, an "All charts" gallery and a playground lives in [`docs/`](docs).

## Install

```bash
npm install @taruns123/charts-react
```

The package is published to GitHub Packages, so add the scope to your `.npmrc` first:

```
@taruns123:registry=https://npm.pkg.github.com
```

Requires React 16.8 or newer.

## Quick start

```tsx
import { LineChart } from "@taruns123/charts-react";

const data = [
  { month: "Jan", signups: 412, paid: 188 },
  { month: "Feb", signups: 438, paid: 205 },
  { month: "Mar", signups: 455, paid: 172 },
];

export function Dashboard() {
  return <LineChart data={data} xKey="month" series={["signups", "paid"]} smooth />;
}
```

Data is a plain array of objects. `xKey` names the category / time field; `series` names the numeric fields to plot (or omit it to plot every numeric field). Series entries can be strings or `{ key, label, color }` objects.

## Components

| Component | Use it for |
| --- | --- |
| [`LineChart`](#linechart) | Trends over time |
| [`AreaChart`](#areachart) | Volume and composition over time |
| [`BarChart`](#barchart) | Comparing categories |
| [`ComboChart`](#combochart) | Bars and lines together, optionally on two y axes |
| [`ScatterChart`](#scatterchart) | Relationships between two measures, bubbles, quadrants |
| [`PieChart` / `DonutChart`](#piechart--donutchart) | Parts of a whole |
| [`Sparkline`](#sparkline) | Word-sized trends in KPI cards and tables |
| [`Gauge`](#gauge) | One KPI against a range and a target |
| [`Legend`](#legend) | Toggleable series legend (used by every chart; usable on its own) |
| [`ReferenceLine`](#reference-lines-and-annotations) | Targets, averages and events on cartesian charts |

### Shared props

Every component accepts these:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | container width | Fixed width in px. |
| `height` | `number` | varies | Height in px of the plot. |
| `theme` | `"light" \| "dark"` | `"light"` | Axis, grid, label, tooltip and palette steps. |
| `colors` | `string[]` | built-in palette | Replaces the categorical palette (not on `Sparkline` / `Gauge`, which take `color`). |
| `animate` | `boolean` | `true` | Entry animation. Always skipped under `prefers-reduced-motion`. |
| `showTooltip` | `boolean` | `true` | Hover / keyboard tooltip. |
| `title` | `string` | generated | Accessible name. |
| `description` | `string` | generated | Accessible description (a summary is generated when omitted). |
| `className`, `style` | | | Applied to the root element. |

Charts with a legend (`LineChart`, `AreaChart`, `BarChart`, `ComboChart`, `ScatterChart`, `PieChart`, `DonutChart`) also take:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `showLegend` | `boolean` | 2+ series | Show the legend. |
| `legendToggle` | `boolean` | `true` | Clicking a legend entry hides / shows that series. The last visible series cannot be hidden. |
| `defaultHiddenSeries` | `string[]` | `[]` | Keys hidden on first render. |
| `hiddenSeries` | `string[]` | | Controlled hidden keys; pair with `onLegendToggle`. |
| `onLegendToggle` | `(key, hidden) => void` | | Called with the clicked key and the next hidden list. |

### Cartesian props (`LineChart`, `AreaChart`, `BarChart`, `ComboChart`)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Datum[]` | required | One record per x position. |
| `xKey` | `string` | required | Key holding the x (category / time) value. |
| `series` | `(string \| SeriesConfig)[]` | numeric keys | Series to plot: `{ key, label?, color? }`. |
| `height` | `number` | `280` | Plot height in px (legend excluded). |
| `showGrid` | `boolean` | `true` | Horizontal grid lines. |
| `showCrosshair` | `boolean` | `true` | Vertical crosshair on hover (line & area). |
| `yDomain` | `[number, number]` | nice domain | Force the y domain. |
| `yTickCount` | `number` | `5` | Approximate number of y ticks. |
| `formatX` | `(value, index) => string` | `String` | x axis labels and tooltip title. |
| `formatY` | `(value) => string` | compact (`12.9K`) | y axis ticks. |
| `formatValue` | `(value, seriesKey) => string` | `1,284` | Tooltip and data-table values. |
| `referenceLines` | `ReferenceLineConfig[]` | | Guide lines, see below. |
| `annotations` | `AnnotationConfig[]` | | Labelled markers on points, see below. |
| `onHover` | `(index, datum) => void` | | Called as the pointer or keyboard moves (`null` on leave). |

#### LineChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `smooth` | `boolean` | `false` | Monotone cubic smoothing (never overshoots). |
| `strokeWidth` | `number` | `2` | Line width. |
| `showDots` | `boolean` | `false` | Dot on every point. |
| `showEndDot` | `boolean` | `true` | Dot on the last point. |
| `zeroBaseline` | `boolean` | `true` | Include zero in the y domain. |

#### AreaChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `smooth` | `boolean` | `false` | Monotone smoothing. |
| `gradient` | `boolean` | `true` | Vertical gradient (true) or flat wash. |
| `fillOpacity` | `number` | `0.28` / `0.12` | Opacity at the top of the fill (lighter when areas overlap). |
| `stacked` | `boolean` | `false` | Stack series. |
| `strokeWidth` | `number` | `2` | Outline width. |

#### BarChart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stacked` | `boolean` | `false` | Stack instead of grouping. Negative values stack downward from zero. |
| `radius` | `number` | `4` | Corner radius of the bar's data end. |
| `maxBarWidth` | `number` | `28` | Maximum bar thickness in px. |

#### ComboChart

```tsx
<ComboChart
  data={revenueMargin}
  xKey="month"
  series={[
    { key: "revenue", label: "Revenue", type: "bar" },
    { key: "margin", label: "Gross margin", type: "line", axis: "right" },
  ]}
  formatY={(v) => "$" + v + "K"}
  formatYRight={(v) => Math.round(v * 100) + "%"}
/>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `series` | `(string \| ComboSeriesConfig)[]` | required | Adds `type: "bar" \| "line" \| "area"` (default `"bar"`) and `axis: "left" \| "right"` (default `"left"`). |
| `stacked` | `boolean` | `false` | Stack bar series that share an axis. |
| `smooth` | `boolean` | `false` | Smooth line / area series. |
| `showDots` | `boolean` | `true` | Dots on line series. |
| `yDomainRight` | `[number, number]` | aligned to the left grid | Force the right axis domain. |
| `formatYRight` | `(value) => string` | `formatY` | Right axis ticks. |
| `radius`, `maxBarWidth`, `strokeWidth` | | | As on `BarChart` / `LineChart`. |

When a right axis is present its ticks are chosen to land on the left axis' grid lines, so the chart keeps a single grid.

#### Reference lines and annotations

```tsx
<LineChart data={mrr} xKey="month" series={["mrr"]} annotations={[{ x: "Aug", label: "Pricing v2" }]}>
  <ReferenceLine y={50000} label="Goal $50K" />
  <ReferenceLine x="Mar" label="Launch" />
</LineChart>
```

`ReferenceLine` children and the `referenceLines` prop are equivalent. Lines always fit inside the y domain.

| `ReferenceLineConfig` | Type | Default | Description |
| --- | --- | --- | --- |
| `y` | `number` | | Horizontal line at this value. |
| `x` | `string \| number` | | Vertical line at this x value (or index). On `ScatterChart`, a numeric position. |
| `label` | `string` | | Label at the end of the line. |
| `color` | `string` | theme | Line and label colour. |
| `dashed` | `boolean` | `true` | Dashed or solid. |
| `axis` | `"left" \| "right"` | `"left"` | Axis for `y` on a `ComboChart`. |
| `labelPosition` | `"start" \| "end"` | `"end"` | Where the label sits. |

| `AnnotationConfig` | Type | Description |
| --- | --- | --- |
| `x` | `string \| number` | x value (or index) of the point. |
| `label` | `string` | Text in the callout. |
| `seriesKey` | `string` | Series to anchor to (default: first visible). |
| `y` | `number` | Explicit y instead of a series value. |
| `color` | `string` | Callout colour. |

### ScatterChart

```tsx
<ScatterChart
  data={accounts}
  xKey="adoption"
  yKey="retention"
  sizeKey="arr"
  groupKey="plan"
  labelKey="name"
  quadrants={{ x: 50, y: 75, labels: ["Champions", "Loyal, under-using", "At risk", "Exploring"] }}
/>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Datum[]` | required | One record per point. |
| `xKey`, `yKey` | `string` | required | Numeric keys for position. |
| `sizeKey` | `string` | | Numeric key mapped to bubble **area** (sqrt scale). |
| `groupKey` | `string` | | Category key: one colour and legend entry per group. |
| `labelKey` | `string` | | Tooltip title and table row header. |
| `xLabel`, `yLabel`, `sizeLabel` | `string` | the keys | Axis titles and tooltip labels. |
| `pointRadius` | `number` | `5` | Radius without `sizeKey`. |
| `sizeRange` | `[number, number]` | `[4, 24]` | Min / max bubble radius. |
| `fillOpacity` | `number` | `0.75` / `0.55` | Point fill opacity. |
| `xDomain`, `yDomain` | `[number, number]` | nice domains | Force the domains. |
| `xTickCount`, `yTickCount` | `number` | `6`, `5` | Approximate tick counts. |
| `quadrants` | `{ x, y, labels? }` | | Quadrant split with corner labels `[top-right, top-left, bottom-left, bottom-right]`. |
| `referenceLines` | `ReferenceLineConfig[]` | | Guide lines (`x` is numeric). |
| `formatX`, `formatY`, `formatSize` | `(v) => string` | | Formatting. |
| `onHover` | `(index, datum) => void` | | `index` refers to the original `data` array. |

Hover snaps to the nearest point; arrow keys walk the points from left to right.

### PieChart / DonutChart

```tsx
<DonutChart data={planRevenue} nameKey="plan" valueKey="revenue" legendValue="both" centerLabel="Revenue" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Datum[]` | required | One record per segment (a `color` field overrides the palette). |
| `nameKey`, `valueKey` | `string` | required | Segment name and numeric value. |
| `innerRadius` | `number` (0–0.95) | `0` pie / `0.64` donut | Hole size as a fraction of the radius. |
| `padAngle` | `number` (degrees) | `1` / `1.6` | Gap between segments (parallel-sided). |
| `cornerRadius` | `number` (px) | `0` | Rounded segment corners. |
| `startAngle`, `endAngle` | `number` (degrees) | `0`, `360` | Sweep; `-90` / `90` gives a half donut. |
| `popOut` | `number` (px) | `6` | How far the active segment slides out. |
| `centerLabel`, `centerValue` | `ReactNode` | `"Total"`, total | Donut centre (replaced by the active segment while hovering). |
| `showLegend` | `boolean` | `true` | Legend with values. |
| `legendPosition` | `"auto" \| "right" \| "bottom"` | `"auto"` | `auto` puts it beside the chart when there is room. |
| `legendValue` | `"percent" \| "value" \| "both" \| "none"` | `"percent"` | What each legend entry shows. |
| `sort` | `boolean` | `false` | Largest segment first. |
| `showTooltip` | `boolean` | `true` pie / `false` donut | The donut centre already shows the active value. |
| `formatValue` | `(value, name) => string` | | Value formatting. |

### Sparkline

```tsx
<Sparkline data={[5, 9, 2, 7, 6]} markers referenceValue={6} />
<Sparkline data={daily} valueKey="signups" xKey="day" type="bar" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `number[] \| Datum[]` | required | Values, or records with `valueKey`. |
| `valueKey`, `xKey` | `string` | `"value"` | Value key, and the key naming each point in the tooltip. |
| `type` | `"line" \| "area" \| "bar"` | `"line"` | Mark type. |
| `height` | `number` | `36` | Height in px. Width fills the container unless `width` is set. |
| `color`, `negativeColor` | `string` | palette | Main colour; colour for values below 0 / `referenceValue`. |
| `markers` | `boolean \| ("min" \| "max" \| "first" \| "last")[]` | `["last"]` | Marked points; `true` = min, max and last. |
| `referenceValue` | `number` | | Dashed guide, e.g. a target. |
| `yDomain` | `[number, number]` | data extent | Share a scale across several sparklines. |
| `smooth` | `boolean` | `true` | Monotone smoothing. |
| `formatValue`, `formatX` | | | Tooltip formatting. |
| `onHover` | `(index, value) => void` | | |

### Gauge

```tsx
<Gauge
  value={68}
  target={80}
  label="Q3 quota"
  formatValue={(v) => v + "%"}
  thresholds={[
    { value: 0, color: "#e34948", label: "Off track" },
    { value: 50, color: "#eda100", label: "At risk" },
    { value: 80, color: "#1baf7a", label: "On track" },
  ]}
/>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | required | Current value (clamped to the range for drawing). |
| `min`, `max` | `number` | `0`, `100` | Range. |
| `target` | `number` | | Target marker across the arc. |
| `label` | `string` | | Text under the value. |
| `thresholds` | `{ value, color, label? }[]` | | Colour bands; the band containing `value` sets the arc colour and status text. |
| `color` | `string` | threshold / palette | Fill colour override. |
| `arc` | `number` (degrees) | `240` | Sweep; `360` draws a full ring. |
| `thickness` | `number` | 13% of radius | Band thickness. |
| `rounded` | `boolean` | `true` | Rounded arc ends. |
| `showMinMax` | `boolean` | `true` under 360° | Min / max labels. |
| `height` | `number` | `200` | Height in px. |
| `formatValue` | `(v) => string` | | Value, target and min / max formatting. |

### Legend

Every chart renders a `Legend`. Use it directly to drive several charts from one set of toggles:

```tsx
const [hidden, setHidden] = useState<string[]>([]);
const toggle = (key: string) => setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key]));

<Legend items={[{ key: "web", label: "Web", color: "#2a78d6" }, { key: "mobile", label: "Mobile", color: "#eb6834" }]} hidden={hidden} onToggle={toggle} />
<LineChart data={a} xKey="day" series={["web", "mobile"]} showLegend={false} hiddenSeries={hidden} />
<BarChart data={b} xKey="day" series={["web", "mobile"]} showLegend={false} hiddenSeries={hidden} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `{ key, label, color, value? }[]` | required | Entries. |
| `hidden` | `string[]` | `[]` | Keys drawn as hidden (struck through, hollow swatch). |
| `onToggle` | `(key) => void` | | Makes entries toggle buttons (`aria-pressed`). |
| `onHighlight` | `(key \| null) => void` | | Hover / focus of an entry. |
| `marker` | `"square" \| "line" \| "circle"` | `"square"` | Swatch shape. |
| `layout` | `"row" \| "column"` | `"row"` | Wrapping row, or a column with right-aligned values. |
| `theme` | `"light" \| "dark"` | `"light"` | |

## Theming

```tsx
<AreaChart data={data} xKey="week" theme="dark" />
<BarChart data={data} xKey="quarter" colors={["#0b6bcb", "#e0782f", "#7a5af5"]} />
```

- `theme="dark"` switches axis, grid, label and tooltip colours and uses a palette stepped for dark surfaces (not an inversion). The chart background stays transparent, so put it on your own dark surface.
- The default palette (`lightPalette`, `darkPalette`, exported) is ordered so neighbouring series stay distinguishable for common colour-vision deficiencies. Series take colours in order and keep them when others are hidden.
- `themes.light` / `themes.dark` expose the tokens (`text`, `muted`, `grid`, `axis`, `surface`, `tooltipBg`, `track`, `reference`, ...).
- Charts inherit `font-family` from their parent. All injected styles are scoped under `.tc-*` class names; set `--tc-focus` to change the keyboard focus ring colour.

## Accessibility

- Every chart root is focusable and labelled (`aria-label` from `title`, or a generated summary such as "Line chart of Organic, Paid across 12 points").
- The SVG has `role="img"` with `<title>` / `<desc>`.
- A visually hidden `<table>` repeats the data (with your formatters) for screen readers; it follows legend toggles.
- **Keyboard:** focus a chart, then `←` / `→` move between points (or segments / scatter points), `Home` / `End` jump to the ends, `Esc` clears. Pie and donut also accept `↑` / `↓`. The tooltip and `onHover` follow the keyboard exactly as they follow the pointer.
- Legend entries are real buttons with `aria-pressed`.
- `Gauge` renders `role="meter"` with `aria-valuenow` / `min` / `max` and a full `aria-valuetext` (value, target, % of target, status).
- Entry animations and transitions are disabled under `prefers-reduced-motion: reduce`.

## Bundle size

Measured with esbuild (minified + gzip, React external):

| Import | Size |
| --- | --- |
| Everything | ~16 KB |
| `LineChart` / `AreaChart` / `BarChart` | ~8.6 KB |
| `DonutChart` | ~6.1 KB |
| `Sparkline` | ~4.9 KB |

The package is marked `sideEffects: false`, so bundlers drop the components you do not import. Styles (~4.7 KB of CSS, included in the sizes above) are injected once at runtime; there is no CSS file to import.

## Development

```bash
npm install
npm run build        # rollup -> dist/ (cjs, esm, d.ts)
npm run typecheck    # tsc over src and tests
npm test             # vitest + Testing Library (jsdom)
npm --prefix docs install && npm run docs   # docs site on http://localhost:5302
```

## License

ISC
