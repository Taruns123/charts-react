import React from "react";
import { RadialPart } from "./PieChart";
import type { PieChartProps } from "./types";

/** A pie with a hole: the centre shows the total, or the hovered segment's name, value and share. */
const DonutChart = (props: PieChartProps) => <RadialPart {...props} variant="donut" />;

export default DonutChart;
