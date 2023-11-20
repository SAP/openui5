sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const styleData = {
    packageName: "@ui5/webcomponents-base",
    fileName: "BusyIndicator.css",
    content: `.busy-indicator-wrapper{position:relative;height:100%;width:100%}.busy-indicator-overlay{display:var(--ui5_web_components_busy_indicator_display);position:absolute;inset:0;background:var(--ui5_web_components_busy_indicator_background-color);z-index:99}.busy-indicator-busy-area{display:var(--ui5_web_components_busy_indicator_display);position:absolute;z-index:99;inset:0;justify-content:center;align-items:center;background-color:inherit;flex-direction:column;color:var(--_ui5_busy_indicator_color)}:host([__is-busy]) .busy-indicator-wrapper>:not(.busy-indicator-busy-area):not(.busy-indicator-overlay):not([busy-indicator-before-span]){--ui5_web_components_busy_indicator_display:none}.busy-indicator-busy-area:focus{outline:var(--_ui5_busy_indicator_focus_outline);outline-offset:-.125rem}.busy-indicator-circle{width:1rem;height:1rem;display:inline-block;background-color:currentColor;border-radius:50%}.circle-animation-0{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11)}.circle-animation-1{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.2s}.circle-animation-2{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.4s}.sapUiLocalBusy{--ui5_web_components_busy_indicator_display:none}.busy-indicator-wrapper [ui5-busy-indicator]{display:none}@keyframes grow{0%,100%,50%{-webkit-transform:scale(.5);-moz-transform:scale(.5);-ms-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}}`
  };
  var _default = styleData;
  _exports.default = _default;
});