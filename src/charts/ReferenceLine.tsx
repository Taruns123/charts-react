import React from "react";
import type { ReferenceLineConfig } from "./types";

/**
 * Declarative guide line: `<LineChart ...><ReferenceLine y={50000} label="Goal" /></LineChart>`.
 * Renders nothing itself; the parent chart reads its props. Equivalent to the
 * `referenceLines` prop.
 */
const ReferenceLine = (_props: ReferenceLineConfig): null => null;

export default ReferenceLine;

/** Collects `referenceLines` plus any `<ReferenceLine>` children. */
export function collectReferenceLines(list: ReferenceLineConfig[] | undefined, children: React.ReactNode): ReferenceLineConfig[] {
  const out = (list || []).slice();
  React.Children.forEach(children, (c) => {
    if (React.isValidElement(c) && c.type === ReferenceLine) out.push(c.props as ReferenceLineConfig);
  });
  return out;
}
