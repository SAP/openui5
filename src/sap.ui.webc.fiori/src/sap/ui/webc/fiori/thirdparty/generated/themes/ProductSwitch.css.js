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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/ProductSwitch.css",
    content: ":host {\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n}\n\n.ui5-product-switch-root {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tjustify-content: inherit;\n\talign-items: inherit;\n\twidth: 752px; /* 4 * item size */\n\tpadding: 1.25rem .75rem;\n}\n\n:host([desktop-columns=\"3\"]) .ui5-product-switch-root {\n\twidth: 564px; /* 3 * item size */\n}\n\n@media only screen and (max-width: 900px) {\n\t.ui5-product-switch-root {\n\t\twidth: 564px; /* 3 * item size */\n\t}\n}\n\n@media only screen and (max-width: 600px) {\n\t.ui5-product-switch-root,\n\t:host([desktop-columns=\"3\"]) .ui5-product-switch-root {\n\t\tflex-direction: column;\n\t\tpadding: 0;\n\t\twidth: 100%;\n\t}\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});