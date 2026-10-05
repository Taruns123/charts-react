/**
 * Default categorical palette. The order is deliberate: adjacent slots stay
 * distinguishable under the common colour-vision deficiencies, so series are
 * assigned in this fixed order (never cycled into generated hues).
 */
export const lightPalette = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export const darkPalette = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
];

export type ChartTheme = "light" | "dark";

export interface ThemeTokens {
  text: string;
  muted: string;
  grid: string;
  axis: string;
  surface: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  crosshair: string;
  hoverBand: string;
  /** Unfilled track behind gauges and radial bars. */
  track: string;
  /** Reference lines and annotations. */
  reference: string;
}

export const themes: Record<ChartTheme, ThemeTokens> = {
  light: {
    text: "#1d1d1b",
    muted: "#6b6a65",
    grid: "#ebeae6",
    axis: "#d6d5cf",
    surface: "#ffffff",
    tooltipBg: "rgba(255,255,255,0.97)",
    tooltipBorder: "#e3e2dd",
    tooltipText: "#1d1d1b",
    crosshair: "#a9a8a2",
    hoverBand: "rgba(20,20,10,0.04)",
    track: "#efeee9",
    reference: "#6b6a65",
  },
  dark: {
    text: "#f3f2ee",
    muted: "#a3a29b",
    grid: "#2c2c29",
    axis: "#3d3d39",
    surface: "#161615",
    tooltipBg: "rgba(30,30,28,0.97)",
    tooltipBorder: "#3a3a36",
    tooltipText: "#f3f2ee",
    crosshair: "#6f6e68",
    hoverBand: "rgba(255,255,255,0.05)",
    track: "#2a2a27",
    reference: "#a3a29b",
  },
};
