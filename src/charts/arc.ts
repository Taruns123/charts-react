/**
 * Polar geometry for pie, donut and gauge charts.
 * Angles are in radians, measured clockwise from 12 o'clock.
 */

export const TAU = Math.PI * 2;

export const toRad = (deg: number) => (deg * Math.PI) / 180;

export function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

export interface PieSlice {
  index: number;
  value: number;
  startAngle: number;
  endAngle: number;
}

/**
 * Splits [startAngle, endAngle] proportionally to `values`. Negative and
 * non-finite values count as zero. The slices always tile the full span, so
 * for a full circle their angles sum to exactly 2π.
 */
export function pieLayout(values: number[], startAngle = 0, endAngle = TAU): PieSlice[] {
  const clean = values.map((v) => (isFinite(v) && v > 0 ? v : 0));
  const total = clean.reduce((a, b) => a + b, 0);
  const span = endAngle - startAngle;
  let a = startAngle;
  return clean.map((v, index) => {
    const start = a;
    const end = total > 0 ? start + (v / total) * span : start;
    a = end;
    return { index, value: v, startAngle: start, endAngle: end };
  });
}

const f = (n: number) => (Math.abs(n) < 1e-9 ? "0" : n.toFixed(2));

export interface ArcOptions {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  /** Width in px of the gap between neighbouring slices (parallel-sided, like d3's padRadius). */
  padWidth?: number;
  /** Radius in px of the rounded corners. */
  cornerRadius?: number;
}

/**
 * SVG path for an annular sector with parallel-sided gaps and optionally
 * rounded corners. Corners are circles tangent to both the arc and the
 * (offset) radial edge, shrunk automatically when a slice is too thin.
 */
export function arcPath(o: ArcOptions): string {
  const { cx, cy } = o;
  const R = o.outerRadius;
  const r = Math.max(0, o.innerRadius);
  const span = o.endAngle - o.startAngle;
  if (!(span > 0) || R <= r) return "";
  const p = Math.max(0, (o.padWidth || 0) / 2);
  const half = span / 2;
  const s = o.startAngle;
  const e = o.endAngle;
  const full = span >= TAU - 1e-6;

  if (full) {
    // ring / disc: two half arcs (an SVG arc cannot start and end on the same point)
    const [ox0, oy0] = polar(cx, cy, R, 0);
    const [ox1, oy1] = polar(cx, cy, R, Math.PI);
    let d = `M${f(ox0)},${f(oy0)}A${f(R)},${f(R)} 0 1 1 ${f(ox1)},${f(oy1)}A${f(R)},${f(R)} 0 1 1 ${f(ox0)},${f(oy0)}Z`;
    if (r > 0) {
      const [ix0, iy0] = polar(cx, cy, r, 0);
      const [ix1, iy1] = polar(cx, cy, r, Math.PI);
      d += `M${f(ix0)},${f(iy0)}A${f(r)},${f(r)} 0 1 0 ${f(ix1)},${f(iy1)}A${f(r)},${f(r)} 0 1 0 ${f(ix0)},${f(iy0)}Z`;
    }
    return d;
  }

  // a slice whose padding swallows the outer edge is not drawn
  if (p >= R * Math.sin(Math.min(half, Math.PI / 2)) && half < Math.PI / 2) return "";

  // corner radius limited by ring thickness and by the slice's angular width
  let rc = Math.max(0, Math.min(o.cornerRadius || 0, (R - r) / 2));
  const outerFits = (c: number) => (p + c) / (R - c) < 1 && Math.asin((p + c) / (R - c)) <= half;
  while (rc > 0.25 && !outerFits(rc)) rc *= 0.8;
  if (!outerFits(rc)) rc = 0;

  // inner side: either an arc (with its own corners) or the point where the two padded edges meet
  let rci = r > 0 ? rc : 0;
  const innerFits = (c: number) => r > 0 && (p + c) / (r + c) < 1 && Math.asin((p + c) / (r + c)) <= half;
  while (rci > 0.25 && !innerFits(rci)) rci *= 0.8;
  const innerArc = innerFits(rci) || innerFits(0);
  if (!innerFits(rci)) rci = 0;

  const edgePoint = (rho: number, along: number, sign: number, base: number): [number, number] => {
    const ang = base + sign * Math.atan2(p, along);
    return polar(cx, cy, rho, ang);
  };

  const parts: string[] = [];
  // --- outer start corner ---
  if (rc > 0) {
    const dC = R - rc;
    const along = Math.sqrt(dC * dC - (p + rc) * (p + rc));
    const P0 = edgePoint(Math.sqrt(along * along + p * p), along, 1, s);
    const P1 = polar(cx, cy, R, s + Math.asin((p + rc) / dC));
    parts.push(`M${f(P0[0])},${f(P0[1])}A${f(rc)},${f(rc)} 0 0 1 ${f(P1[0])},${f(P1[1])}`);
  } else {
    const P1 = polar(cx, cy, R, s + Math.asin(p / R));
    parts.push(`M${f(P1[0])},${f(P1[1])}`);
  }
  // --- outer arc to end corner ---
  const aOutS = s + Math.asin((p + rc) / (R - rc || R));
  const aOutE = e - Math.asin((p + rc) / (R - rc || R));
  const Pe = polar(cx, cy, R, aOutE);
  parts.push(`A${f(R)},${f(R)} 0 ${aOutE - aOutS > Math.PI ? 1 : 0} 1 ${f(Pe[0])},${f(Pe[1])}`);
  if (rc > 0) {
    const dC = R - rc;
    const along = Math.sqrt(dC * dC - (p + rc) * (p + rc));
    const P = edgePoint(Math.sqrt(along * along + p * p), along, -1, e);
    parts.push(`A${f(rc)},${f(rc)} 0 0 1 ${f(P[0])},${f(P[1])}`);
  }
  // --- inner side ---
  if (innerArc) {
    if (rci > 0) {
      const dC = r + rci;
      const along = Math.sqrt(dC * dC - (p + rci) * (p + rci));
      const P0 = edgePoint(Math.sqrt(along * along + p * p), along, -1, e);
      const P1 = polar(cx, cy, r, e - Math.asin((p + rci) / dC));
      parts.push(`L${f(P0[0])},${f(P0[1])}A${f(rci)},${f(rci)} 0 0 1 ${f(P1[0])},${f(P1[1])}`);
    } else {
      const P1 = polar(cx, cy, r, e - Math.asin(p / r));
      parts.push(`L${f(P1[0])},${f(P1[1])}`);
    }
    const aInS = s + Math.asin((p + rci) / (r + rci));
    const aInE = e - Math.asin((p + rci) / (r + rci));
    const Ps = polar(cx, cy, r, aInS);
    parts.push(`A${f(r)},${f(r)} 0 ${aInE - aInS > Math.PI ? 1 : 0} 0 ${f(Ps[0])},${f(Ps[1])}`);
    if (rci > 0) {
      const dC = r + rci;
      const along = Math.sqrt(dC * dC - (p + rci) * (p + rci));
      const P = edgePoint(Math.sqrt(along * along + p * p), along, 1, s);
      parts.push(`A${f(rci)},${f(rci)} 0 0 1 ${f(P[0])},${f(P[1])}`);
    }
  } else {
    // edges meet on the bisector
    const apex = p > 0 && half < Math.PI / 2 ? p / Math.sin(half) : 0;
    const P = polar(cx, cy, apex, s + half);
    parts.push(`L${f(P[0])},${f(P[1])}`);
  }
  return parts.join("") + "Z";
}

/** Centre-line arc (for stroked gauges), from a0 to a1 clockwise. */
export function arcLine(cx: number, cy: number, r: number, a0: number, a1: number): string {
  if (a1 - a0 >= TAU - 1e-6) {
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, a0 + Math.PI);
    return `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 1 1 ${f(x1)},${f(y1)}A${f(r)},${f(r)} 0 1 1 ${f(x0)},${f(y0)}`;
  }
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${f(x1)},${f(y1)}`;
}
