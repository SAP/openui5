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
    fileName: "themes/TimeSelectionInputs.css",
    content: ".ui5-time-selection-numeric-input{text-align:center;width:2.875rem}.ui5-time-selection-inputs{align-items:center;display:flex;justify-content:center;min-width:12.5rem}span[separator]{color:var(--sapTextColor);display:inline-block;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);min-width:.5rem;padding:0 .125rem;text-align:center}.ui5-hidden-text{display:none}"
  };
  var _default = styleData;
  _exports.default = _default;
});