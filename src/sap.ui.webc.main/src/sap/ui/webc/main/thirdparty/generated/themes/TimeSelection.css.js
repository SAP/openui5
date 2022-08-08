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
    fileName: "themes/TimeSelection.css",
    content: ":host(:not([hidden])){display:inline-block;min-width:18rem}.ui5-time-selection-root{width:100%;height:100%;display:flex;justify-content:center;align-items:stretch;direction:ltr;box-sizing:border-box}.ui5-time-selection-root.ui5-phone{height:90vh}:host(.ui5-dt-time.ui5-dt-cal--hidden) .ui5-time-selection-root.ui5-phone{height:80vh}[ui5-wheelslider]{padding-left:.25rem;padding-right:.25rem}"
  };
  _exports.default = _default;
});