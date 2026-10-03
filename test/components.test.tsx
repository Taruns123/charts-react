import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  AreaChart,
  BarChart,
  ComboChart,
  DonutChart,
  Gauge,
  Legend,
  LineChart,
  PieChart,
  ReferenceLine,
  ScatterChart,
  Sparkline,
} from "../src";

const signups = [
  { week: "W1", organic: 412, paid: 188, referral: 96 },
  { week: "W2", organic: 438, paid: 205, referral: 101 },
  { week: "W3", organic: 455, paid: 172, referral: 118 },
  { week: "W4", organic: 501, paid: 230, referral: 124 },
];
const series = [
  { key: "organic", label: "Organic" },
  { key: "paid", label: "Paid" },
  { key: "referral", label: "Referral" },
];

const root = (c: HTMLElement) => c.querySelector(".tc-root") as HTMLElement;
const tooltip = (c: HTMLElement) => c.querySelector(".tc-tooltip");

describe("keyboard navigation", () => {
  it("arrow keys, Home, End and Escape move the active index", () => {
    const onHover = vi.fn();
    const { container } = render(<LineChart data={signups} xKey="week" series={series} width={600} onHover={onHover} animate={false} />);
    const el = root(container);
    el.focus();
    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(onHover).toHaveBeenLastCalledWith(0, signups[0]);
    expect(tooltip(container)!.textContent).toContain("W1");
    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(onHover).toHaveBeenLastCalledWith(1, signups[1]);
    fireEvent.keyDown(el, { key: "End" });
    expect(onHover).toHaveBeenLastCalledWith(3, signups[3]);
    fireEvent.keyDown(el, { key: "ArrowRight" }); // clamps at the end
    expect(onHover).toHaveBeenLastCalledWith(3, signups[3]);
    fireEvent.keyDown(el, { key: "Home" });
    expect(onHover).toHaveBeenLastCalledWith(0, signups[0]);
    fireEvent.keyDown(el, { key: "ArrowLeft" }); // clamps at the start
    expect(onHover).toHaveBeenLastCalledWith(0, signups[0]);
    fireEvent.keyDown(el, { key: "Escape" });
    expect(onHover).toHaveBeenLastCalledWith(null, null);
    expect(tooltip(container)).toBeNull();
  });

  it("the tooltip lists every visible series with formatted values", () => {
    const { container } = render(
      <BarChart data={signups} xKey="week" series={series} width={600} formatValue={(v) => v + " users"} animate={false} />
    );
    const el = root(container);
    fireEvent.keyDown(el, { key: "ArrowLeft" }); // from nothing: jumps to the last point
    const tip = tooltip(container)!;
    expect(tip.textContent).toContain("W4");
    expect(tip.textContent).toContain("501 users");
    expect(tip.textContent).toContain("230 users");
    expect(tip.textContent).toContain("124 users");
  });

  it("walks a scatter chart's points from left to right", () => {
    const data = [
      { name: "C", x: 30, y: 1 },
      { name: "A", x: 10, y: 3 },
      { name: "B", x: 20, y: 2 },
    ];
    const onHover = vi.fn();
    const { container } = render(<ScatterChart data={data} xKey="x" yKey="y" labelKey="name" width={500} onHover={onHover} animate={false} />);
    const el = root(container);
    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(tooltip(container)!.textContent).toContain("A");
    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(tooltip(container)!.textContent).toContain("B");
    expect(onHover).toHaveBeenLastCalledWith(2, data[2]); // index into the original data
  });
});

describe("legend toggling", () => {
  it("clicking a legend entry hides that series and clicking again restores it", () => {
    const onToggle = vi.fn();
    const { container } = render(<BarChart data={signups} xKey="week" series={series} width={600} onLegendToggle={onToggle} animate={false} />);
    const bars = () => container.querySelectorAll("path.tc-bar").length;
    expect(bars()).toBe(12);
    const paid = screen.getByRole("button", { name: /Paid/ });
    expect(paid.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(paid);
    expect(paid.getAttribute("aria-pressed")).toBe("false");
    expect(onToggle).toHaveBeenLastCalledWith("paid", ["paid"]);
    expect(bars()).toBe(8);
    // the screen-reader table follows the visible series
    expect(within(screen.getByRole("table")).queryByText("Paid")).toBeNull();

    fireEvent.click(paid);
    expect(paid.getAttribute("aria-pressed")).toBe("true");
    expect(bars()).toBe(12);
  });

  it("refuses to hide the last visible series", () => {
    render(<LineChart data={signups} xKey="week" series={series} width={600} defaultHiddenSeries={["paid", "referral"]} animate={false} />);
    const organic = screen.getByRole("button", { name: /Organic/ });
    fireEvent.click(organic);
    expect(organic.getAttribute("aria-pressed")).toBe("true");
  });

  it("hiding a series rescales the y axis to the remaining data", () => {
    const { container } = render(<LineChart data={signups} xKey="week" series={series} width={600} animate={false} />);
    const maxTick = () => Math.max(...Array.from(container.querySelectorAll("text.tc-tick")).map((t) => parseFloat((t.textContent || "").replace(/,/g, "")) || 0));
    expect(maxTick()).toBeGreaterThanOrEqual(501);
    fireEvent.click(screen.getByRole("button", { name: /Organic/ }));
    expect(maxTick()).toBeLessThan(400);
  });

  it("works as a standalone, controlled component", () => {
    const onToggle = vi.fn();
    render(
      <Legend
        items={[
          { key: "a", label: "Alpha", color: "#f00" },
          { key: "b", label: "Beta", color: "#00f" },
        ]}
        hidden={["b"]}
        onToggle={onToggle}
      />
    );
    expect(screen.getByRole("button", { name: /Beta/ }).getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: /Alpha/ }));
    expect(onToggle).toHaveBeenCalledWith("a");
  });

  it("is a plain list without onToggle", () => {
    render(<Legend items={[{ key: "a", label: "Alpha", color: "#f00" }]} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Alpha")).toBeTruthy();
  });

  it("toggles donut segments and recomputes the shares", () => {
    const data = [
      { channel: "Organic", users: 50 },
      { channel: "Paid", users: 30 },
      { channel: "Referral", users: 20 },
    ];
    const { container } = render(<DonutChart data={data} nameKey="channel" valueKey="users" width={600} animate={false} />);
    expect(container.querySelectorAll("path.tc-seg")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /Organic/ }).textContent).toContain("50%");
    fireEvent.click(screen.getByRole("button", { name: /Referral/ }));
    expect(container.querySelectorAll("path.tc-seg")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Organic/ }).textContent).toContain("63%") // 50 / 80, rounded above 10%;
  });
});

describe("accessible data table", () => {
  it("renders every row and series with formatted values", () => {
    render(
      <AreaChart
        data={signups}
        xKey="week"
        series={series}
        width={600}
        title="Weekly signups"
        formatValue={(v) => v.toLocaleString("en-US") + " signups"}
        animate={false}
      />
    );
    const table = screen.getByRole("table");
    expect(table.className).toContain("tc-sr-only");
    expect(within(table).getByText("Weekly signups")).toBeTruthy(); // caption
    const headers = within(table).getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual(["week", "Organic", "Paid", "Referral"]);
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(1 + signups.length);
    expect(within(rows[1]).getByRole("rowheader").textContent).toBe("W1");
    expect(within(rows[1]).getByText("412 signups")).toBeTruthy();
  });

  it("labels the SVG with the title and a generated description", () => {
    const { container } = render(<LineChart data={signups} xKey="week" series={series} width={600} title="Signups" animate={false} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("img");
    expect(container.querySelector("title")!.textContent).toBe("Signups");
    expect(container.querySelector("desc")!.textContent).toMatch(/Line chart of Organic, Paid, Referral across 4 points/);
  });

  it("gives pies a name / value / share table", () => {
    render(<PieChart data={[{ n: "A", v: 3 }, { n: "B", v: 1 }]} nameKey="n" valueKey="v" width={400} animate={false} />);
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows.map((r) => r.textContent)).toEqual(["nvShare", "A375%", "B125%"]);
  });
});

describe("donut", () => {
  const data = [
    { plan: "Pro", mrr: 32000 },
    { plan: "Team", mrr: 18000 },
    { plan: "Starter", mrr: 10000 },
  ];
  it("shows the total in the centre, then the focused segment", () => {
    const { container } = render(
      <DonutChart data={data} nameKey="plan" valueKey="mrr" width={500} formatValue={(v) => "$" + v / 1000 + "K"} animate={false} />
    );
    const center = () => container.querySelector(".tc-center")!.textContent;
    expect(center()).toContain("Total");
    expect(center()).toContain("$60K");
    fireEvent.keyDown(root(container), { key: "ArrowRight" });
    expect(center()).toContain("Pro");
    expect(center()).toContain("$32K");
    expect(center()).toContain("53%");
  });
});

describe("reference lines and annotations", () => {
  it("draws prop and child reference lines with labels, and annotation labels", () => {
    const { container } = render(
      <LineChart
        data={signups}
        xKey="week"
        series={series}
        width={600}
        referenceLines={[{ y: 300, label: "Goal" }]}
        annotations={[{ x: "W3", seriesKey: "organic", label: "Launch" }]}
        animate={false}
      >
        <ReferenceLine x="W2" label="Campaign" />
      </LineChart>
    );
    expect(container.querySelectorAll(".tc-ref")).toHaveLength(2);
    expect(screen.getByText("Goal")).toBeTruthy();
    expect(screen.getByText("Campaign")).toBeTruthy();
    expect(screen.getByText("Launch")).toBeTruthy();
  });
});

describe("combo chart", () => {
  it("draws bars and a line, with a right axis for the line", () => {
    const data = [
      { m: "Jan", revenue: 120000, margin: 0.21 },
      { m: "Feb", revenue: 135000, margin: 0.24 },
      { m: "Mar", revenue: 150000, margin: 0.27 },
    ];
    const { container } = render(
      <ComboChart
        data={data}
        xKey="m"
        series={[
          { key: "revenue", label: "Revenue", type: "bar" },
          { key: "margin", label: "Margin", type: "line", axis: "right" },
        ]}
        formatYRight={(v) => Math.round(v * 100) + "%"}
        width={600}
        animate={false}
      />
    );
    expect(container.querySelectorAll("path.tc-bar")).toHaveLength(3);
    const ticks = Array.from(container.querySelectorAll("text.tc-tick")).map((t) => t.textContent);
    expect(ticks.some((t) => /%$/.test(t || ""))).toBe(true);
    fireEvent.keyDown(root(container), { key: "ArrowRight" });
    expect(tooltip(container)!.textContent).toMatch(/Revenue.*Margin/);
  });
});

describe("sparkline", () => {
  it("marks min, max and last, and summarises the series for screen readers", () => {
    const { container } = render(<Sparkline data={[5, 9, 2, 7, 6]} width={120} markers animate={false} />);
    expect(container.querySelectorAll("circle")).toHaveLength(3);
    expect(root(container).getAttribute("aria-label")).toMatch(/5 values, from 5 to 6; low 2, high 9/);
  });

  it("reads values from records", () => {
    const { container } = render(<Sparkline data={[{ d: "Mon", v: 3 }, { d: "Tue", v: 4 }]} valueKey="v" xKey="d" type="bar" width={80} animate={false} />);
    expect(container.querySelectorAll("path.tc-bar")).toHaveLength(2);
    fireEvent.keyDown(root(container), { key: "End" });
    expect(tooltip(container)!.textContent).toContain("Tue");
  });
});

describe("gauge", () => {
  it("exposes the value as a meter and picks the threshold status", () => {
    render(
      <Gauge
        value={72}
        target={80}
        label="Quota"
        width={240}
        thresholds={[
          { value: 0, color: "red", label: "Off track" },
          { value: 50, color: "orange", label: "At risk" },
          { value: 80, color: "green", label: "On track" },
        ]}
        animate={false}
      />
    );
    const meter = screen.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("72");
    expect(meter.getAttribute("aria-valuetext")).toMatch(/target 80 \(90% of target\), At risk/);
    expect(Array.from(document.querySelectorAll("svg > text")).some((t) => /^At risk/.test(t.textContent || ""))).toBe(true);
  });
});
