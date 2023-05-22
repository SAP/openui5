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
    fileName: "themes/Label.css",
    content: ":host(:not([hidden])) {\n\tdisplay: inline-flex;\n}\n\n:host {\n\tmax-width: 100%;\n\tcolor: var(--sapContent_LabelColor);\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n\tfont-weight: normal;\n\tcursor: text;\n}\n\n.ui5-label-root {\n\twidth: 100%;\n\tcursor: inherit;\n}\n\n:host([wrapping-type=\"Normal\"]) .ui5-label-root {\n\twhite-space: normal;\n}\n\n:host(:not([wrapping-type=\"Normal\"])) .ui5-label-root {\n\tdisplay: inline-flex;\n\twhite-space: nowrap;\n}\n\n:host(:not([wrapping-type=\"Normal\"])) .ui5-label-text-wrapper {\n\ttext-overflow: ellipsis;\n\toverflow: hidden;\n\tdisplay: inline-block;\n\tvertical-align: top;\n\tflex: 0 1 auto;\n\tmin-width: 0;\n}\n\n:host([show-colon]) .ui5-label-required-colon:before {\n\tcontent: attr(data-colon);\n}\n\n:host([required]) .ui5-label-required-colon:after {\n\tcontent:\"*\";\n\tcolor: var(--sapField_RequiredColor);\n\tfont-size: 1.25rem;\n\tfont-weight: bold;\n\tposition: relative;\n\tfont-style: normal;\n\tvertical-align: middle;\n\tline-height: 0;\n}\n\n:host([required][show-colon]) .ui5-label-required-colon:after {\n\tmargin-inline-start: .125rem;\n}\n\nbdi {\n\tpadding-right: 0.075rem; /*1.2px - fix for last letter clipping issue when style is italic*/\n}\n\n:host([show-colon]) .ui5-label-required-colon {\n\tmargin-inline-start: -0.05rem; /*0.8px - fix for last letter clipping issue when style is italic*/\n\twhite-space: pre;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});