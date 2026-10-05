import { useEffect, useRef, useState } from "react";

/** Measures the width of a container so charts can fill their parent. */
export function useContainerWidth(fixed?: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(fixed || 0);
  useEffect(() => {
    if (fixed) {
      setWidth(fixed);
      return;
    }
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixed]);
  return { ref, width };
}
