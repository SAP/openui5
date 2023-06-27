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
    fileName: "themes/TableGroupRow.css",
    content: ":host {\n    display: contents;\n}\n\n:host([_busy]) .ui5-table-group-row-root {\n\topacity: 0.72;\n\tpointer-events: none;\n}\n\n.ui5-table-group-row-root {\n\theight: var(--ui5_table_group_row_height);\n\tborder-style: solid;\n\tborder-color: var(--sapList_TableGroupHeaderBorderColor);\n\tborder-width: var(--ui5_table_border_width);\n\tbackground-color: var(--sapList_TableGroupHeaderBackground);\n\tcolor: var(--sapList_TableGroupHeaderTextColor);\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n\tfont-weight: var(--ui5_table_group_row_font-weight);\n}\n\n.ui5-table-group-row-root:focus {\n\toutline: var(--ui5_table_row_outline_width) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\toutline-offset: var(--ui5_table_focus_outline_offset);\n}\n\ntd {\n\tword-break: break-word;\n\tvertical-align: middle;\n\tpadding: .5rem .25rem .5rem 1rem;\n\ttext-align: start;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});