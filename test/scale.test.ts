import { describe, expect, it } from "vitest";
import { alignedTicks, formatCompact, linearScale, niceTicks, sqrtRadius } from "../src/charts/scale";

describe("linearScale", () => {
  it("maps the domain onto the range, including inverted ranges", () => {
    const s = linearScale([0, 100], [200, 0]);
    expect(s(0)).toBe(200);
    expect(s(100)).toBe(0);
    expect(s(25)).toBe(150);
  });

  it("does not divide by zero on an empty domain", () => {
    expect(Number.isFinite(linearScale([5, 5], [0, 10])(5))).toBe(true);
  });
});

describe("niceTicks", () => {
  const isNiceStep = (step: number) => {
    const f = step / Math.pow(10, Math.floor(Math.log10(step)));
    return [1, 2, 2.5, 5, 10].some((n) => Math.abs(f - n) < 1e-9);
  };

  it.each([
    [0, 61840, 5],
    [18200, 61840, 5],
    [-37, 112, 4],
    [0.013, 0.87, 5],
    [-5000, -120, 6],
  ])("covers [%s, %s] with round, evenly spaced ticks", (min, max, count) => {
    const { domain, ticks } = niceTicks(min, max, count);
    expect(domain[0]).toBeLessThanOrEqual(min);
    expect(domain[1]).toBeGreaterThanOrEqual(max);
    expect(ticks[0]).toBeCloseTo(domain[0], 9);
    expect(ticks[ticks.length - 1]).toBeCloseTo(domain[1], 9);
    const step = ticks[1] - ticks[0];
    expect(isNiceStep(step)).toBe(true);
    ticks.slice(1).forEach((t, i) => expect(t - ticks[i]).toBeCloseTo(step, 9));
    // roughly the requested density
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    expect(ticks.length).toBeLessThanOrEqual(count * 2 + 2);
  });

  it("gives a flat series a visible range", () => {
    expect(niceTicks(0, 0, 5).domain).toEqual([0, 1]);
    const { domain } = niceTicks(50, 50, 5);
    expect(domain[0]).toBeLessThan(50);
    expect(domain[1]).toBeGreaterThan(50);
  });

  it("keeps zero as a tick when the data crosses it", () => {
    expect(niceTicks(-37, 112, 4).ticks).toContain(0);
  });
});

describe("alignedTicks", () => {
  it.each([
    [0, 0.42, 4],
    [12, 97, 5],
    [0, 1234, 3],
    [-8, 30, 4],
  ])("returns exactly k+1 ticks covering [%s, %s] for k=%s", (min, max, k) => {
    const { domain, ticks } = alignedTicks(min, max, k);
    expect(ticks).toHaveLength(k + 1);
    expect(domain[0]).toBeLessThanOrEqual(min);
    expect(domain[1]).toBeGreaterThanOrEqual(max - 1e-9);
  });
});

describe("sqrtRadius", () => {
  it("makes bubble area proportional to value", () => {
    const r = sqrtRadius(100, [2, 20]);
    expect(r(100)).toBe(20);
    expect(r(25)).toBeCloseTo(10);
    expect(r(0)).toBe(2);
  });
});

describe("formatCompact", () => {
  it("abbreviates large numbers and keeps small ones exact", () => {
    expect(formatCompact(1284)).toBe("1,284");
    expect(formatCompact(12900)).toBe("12.9K");
    expect(formatCompact(4200000)).toBe("4.2M");
    expect(formatCompact(2000000000)).toBe("2B");
    expect(formatCompact(-45000)).toBe("-45K");
  });
});
