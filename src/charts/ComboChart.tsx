import React from "react";
import CartesianChart from "./CartesianChart";
import type { ComboChartProps } from "./types";

/**
 * Bars and lines (or areas) on one shared x axis, with an optional second y
 * axis on the right: e.g. revenue as bars, margin % as a line.
 */
const ComboChart = (props: ComboChartProps) => <CartesianChart {...props} kind="combo" />;

export default ComboChart;
