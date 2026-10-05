import { describe, expect, it } from "vitest";
import { monotonePath, linearPath, Point } from "../src/charts/curve";

/** Parses "M x,y C x1,y1 x2,y2 x,y ..." into cubic segments. */
function cubics(d: string) {
  const nums = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
  const start: Point = [nums[0], nums[1]];
  const segs: Array<[Point, Point, Point, Point]> = [];
  let p0 = start;
  for (let i = 2; i + 5 < nums.length + 1; i += 6) {
    const c1: Point = [nums[i], nums[i + 1]];
    const c2: Point = [nums[i + 2], nums[i + 3]];
    const p1: Point = [nums[i + 4], nums[i + 5]];
    segs.push([p0, c1, c2, p1]);
    p0 = p1;
  }
  return segs;
}

const bez = (a: number, b: number, c: number, d: number, t: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

// deterministic pseudo-random data
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

describe("monotonePath", () => {
  const cases: Point[][] = [
    // classic overshoot traps: a spike, a plateau, a step
    [[0, 100], [10, 100], [20, 0], [30, 100], [40, 100]],
    [[0, 50], [10, 50], [20, 50], [30, 10], [40, 10]],
    [[0, 0], [10, 0], [20, 200], [30, 200], [40, 200]],
  ];
  const rand = rng(42);
  for (let k = 0; k < 40; k++) {
    const n = 3 + Math.floor(rand() * 14);
    const pts: Point[] = [];
    let x = 0;
    for (let i = 0; i < n; i++) {
      x += 2 + rand() * 30; // uneven spacing
      pts.push([x, Math.round(rand() * 300)]);
    }
    cases.push(pts);
  }

  it.each(cases.map((c, i) => [i, c] as const))("never overshoots the data between neighbours (case %i)", (_i, pts) => {
    const segs = cubics(monotonePath(pts));
    expect(segs).toHaveLength(pts.length - 1);
    segs.forEach(([p0, c1, c2, p1], i) => {
      // each segment starts/ends on the data
      expect(p0[1]).toBeCloseTo(pts[i][1], 1);
      expect(p1[1]).toBeCloseTo(pts[i + 1][1], 1);
      const lo = Math.min(pts[i][1], pts[i + 1][1]);
      const hi = Math.max(pts[i][1], pts[i + 1][1]);
      for (let t = 0; t <= 1; t += 0.02) {
        const y = bez(p0[1], c1[1], c2[1], p1[1], t);
        expect(y).toBeGreaterThanOrEqual(lo - 0.02);
        expect(y).toBeLessThanOrEqual(hi + 0.02);
      }
    });
  });

  it("falls back to straight segments for fewer than three points", () => {
    const pts: Point[] = [[0, 0], [10, 5]];
    expect(monotonePath(pts)).toBe(linearPath(pts));
  });
});
