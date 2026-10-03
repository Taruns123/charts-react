import React from "react";
import CartesianChart from "./CartesianChart";
import type { BarChartProps } from "./types";

/** Vertical bars — grouped side by side or stacked. */
const BarChart = (props: BarChartProps) => <CartesianChart {...props} kind="bar" />;

export default BarChart;
