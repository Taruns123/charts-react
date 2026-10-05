import { describe, expect, it } from "vitest";
import { stackSeries, lastNonZero, num } from "../src/charts/stack";

describe("stackSeries", () => {
  const data = [
    { m: "Jan", a: 10, b: 20, c: 5 },
    { m: "Feb", a: 0, b: 7, c: 3 },
    { m: "Mar", a: 4, b: -6, c: -2 },
  ];

  it("stacks positive values so the top of the last segment is the row total", () => {
    const st = stackSeries(data, ["a", "b", "c"]);
    expect(st[0]).toEqual([[0, 10], [10, 30], [30, 35]]);
    expect(st[1][2][1]).toBe(10);
    // each segment's height equals its own value
    data.forEach((d, i) =>
      ["a", "b", "c"].forEach((k, j) => expect(st[i][j][1] - st[i][j][0]).toBe((d as any)[k]))
    );
  });

  it("stacks negatives downward from zero independently of positives", () => {
    const st = stackSeries(data, ["a", "b", "c"]);
    expect(st[2]).toEqual([[0, 4], [0, -6], [-6, -8]]);
  });

  it("treats missing or non-numeric values as zero", () => {
    const st = stackSeries([{ a: "12", b: undefined, c: "n/a" }], ["a", "b", "c"]);
    expect(st[0]).toEqual([[0, 12], [12, 12], [12, 12]]);
    expect(num("3.5")).toBe(3.5);
  });

  it("finds the outermost non-empty segment for rounded ends", () => {
    const st = stackSeries(data, ["a", "b", "c"]);
    expect(lastNonZero(st[0], true)).toBe(2);
    expect(lastNonZero(st[2], true)).toBe(0);
    expect(lastNonZero(st[2], false)).toBe(2);
  });
});
