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
    fileName: "themes/TimeSelectionClocks.css",
    content: ".ui5-time-picker-tsc-container{box-sizing:border-box;height:23.75rem;margin:0 auto;padding:1rem;text-align:center;width:20rem}.ui5-time-picker-tsc-container:focus{outline:none}.ui5-time-picker-tsc-buttons{align-items:center;display:flex;justify-content:center;padding-bottom:1rem;width:18rem}.ui5-time-picker-tsc-buttons span[separator]{color:var(--sapContent_LabelColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);min-width:.5rem;padding:0 .125rem;text-align:center}.ui5-time-picker-tsc-clocks{display:block;height:18rem;text-align:center;touch-action:none;width:18rem}"
  };
  var _default = styleData;
  _exports.default = _default;
});