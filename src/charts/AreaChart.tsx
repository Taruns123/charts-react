import React from "react";
import CartesianChart from "./CartesianChart";
import type { AreaChartProps } from "./types";

/** Lines with a filled area to the baseline — optionally stacked, with gradient fills. */
const AreaChart = (props: AreaChartProps) => <CartesianChart {...(props as any)} kind="area" />;

export default AreaChart;
