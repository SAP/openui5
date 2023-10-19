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
    content: ":host{display:contents}th{background:var(--sapList_HeaderBackground);box-sizing:border-box;font-family:var(--ui5-v1-18-0_table_header_row_font_family);font-size:var(--sapFontMediumSize);font-weight:var(--ui5-v1-18-0_table_header_row_font_weight);padding:.5rem;text-align:start;vertical-align:middle;width:inherit}:host([first]) th{padding-inline-start:1rem}th ::slotted([ui5-label]){font-family:var(--ui5-v1-18-0_table_header_row_font_family);font-size:var(--sapFontMediumSize);font-weight:var(--ui5-v1-18-0_table_header_row_font_weight)}"
  };
  var _default = styleData;
  _exports.default = _default;
});