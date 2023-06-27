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
    fileName: "themes/TabSemanticIcon.css",
    content: ".ui5-tab-semantic-icon {\n\tdisplay: var(--_ui5_tc_headerItemSemanticIcon_display);\n\theight: var(--_ui5_tc_headerItemSemanticIcon_size);\n\twidth: var(--_ui5_tc_headerItemSemanticIcon_size);\n\tmargin-inline-end: 0.5rem;\n}\n\n.ui5-tab-semantic-icon--positive {\n\tcolor: var(--sapPositiveElementColor);\n}\n\n.ui5-tab-semantic-icon--negative {\n\tcolor: var(--sapNegativeElementColor);\n}\n\n.ui5-tab-semantic-icon--critical {\n\tcolor: var(--sapCriticalElementColor);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});