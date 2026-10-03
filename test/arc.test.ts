import { describe, expect, it } from "vitest";
import { arcPath, pieLayout, TAU, toRad } from "../src/charts/arc";

describe("pieLayout", () => {
  it("angles of all slices sum to 2π", () => {
    const slices = pieLayout([42, 27, 18, 9, 4]);
    const sum = slices.reduce((a, s) => a + (s.endAngle - s.startAngle), 0);
    expect(sum).toBeCloseTo(TAU, 12);
    expect(slices[0].startAngle).toBe(0);
    expect(slices[slices.length - 1].endAngle).toBeCloseTo(TAU, 12);
  });

  it("slices are contiguous and proportional to value", () => {
    const slices = pieLayout([1, 3]);
    expect(slices[0].endAngle).toBe(slices[1].startAngle);
    expect(slices[1].endAngle - slices[1].startAngle).toBeCloseTo(3 * (slices[0].endAngle - slices[0].startAngle));
  });

  it("gives zero, negative and NaN values no angle", () => {
    const slices = pieLayout([5, 0, -3, NaN, 5]);
    expect(slices.map((s) => +(s.endAngle - s.startAngle).toFixed(6))).toEqual([+(Math.PI).toFixed(6), 0, 0, 0, +(Math.PI).toFixed(6)]);
  });

  it("respects a partial sweep (half donut)", () => {
    const slices = pieLayout([1, 1, 2], toRad(-90), toRad(90));
    const sum = slices.reduce((a, s) => a + (s.endAngle - s.startAngle), 0);
    expect(sum).toBeCloseTo(Math.PI, 12);
  });

  it("handles an all-zero dataset without NaN", () => {
    pieLayout([0, 0]).forEach((s) => expect(s.endAngle - s.startAngle).toBe(0));
  });
});

describe("arcPath", () => {
  const base = { cx: 100, cy: 100, innerRadius: 60, outerRadius: 90 };

  it("draws a closed annular sector", () => {
    const d = arcPath({ ...base, startAngle: 0, endAngle: Math.PI / 2 });
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect((d.match(/A/g) || []).length).toBe(2);
  });

  it("adds four corner arcs when rounded", () => {
    const d = arcPath({ ...base, startAngle: 0, endAngle: Math.PI / 2, cornerRadius: 6, padWidth: 3 });
    expect((d.match(/A/g) || []).length).toBe(6);
    expect(d).not.toMatch(/NaN/);
  });

  it("returns nothing for empty slices or slices swallowed by padding", () => {
    expect(arcPath({ ...base, startAngle: 1, endAngle: 1 })).toBe("");
    expect(arcPath({ ...base, startAngle: 0, endAngle: 0.001, padWidth: 4 })).toBe("");
  });

  it("draws a full ring as two closed sub-paths", () => {
    const d = arcPath({ ...base, startAngle: 0, endAngle: TAU });
    expect((d.match(/Z/g) || []).length).toBe(2);
  });

  it("never produces NaN for thin rounded slices", () => {
    for (let a = 0.005; a < 0.5; a += 0.01) {
      expect(arcPath({ ...base, startAngle: 0, endAngle: a, padWidth: 2, cornerRadius: 8 })).not.toMatch(/NaN/);
      expect(arcPath({ ...base, innerRadius: 0, startAngle: 0, endAngle: a, padWidth: 2, cornerRadius: 8 })).not.toMatch(/NaN/);
    }
  });
});
