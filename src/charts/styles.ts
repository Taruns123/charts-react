/** Base styles, injected once per document. Everything is scoped under .tc-root. */
export const STYLE_ID = "tc-charts-styles";

export const css = `
.tc-root{position:relative;width:100%;font-family:inherit;-webkit-tap-highlight-color:transparent;outline:none}
.tc-root:focus-visible{box-shadow:0 0 0 2px var(--tc-focus,#2a78d6);border-radius:6px}
.tc-root svg{display:block;overflow:visible}
.tc-tick{font-size:11px;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.tc-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 10px;padding:0;list-style:none;font-size:12px}
.tc-legend li{display:flex;align-items:center;gap:6px}
.tc-key{width:10px;height:10px;border-radius:3px;flex:none}
.tc-key-line{width:14px;height:3px;border-radius:2px}
.tc-tooltip{position:absolute;top:0;left:0;pointer-events:none;z-index:5;min-width:140px;padding:8px 10px;border-radius:8px;font-size:12px;line-height:1.35;box-shadow:0 8px 24px -8px rgba(0,0,0,.18),0 2px 6px -2px rgba(0,0,0,.08);transition:transform 90ms ease-out,opacity 120ms;white-space:nowrap}
.tc-tooltip-title{font-weight:600;margin-bottom:6px}
.tc-tooltip-row{display:flex;align-items:center;gap:8px;margin-top:3px}
.tc-tooltip-row .tc-tooltip-label{flex:1;opacity:.75}
.tc-tooltip-row .tc-tooltip-value{font-weight:600;font-variant-numeric:tabular-nums;margin-left:12px}
.tc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.tc-animate .tc-reveal{animation:tc-reveal 900ms cubic-bezier(.22,.8,.26,1) both}
.tc-animate .tc-bar{transform-box:fill-box;transform-origin:50% 100%;animation:tc-grow 650ms cubic-bezier(.22,.8,.26,1) both}
.tc-animate .tc-bar.tc-neg{transform-origin:50% 0}
.tc-animate .tc-fade{animation:tc-fade 600ms ease-out both}
.tc-dot{transition:opacity 120ms}
@keyframes tc-reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes tc-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes tc-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.tc-animate .tc-reveal,.tc-animate .tc-bar,.tc-animate .tc-fade{animation:none}}
`;

export function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = css;
  document.head.appendChild(el);
}
