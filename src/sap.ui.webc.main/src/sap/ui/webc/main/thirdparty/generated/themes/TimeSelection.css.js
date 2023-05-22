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
    fileName: "themes/TimeSelection.css",
    content: ":host(:not([hidden])) {\n    display: inline-block;\n    min-width: 18rem;\n}\n\n.ui5-time-selection-root {\n    width: 100%;\n    height: 100%;\n\tdisplay: flex;\n\tjustify-content: center;\n\talign-items: stretch;\n\tdirection: ltr;\n\tbox-sizing: border-box;\n}\n\n.ui5-time-selection-root.ui5-phone{\n\theight: 90vh;\n}\n\n:host(.ui5-dt-time.ui5-dt-cal--hidden) .ui5-time-selection-root.ui5-phone {\n\theight: 80vh;\n}\n\n[ui5-wheelslider] {\n\tpadding-left: 0.25rem;\n\tpadding-right: 0.25rem;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});