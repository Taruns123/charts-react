import type { Datum } from "./types";

export function num(v: any): number {
  const n = typeof v === "number" ? v : parseFloat(v);
  return isFinite(n) ? n : 0;
}

/**
 * Cumulative [from, to] extents for each datum and key. Positive and negative
 * values stack away from zero independently (diverging stacks), so a negative
 * value never eats into the positive total.
 */
export function stackSeries(data: Datum[], keys: string[]): Array<Array<[number, number]>> {
  return data.map((d) => {
    let pos = 0;
    let neg = 0;
    return keys.map((k) => {
      const v = num(d[k]);
      if (v >= 0) {
        const r: [number, number] = [pos, pos + v];
        pos += v;
        return r;
      }
      const r: [number, number] = [neg, neg + v];
      neg += v;
      return r;
    });
  });
}

/** Index of the outermost non-empty segment in the given direction (gets the rounded end). */
export function lastNonZero(stack: Array<[number, number]>, up: boolean): number {
  for (let j = stack.length - 1; j >= 0; j--) {
    const v = stack[j][1] - stack[j][0];
    if (v !== 0 && v > 0 === up) return j;
  }
  return -1;
}
