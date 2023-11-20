sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", async () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/BusyIndicator.css",
    content: ":host(:not([hidden])){display:inline-block}:host([_is-busy]){color:var(--_ui5-v1-18-0_busy_indicator_color)}:host([size=Small]) .ui5-busy-indicator-root{min-height:.5rem;min-width:1.625rem}:host([size=Small][text]:not([text=\"\"])) .ui5-busy-indicator-root{min-height:1.75rem}:host([size=Small]) .ui5-busy-indicator-circle{height:.5rem;width:.5rem}:host([size=Small]) .ui5-busy-indicator-circle:first-child,:host([size=Small]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.0625rem}:host(:not([size])) .ui5-busy-indicator-root,:host([size=Medium]) .ui5-busy-indicator-root{min-height:1rem;min-width:3.375rem}:host([size=Medium]) .ui5-busy-indicator-circle:first-child,:host([size=Medium]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.1875rem}:host(:not([size])[text]:not([text=\"\"])) .ui5-busy-indicator-root,:host([size=Medium][text]:not([text=\"\"])) .ui5-busy-indicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busy-indicator-circle,:host([size=Medium]) .ui5-busy-indicator-circle{height:1rem;width:1rem}:host([size=Large]) .ui5-busy-indicator-root{min-height:2rem;min-width:6.5rem}:host([size=Large]) .ui5-busy-indicator-circle:first-child,:host([size=Large]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.25rem}:host([size=Large][text]:not([text=\"\"])) .ui5-busy-indicator-root{min-height:3.25rem}:host([size=Large]) .ui5-busy-indicator-circle{height:2rem;width:2rem}.ui5-busy-indicator-root{align-items:center;background-color:inherit;display:flex;height:inherit;justify-content:center;position:relative}.ui5-busy-indicator-busy-area{align-items:center;background-color:inherit;bottom:0;display:flex;flex-direction:column;justify-content:center;left:0;position:absolute;right:0;top:0;z-index:99}.ui5-busy-indicator-busy-area:focus{border-radius:var(--_ui5-v1-18-0_busy_indicator_focus_border_radius);outline:var(--_ui5-v1-18-0_busy_indicator_focus_outline);outline-offset:-2px}.ui5-busy-indicator-circles-wrapper{line-height:0}.ui5-busy-indicator-circle{background-color:currentColor;border-radius:50%;display:inline-block}.ui5-busy-indicator-circle:before{border-radius:100%;content:\"\";height:100%;width:100%}.circle-animation-0{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite}.circle-animation-1{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite;animation-delay:.2s}.circle-animation-2{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite;animation-delay:.4s}.ui5-busy-indicator-text{margin-top:.25rem;text-align:center;width:100%}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}}"
  };
  var _default = styleData;
  _exports.default = _default;
});