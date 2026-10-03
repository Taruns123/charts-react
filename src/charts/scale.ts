export type Scale = (v: number) => number;

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const d0 = domain[0];
  const d1 = domain[1];
  const r0 = range[0];
  const r1 = range[1];
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

export function niceStep(rawStep: number): number {
  const exp = Math.floor(Math.log10(rawStep));
  const base = Math.pow(10, exp);
  const f = rawStep / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * base;
}

/** Expands a domain to round numbers and returns the ticks inside it. */
export function niceTicks(min: number, max: number, count: number): { domain: [number, number]; ticks: number[] } {
  if (min === max) {
    if (min === 0) {
      max = 1;
    } else {
      const pad = Math.abs(min) * 0.1;
      min -= pad;
      max += pad;
    }
  }
  const step = niceStep((max - min) / Math.max(1, count));
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return { domain: [lo, hi], ticks };
}

/**
 * Nice ticks for a secondary axis that must share the primary axis' grid:
 * returns exactly `intervals + 1` evenly spaced round ticks covering [min, max].
 */
export function alignedTicks(min: number, max: number, intervals: number): { domain: [number, number]; ticks: number[] } {
  const k = Math.max(1, intervals);
  if (min === max) {
    if (min === 0) max = 1;
    else {
      const pad = Math.abs(min) * 0.1;
      min -= pad;
      max += pad;
    }
  }
  let step = niceStep((max - min) / k);
  let lo = Math.floor(min / step) * step;
  // grow the step until k intervals starting at lo reach max
  for (let guard = 0; guard < 40 && lo + step * k < max - step * 1e-9; guard++) {
    step = niceStep(step * 1.0001);
    lo = Math.floor(min / step) * step;
  }
  const ticks: number[] = [];
  for (let i = 0; i <= k; i++) ticks.push(Math.round((lo + step * i) / step) * step);
  return { domain: [ticks[0], ticks[k]], ticks };
}

/** sqrt scale for bubble radii, so a bubble's area (not its radius) tracks its value. */
export function sqrtRadius(maxValue: number, range: [number, number]): Scale {
  const maxV = maxValue > 0 ? maxValue : 1;
  return (v: number) => {
    if (!(v > 0)) return range[0];
    return Math.max(range[0], range[1] * Math.sqrt(Math.min(v, maxV) / maxV));
  };
}

/** Compact number formatting: 1,284 / 12.9K / 4.2M. */
export function formatCompact(v: number): string {
  const abs = Math.abs(v);
  const trim = (n: number) => {
    const s = n.toFixed(1);
    return s.endsWith(".0") ? s.slice(0, -2) : s;
  };
  if (abs >= 1e9) return trim(v / 1e9) + "B";
  if (abs >= 1e6) return trim(v / 1e6) + "M";
  if (abs >= 1e4) return trim(v / 1e3) + "K";
  if (Number.isInteger(v)) return v.toLocaleString("en-US");
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatFull(v: number): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
