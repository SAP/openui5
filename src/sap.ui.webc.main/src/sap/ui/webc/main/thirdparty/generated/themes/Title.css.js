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
    fileName: "themes/Title.css",
    content: ":host(:not([hidden])) {\n\tdisplay: block;\n\tcursor: text;\n}\n\n:host {\n\tmax-width: 100%;\n\tcolor: var(--sapGroup_TitleTextColor);\n\tfont-size: var(--sapFontHeader2Size);\n\tfont-family: \"72override\", var(--sapFontHeaderFamily);\n\ttext-shadow: var(--sapContent_TextShadow);\n}\n\n.ui5-title-root {\n\tdisplay: inline-block;\n\tposition: relative;\n\tfont-weight: normal;\n\tfont-size: inherit;\n\tbox-sizing: border-box;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\twhite-space: nowrap;\n\tmax-width: 100%;\n\tvertical-align: bottom;\n\t-webkit-margin-before: 0;\n\t-webkit-margin-after: 0;\n\t-webkit-margin-start: 0;\n\t-webkit-margin-end: 0;\n\tmargin: 0;\n\tcursor: inherit;\n}\n\n:host([wrapping-type=\"Normal\"]) .ui5-title-root,\n:host([wrapping-type=\"Normal\"]) ::slotted(*) {\n\twhite-space: pre-line;\n}\n\n::slotted(*) {\n\tfont-size: inherit;\n\tfont-family: inherit;\n\ttext-shadow: inherit;\n}\n\n/* Level H1 */\n\n:host([level=\"H1\"]) {\n\tfont-size: var(--sapFontHeader1Size);\n}\n\n/* Level H2 */\n\n:host([level=\"H2\"]) {\n\tfont-size: var(--sapFontHeader2Size);\n}\n\n/* Level H3 */\n\n:host([level=\"H3\"]) {\n\tfont-size: var(--sapFontHeader3Size);\n}\n\n/* Level H4 */\n\n:host([level=\"H4\"]) {\n\tfont-size: var(--sapFontHeader4Size);\n}\n\n/* Level H5 */\n\n:host([level=\"H5\"]) {\n\tfont-size: var(--sapFontHeader5Size);\n}\n\n/* Level H6 */\n\n:host([level=\"H6\"]) {\n\tfont-size: var(--sapFontHeader6Size);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});