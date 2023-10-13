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
    fileName: "themes/TableCell.css",
    content: ":host{box-sizing:border-box;color:var(--sapList_TextColor);display:table-cell;font-family:\"72override\",var(--sapFontFamily);font-size:.875rem;height:var(--ui5-v1-18-0_table_row_height);vertical-align:middle;word-break:break-word}td{display:contents}:host([popined]){padding-left:0;padding-top:.25rem}:host([_popined-inline]){padding-top:0}::slotted([ui5-label]){color:inherit}"
  };
  var _default = styleData;
  _exports.default = _default;
});