import React from "react";
import CartesianChart from "./CartesianChart";
import type { LineChartProps } from "./types";

/** One or more series as lines over an ordered x axis. */
const LineChart = (props: LineChartProps) => <CartesianChart {...props} kind="line" />;

export default LineChart;
