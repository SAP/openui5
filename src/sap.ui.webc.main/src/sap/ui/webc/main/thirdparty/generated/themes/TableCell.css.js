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
    content: ":host {\n\tdisplay: table-cell;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: 0.875rem;\n\theight: var(--ui5_table_row_height);\n\tbox-sizing: border-box;\n\tcolor: var(--sapContent_LabelColor);\n\tword-break: break-word;\n\tvertical-align: middle;\n}\n\ntd {\n\tdisplay: contents;\n}\n\n:host([popined]) {\n\tpadding-left: 0;\n\tpadding-top: .25rem;\n}\n\n:host([_popined-inline]) {\n\tpadding-top: 0;\n}\n\n::slotted([ui5-label]) {\n\tcolor: inherit;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});