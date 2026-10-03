/** Base styles, injected once per document. Everything is scoped under .tc-root. */
export const STYLE_ID = "tc-charts-styles";

export const css = `
.tc-root{position:relative;width:100%;font-family:inherit;-webkit-tap-highlight-color:transparent;outline:none}
.tc-root:focus-visible{box-shadow:0 0 0 2px var(--tc-focus,#2a78d6);border-radius:6px}
.tc-root svg{display:block;overflow:visible}
.tc-tick{font-size:11px;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.tc-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0 0 10px;padding:0;list-style:none;font-size:12px}
.tc-legend li{display:flex;align-items:center;gap:6px;min-width:0}
.tc-legend-btn{display:flex;align-items:center;gap:6px;width:100%;margin:-3px -5px;padding:3px 5px;border:0;border-radius:6px;background:none;font:inherit;color:inherit;cursor:pointer;text-align:left;transition:background-color 120ms}
.tc-legend-btn:hover{background:rgba(127,127,120,.1)}
.tc-legend-btn:focus-visible{outline:2px solid var(--tc-focus,#2a78d6);outline-offset:1px}
.tc-legend .tc-off .tc-legend-label{text-decoration:line-through;text-decoration-thickness:1px}
.tc-legend-col{flex-direction:column;flex-wrap:nowrap;gap:2px;font-size:13px}
.tc-legend-col li{padding:3px 0}
.tc-legend-col .tc-legend-btn{margin:-4px -6px;padding:4px 6px;width:calc(100% + 12px)}
.tc-legend-label{white-space:nowrap}
.tc-legend-value{margin-left:2px;font-variant-numeric:tabular-nums;font-weight:550;opacity:.75}
.tc-legend-col li{min-width:0}
.tc-legend-col .tc-legend-label{overflow:hidden;text-overflow:ellipsis;min-width:0}
.tc-legend-col .tc-legend-value{margin-left:auto;padding-left:12px;flex:none}
.tc-key{width:10px;height:10px;border-radius:3px;flex:none}
.tc-key-line{width:14px;height:3px;border-radius:2px}
.tc-key-circle{width:9px;height:9px;border-radius:50%}
.tc-tooltip{position:absolute;top:0;left:0;pointer-events:none;z-index:5;min-width:140px;padding:8px 10px;border-radius:8px;font-size:12px;line-height:1.35;box-shadow:0 8px 24px -8px rgba(0,0,0,.18),0 2px 6px -2px rgba(0,0,0,.08);transition:transform 90ms ease-out,opacity 120ms;white-space:nowrap}
.tc-tooltip-title{font-weight:600;margin-bottom:6px}
.tc-tooltip-row{display:flex;align-items:center;gap:8px;margin-top:3px}
.tc-tooltip-row .tc-tooltip-label{flex:1;opacity:.75}
.tc-tooltip-row .tc-tooltip-value{font-weight:600;font-variant-numeric:tabular-nums;margin-left:12px}
.tc-tooltip-footer{margin-top:6px;font-size:11px}
.tc-tooltip-head{display:inline-flex;align-items:center;gap:6px}
.tc-tooltip-sm{min-width:0;padding:4px 8px;font-size:11.5px;border-radius:6px}
.tc-tooltip-sm strong{font-weight:600;font-variant-numeric:tabular-nums;margin-left:4px}
.tc-ref-label{font-size:11px;font-weight:550;paint-order:stroke;stroke-width:4px;stroke-linejoin:round}
.tc-note-label{font-size:11.5px;font-weight:600}
.tc-quad{font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;paint-order:stroke;stroke-width:4px;stroke-linejoin:round}
.tc-axis-title{font-size:11.5px;font-weight:500}
.tc-spark{display:block}
.tc-seg{transition:transform 180ms cubic-bezier(.22,.8,.26,1),opacity 140ms;cursor:pointer}
.tc-pie-body{display:flex;flex-direction:column;align-items:stretch}
.tc-pie-side{flex-direction:row;align-items:center;justify-content:center;gap:32px}
.tc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.tc-animate .tc-reveal{animation:tc-reveal 900ms cubic-bezier(.22,.8,.26,1) both}
.tc-animate .tc-bar{transform-box:fill-box;transform-origin:50% 100%;animation:tc-grow 650ms cubic-bezier(.22,.8,.26,1) both}
.tc-animate .tc-bar.tc-neg{transform-origin:50% 0}
.tc-animate .tc-fade{animation:tc-fade 600ms ease-out both}
.tc-dot{transition:opacity 120ms,fill-opacity 120ms,stroke-opacity 120ms}
.tc-animate .tc-pt{transform-box:fill-box;transform-origin:center;animation:tc-pop-in 520ms cubic-bezier(.22,.8,.26,1) both}
.tc-animate .tc-pop{transform-box:fill-box;transform-origin:center;animation:tc-spin-in 800ms cubic-bezier(.22,.8,.26,1) both}
.tc-animate .tc-gauge-fill{animation:tc-dash 1000ms cubic-bezier(.22,.8,.26,1) both}
.tc-gauge-fill{stroke-dashoffset:0}
@keyframes tc-reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes tc-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes tc-fade{from{opacity:0}to{opacity:1}}
@keyframes tc-pop-in{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes tc-spin-in{from{transform:rotate(-25deg) scale(.86);opacity:0}to{transform:none;opacity:1}}
@keyframes tc-dash{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.tc-animate .tc-reveal,.tc-animate .tc-bar,.tc-animate .tc-fade,.tc-animate .tc-pt,.tc-animate .tc-pop,.tc-animate .tc-gauge-fill{animation:none}.tc-seg,.tc-tooltip{transition:none}}
`;

export function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = css;
  document.head.appendChild(el);
}
