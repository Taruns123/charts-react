import type { CSSProperties, ReactNode } from "react";
import type { ChartTheme } from "./palette";

export type Datum = Record<string, any>;

export interface SeriesConfig {
  /** Key in each datum that holds this series' numeric value. */
  key: string;
  /** Human readable name used in the legend, tooltip and accessible table. */
  label?: string;
  /** Overrides the palette colour for this series. */
  color?: string;
}

/** Props every T-Charts component understands. */
export interface CommonChartProps {
  /** Fixed width in px. When omitted the chart fills its container and resizes with it. */
  width?: number;
  /** Height in px of the plot (legend excluded). */
  height?: number;
  /** Replaces the default palette. Series / segments take colours in order. */
  colors?: string[];
  /** Colour scheme for axes, grid, labels and tooltip. Default "light". */
  theme?: ChartTheme;
  /** Hover / keyboard tooltip. Default true. */
  showTooltip?: boolean;
  /** Entry animation (skipped automatically under prefers-reduced-motion). Default true. */
  animate?: boolean;
  /** Accessible title for the chart (rendered for screen readers). */
  title?: string;
  /** Longer accessible description. */
  description?: string;
  className?: string;
  style?: CSSProperties;
}

/** Props shared by charts that have a toggleable legend. */
export interface LegendToggleProps {
  /** Clicking a legend entry hides / shows that series. Default true. */
  legendToggle?: boolean;
  /** Series keys hidden on first render (uncontrolled). */
  defaultHiddenSeries?: string[];
  /** Controlled list of hidden series keys. Pair with `onLegendToggle`. */
  hiddenSeries?: string[];
  /** Called when a legend entry is clicked, with the key and the next hidden list. */
  onLegendToggle?: (key: string, hidden: string[]) => void;
}

/** A horizontal (y) or vertical (x) guide line, e.g. a target, average or launch date. */
export interface ReferenceLineConfig {
  /** Draw a horizontal line at this y value. */
  y?: number;
  /** Draw a vertical line at this x value (matched against `data[i][xKey]`; a number with no match is used as an index). */
  x?: string | number;
  /** Short label drawn at the end of the line. */
  label?: string;
  /** Line and label colour. Default: the theme's reference colour. */
  color?: string;
  /** Dashed (default) or solid. */
  dashed?: boolean;
  /** Which y axis a horizontal line belongs to (ComboChart). Default "left". */
  axis?: "left" | "right";
  /** Where the label sits along the line. Default "end". */
  labelPosition?: "start" | "end";
  strokeWidth?: number;
}

/** A labelled marker on one data point. */
export interface AnnotationConfig {
  /** x value (matched against `data[i][xKey]`) or index of the point. */
  x: string | number;
  /** y value. Default: the value of `seriesKey` (or the first visible series) at that x. */
  y?: number;
  seriesKey?: string;
  label: string;
  color?: string;
}

export interface BaseChartProps extends CommonChartProps, LegendToggleProps {
  /** Array of records, one per x position. */
  data: Datum[];
  /** Key holding the x (category / time) value of each datum. */
  xKey: string;
  /**
   * Series to plot. Strings are shorthand for `{ key }`. When omitted, every
   * numeric key except `xKey` is plotted.
   */
  series?: Array<string | SeriesConfig>;
  /** Horizontal grid lines. Default true. */
  showGrid?: boolean;
  /** Legend above the chart. Default: shown when there are 2+ series. */
  showLegend?: boolean;
  /** Vertical crosshair on hover (line & area). Default true. */
  showCrosshair?: boolean;
  /** Force the y domain instead of computing a nice one from the data. */
  yDomain?: [number, number];
  /** Approximate number of y ticks. Default 5. */
  yTickCount?: number;
  /** Formats x values on the axis and in the tooltip title. */
  formatX?: (value: any, index: number) => string;
  /** Formats y axis ticks. Default: compact (12.9K). */
  formatY?: (value: number) => string;
  /** Formats values in the tooltip. Default: full number with separators. */
  formatValue?: (value: number, seriesKey: string) => string;
  /** Horizontal / vertical guide lines (targets, averages, events). `<ReferenceLine>` children work too. */
  referenceLines?: ReferenceLineConfig[];
  /** Labelled markers on individual points. */
  annotations?: AnnotationConfig[];
  /** `<ReferenceLine />` elements. */
  children?: ReactNode;
  /** Called with the hovered index (or null) as the pointer / keyboard moves. */
  onHover?: (index: number | null, datum: Datum | null) => void;
}

export interface LineChartProps extends BaseChartProps {
  /** Monotone-cubic smoothing (never overshoots the data). Default false. */
  smooth?: boolean;
  /** Line width in px. Default 2. */
  strokeWidth?: number;
  /** Dot on every data point. Default false. */
  showDots?: boolean;
  /** Dot on the last point of each line. Default true. */
  showEndDot?: boolean;
  /** Start the y axis at zero. Default true. */
  zeroBaseline?: boolean;
}

export interface AreaChartProps extends BaseChartProps {
  smooth?: boolean;
  strokeWidth?: number;
  /** Vertical gradient fill (true) or a flat wash (false). Default true. */
  gradient?: boolean;
  /** Opacity at the top of the fill. Default 0.28 with gradient, 0.12 without. */
  fillOpacity?: number;
  /** Stack series on top of each other. Default false. */
  stacked?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  /** Stack series instead of grouping them side by side. Default false. */
  stacked?: boolean;
  /** Corner radius of the bar's data end. Default 4. */
  radius?: number;
  /** Maximum bar thickness in px. Default 28. */
  maxBarWidth?: number;
}

export interface ComboSeriesConfig extends SeriesConfig {
  /** How this series is drawn. Default "bar". */
  type?: "bar" | "line" | "area";
  /** Which y axis it is measured against. Default "left". */
  axis?: "left" | "right";
}

export interface ComboChartProps extends Omit<BaseChartProps, "series"> {
  /** Series with a mark type and axis each, e.g. `{ key: "revenue", type: "bar" }, { key: "margin", type: "line", axis: "right" }`. */
  series: Array<string | ComboSeriesConfig>;
  /** Monotone smoothing for line / area series. Default false. */
  smooth?: boolean;
  strokeWidth?: number;
  /** Stack bar series that share an axis. Default false. */
  stacked?: boolean;
  radius?: number;
  maxBarWidth?: number;
  /** Dot on every point of line series. Default true. */
  showDots?: boolean;
  /** Force the right axis domain. */
  yDomainRight?: [number, number];
  /** Formats right axis ticks. Default: `formatY`. */
  formatYRight?: (value: number) => string;
}

export interface ScatterChartProps extends CommonChartProps, LegendToggleProps {
  data: Datum[];
  /** Numeric key for the horizontal position. */
  xKey: string;
  /** Numeric key for the vertical position. */
  yKey: string;
  /** Numeric key mapped to bubble area (turns the scatter into a bubble chart). */
  sizeKey?: string;
  /** Categorical key: one colour and legend entry per group. */
  groupKey?: string;
  /** Key used as the tooltip title / table row header. */
  labelKey?: string;
  /** Axis names, shown in the tooltip and as axis titles. */
  xLabel?: string;
  yLabel?: string;
  sizeLabel?: string;
  /** Point radius when there is no `sizeKey`. Default 5. */
  pointRadius?: number;
  /** Min / max bubble radius in px. Default [4, 24]. */
  sizeRange?: [number, number];
  /** Fill opacity of points. Default 0.75 (0.55 for bubbles). */
  fillOpacity?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  xTickCount?: number;
  yTickCount?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  formatSize?: (value: number) => string;
  /** Splits the plot into four quadrants at (x, y) with optional corner labels [top-right, top-left, bottom-left, bottom-right]. */
  quadrants?: { x: number; y: number; labels?: [string, string, string, string] };
  /** Guide lines; `x` is a numeric position here. */
  referenceLines?: ReferenceLineConfig[];
  onHover?: (index: number | null, datum: Datum | null) => void;
  children?: ReactNode;
}

export interface PieChartProps extends CommonChartProps, LegendToggleProps {
  data: Datum[];
  /** Key holding each segment's name. */
  nameKey: string;
  /** Key holding each segment's numeric value. */
  valueKey: string;
  /** Hole size as a fraction of the radius, 0 (pie) to 0.95. Default 0 for PieChart, 0.64 for DonutChart. */
  innerRadius?: number;
  /** Gap between segments, in degrees. Default 1 (pie) / 1.6 (donut). */
  padAngle?: number;
  /** Rounded segment corners, in px. Default 0. */
  cornerRadius?: number;
  /** Start / end of the sweep in degrees clockwise from 12 o'clock. Default 0 / 360 (use -90 / 90 for a half donut). */
  startAngle?: number;
  endAngle?: number;
  /** How far the hovered segment slides out, in px. Default 6. */
  popOut?: number;
  /** Small label in the hole. Default "Total". */
  centerLabel?: ReactNode;
  /** Big value in the hole. Default: the formatted total. */
  centerValue?: ReactNode;
  /** Legend with values. Default true. */
  showLegend?: boolean;
  /** Legend placement; "auto" puts it beside the chart when there is room. Default "auto". */
  legendPosition?: "auto" | "right" | "bottom";
  /** What the legend shows next to each name. Default "percent". */
  legendValue?: "value" | "percent" | "both" | "none";
  /** Order segments largest first. Default false. */
  sort?: boolean;
  formatValue?: (value: number, name: string) => string;
  onHover?: (index: number | null, datum: Datum | null) => void;
}

export interface SparklineProps {
  /** Plain numbers, or records with `valueKey`. */
  data: Array<number | Datum>;
  valueKey?: string;
  /** Key used to name each point in the tooltip. */
  xKey?: string;
  /** Mark type. Default "line". */
  type?: "line" | "area" | "bar";
  /** Fixed width in px; fills its container when omitted. */
  width?: number;
  /** Height in px. Default 36. */
  height?: number;
  color?: string;
  /** Colour for negative bars / values below `referenceValue`. Default: the palette's red. */
  negativeColor?: string;
  theme?: ChartTheme;
  /** Monotone smoothing. Default true. */
  smooth?: boolean;
  strokeWidth?: number;
  /** Which points get a marker. `true` = min, max and last. Default ["last"]. */
  markers?: boolean | Array<"min" | "max" | "first" | "last">;
  /** Dashed guide line, e.g. a target or the previous period's average. */
  referenceValue?: number;
  /** Shared y domain, so several sparklines can be compared. */
  yDomain?: [number, number];
  showTooltip?: boolean;
  animate?: boolean;
  formatValue?: (value: number) => string;
  formatX?: (value: any, index: number) => string;
  title?: string;
  description?: string;
  onHover?: (index: number | null, value: number | null) => void;
  className?: string;
  style?: CSSProperties;
}

export interface GaugeThreshold {
  /** The band starts at this value and runs to the next threshold (or max). */
  value: number;
  color: string;
  /** Status text shown under the value while the value is in this band, e.g. "At risk". */
  label?: string;
}

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  /** Marker on the arc, e.g. a quarterly goal. */
  target?: number;
  /** Text under the value. */
  label?: string;
  /** Arc length in degrees; 360 draws a full ring. Default 240. */
  arc?: number;
  /** Band thickness in px. Default: 10% of the radius. */
  thickness?: number;
  /** Fill colour. Default: the threshold colour for the value, else the first palette colour. */
  color?: string;
  /** Colour bands, e.g. red below 50, amber below 80, green above. */
  thresholds?: GaugeThreshold[];
  /** Round the arc ends. Default true. */
  rounded?: boolean;
  /** Min / max labels at the arc ends. Default true for arcs under 360°. */
  showMinMax?: boolean;
  width?: number;
  /** Height in px. Default 200. */
  height?: number;
  theme?: ChartTheme;
  animate?: boolean;
  /** Formats the value, target and min / max labels. */
  formatValue?: (value: number) => string;
  title?: string;
  description?: string;
  className?: string;
  style?: CSSProperties;
}

export interface LegendItem {
  key: string;
  label: ReactNode;
  color: string;
  /** Secondary text, right aligned in column layout (e.g. "32%"). */
  value?: ReactNode;
}

export interface LegendProps {
  items: LegendItem[];
  /** Keys currently hidden (drawn struck through and faded). */
  hidden?: string[];
  /** Makes entries toggle buttons. */
  onToggle?: (key: string) => void;
  /** Called when the pointer / focus enters an entry (null on leave). */
  onHighlight?: (key: string | null) => void;
  /** Swatch shape. Default "square". */
  marker?: "square" | "line" | "circle";
  /** "row" wraps horizontally; "column" stacks with values right aligned. Default "row". */
  layout?: "row" | "column";
  theme?: ChartTheme;
  className?: string;
  style?: CSSProperties;
}
