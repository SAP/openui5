sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", () => _parametersBundle2.default);
  var _default = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/BusyIndicator.css",
    content: ":host(:not([hidden])){display:inline-block}:host([_is-busy]){color:var(--_ui5_busy_indicator_color)}:host([size=Small]) .ui5-busy-indicator-root{min-width:1.5rem;min-height:.5rem}:host([size=Small][text]:not([text=\"\"])) .ui5-busy-indicator-root{min-height:1.75rem}:host([size=Small]) .ui5-busy-indicator-circle{width:.5rem;height:.5rem}:host(:not([size])) .ui5-busy-indicator-root,:host([size=Medium]) .ui5-busy-indicator-root{min-width:3rem;min-height:1rem}:host(:not([size])[text]:not([text=\"\"])) .ui5-busy-indicator-root,:host([size=Medium][text]:not([text=\"\"])) .ui5-busy-indicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busy-indicator-circle,:host([size=Medium]) .ui5-busy-indicator-circle{width:1rem;height:1rem}:host([size=Large]) .ui5-busy-indicator-root{min-width:6rem;min-height:2rem}:host([size=Large][text]:not([text=\"\"])) .ui5-busy-indicator-root{min-height:3.25rem}:host([size=Large]) .ui5-busy-indicator-circle{width:2rem;height:2rem}.ui5-busy-indicator-root{display:flex;justify-content:center;align-items:center;position:relative;background-color:inherit}.ui5-busy-indicator-busy-area{position:absolute;z-index:99;left:0;right:0;top:0;bottom:0;display:flex;justify-content:center;align-items:center;background-color:inherit;flex-direction:column}.ui5-busy-indicator-busy-area:focus{outline:var(--_ui5_busy_indicator_focus_outline);outline-offset:-2px;border-radius:var(--_ui5_busy_indicator_focus_border_radius)}.ui5-busy-indicator-circles-wrapper{line-height:0}.ui5-busy-indicator-circle{display:inline-block;background-color:currentColor;border-radius:50%}.ui5-busy-indicator-circle:before{content:\"\";width:100%;height:100%;border-radius:100%}.circle-animation-0{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite}.circle-animation-1{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite;animation-delay:.2s}.circle-animation-2{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite;animation-delay:.4s}.ui5-busy-indicator-text{width:100%;margin-top:.25rem;text-align:center}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}}"
  };
  _exports.default = _default;
});