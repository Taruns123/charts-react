export type Point = [number, number];

export function linearPath(points: Point[]): string {
  return points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(2) + "," + p[1].toFixed(2)).join("");
}

/**
 * Monotone cubic interpolation (Fritsch–Carlson). Smooth like a spline but
 * never overshoots the data, so peaks and troughs stay truthful.
 */
export function monotonePath(points: Point[]): string {
  const n = points.length;
  if (n < 3) return linearPath(points);
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = points[i + 1][0] - points[i][0];
    dx.push(h);
    slope.push(h === 0 ? 0 : (points[i + 1][1] - points[i][1]) / h);
  }
  const t: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) {
      t.push(0);
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      t.push((w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]));
    }
  }
  t.push(slope[n - 2]);
  let d = "M" + points[0][0].toFixed(2) + "," + points[0][1].toFixed(2);
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const h = dx[i] / 3;
    d +=
      "C" +
      (p0[0] + h).toFixed(2) + "," + (p0[1] + h * t[i]).toFixed(2) + " " +
      (p1[0] - h).toFixed(2) + "," + (p1[1] - h * t[i + 1]).toFixed(2) + " " +
      p1[0].toFixed(2) + "," + p1[1].toFixed(2);
  }
  return d;
}

export function curvePath(points: Point[], smooth: boolean): string {
  return smooth ? monotonePath(points) : linearPath(points);
}

/** Closes a top line down to a baseline (or to a lower line, for stacks). */
export function areaPath(top: Point[], bottom: Point[], smooth: boolean): string {
  if (!top.length) return "";
  const upper = curvePath(top, smooth);
  const lowerRev = bottom.slice().reverse();
  const lower = curvePath(lowerRev, smooth).replace(/^M/, "L");
  return upper + lower + "Z";
}

/** A bar with rounded data-end corners and a square baseline. */
export function roundedBar(x: number, y: number, w: number, h: number, r: number, up: boolean): string {
  if (h <= 0 || w <= 0) return "";
  const rr = Math.max(0, Math.min(r, w / 2, h));
  if (up) {
    return (
      "M" + x + "," + (y + h) +
      "V" + (y + rr) +
      "Q" + x + "," + y + " " + (x + rr) + "," + y +
      "H" + (x + w - rr) +
      "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + rr) +
      "V" + (y + h) + "Z"
    );
  }
  return (
    "M" + x + "," + y +
    "V" + (y + h - rr) +
    "Q" + x + "," + (y + h) + " " + (x + rr) + "," + (y + h) +
    "H" + (x + w - rr) +
    "Q" + (x + w) + "," + (y + h) + " " + (x + w) + "," + (y + h - rr) +
    "V" + y + "Z"
  );
}
