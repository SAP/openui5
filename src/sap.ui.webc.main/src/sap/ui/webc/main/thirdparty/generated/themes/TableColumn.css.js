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
    fileName: "themes/TableColumn.css",
    content: ":host {\n\tdisplay: contents;\n}\n\nth {\n\tbackground: var(--sapList_HeaderBackground);\n\twidth: inherit;\n\tfont-weight: var(--ui5_table_header_row_font_weight);\n\tfont-size: var(--sapFontMediumSize);\n\tpadding: 0.5rem;\n\tbox-sizing: border-box;\n\ttext-align: start;\n\tvertical-align: middle;\n}\n\n:host([first]) th {\n\tpadding-inline-start: 1rem;\n}\n\nth ::slotted([ui5-label]) {\n\tfont-weight: var(--ui5_table_header_row_font_weight);\n\tfont-size: var(--sapFontMediumSize);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});