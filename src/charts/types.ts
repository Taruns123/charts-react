import type { CSSProperties } from "react";
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

export interface BaseChartProps {
  /** Array of records, one per x position. */
  data: Datum[];
  /** Key holding the x (category / time) value of each datum. */
  xKey: string;
  /**
   * Series to plot. Strings are shorthand for `{ key }`. When omitted, every
   * numeric key except `xKey` is plotted.
   */
  series?: Array<string | SeriesConfig>;
  /** Fixed width in px. When omitted the chart fills its container and resizes with it. */
  width?: number;
  /** Height in px of the plot (legend excluded). Default 280. */
  height?: number;
  /** Replaces the default palette. Series take colours in order. */
  colors?: string[];
  /** Colour scheme for axes, grid and tooltip. Default "light". */
  theme?: ChartTheme;
  /** Horizontal grid lines. Default true. */
  showGrid?: boolean;
  /** Legend above the chart. Default: shown when there are 2+ series. */
  showLegend?: boolean;
  /** Hover / keyboard tooltip. Default true. */
  showTooltip?: boolean;
  /** Vertical crosshair on hover (line & area). Default true. */
  showCrosshair?: boolean;
  /** Entry animation (skipped automatically under prefers-reduced-motion). Default true. */
  animate?: boolean;
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
  /** Accessible title for the chart (rendered for screen readers). */
  title?: string;
  /** Longer accessible description. */
  description?: string;
  /** Called with the hovered index (or null) as the pointer / keyboard moves. */
  onHover?: (index: number | null, datum: Datum | null) => void;
  className?: string;
  style?: CSSProperties;
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
