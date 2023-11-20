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
    content: ":host{display:contents}:host([_busy]) .ui5-table-group-row-root{opacity:.72;pointer-events:none}.ui5-table-group-row-root{background-color:var(--sapList_TableGroupHeaderBackground);border-color:var(--sapList_TableGroupHeaderBorderColor);border-style:solid;border-width:var(--ui5-v1-18-0_table_border_width);color:var(--sapList_TableGroupHeaderTextColor);font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:var(--ui5-v1-18-0_table_group_row_font-weight);height:var(--ui5-v1-18-0_table_group_row_height)}.ui5-table-group-row-root:focus{outline:var(--ui5-v1-18-0_table_row_outline_width) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:var(--ui5-v1-18-0_table_focus_outline_offset)}td{padding:.5rem .25rem .5rem 1rem;text-align:start;vertical-align:middle;word-break:break-word}"
  };
  var _default = styleData;
  _exports.default = _default;
});