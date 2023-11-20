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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/ProductSwitch.css",
    content: ":host{font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize)}.ui5-product-switch-root{align-items:inherit;display:flex;flex-wrap:wrap;justify-content:inherit;padding:1.25rem .75rem;width:752px}:host([desktop-columns=\"3\"]) .ui5-product-switch-root{width:564px}@media only screen and (max-width:900px){.ui5-product-switch-root{width:564px}}@media only screen and (max-width:600px){.ui5-product-switch-root,:host([desktop-columns=\"3\"]) .ui5-product-switch-root{flex-direction:column;padding:0;width:100%}}"
  };
  var _default = styleData;
  _exports.default = _default;
});