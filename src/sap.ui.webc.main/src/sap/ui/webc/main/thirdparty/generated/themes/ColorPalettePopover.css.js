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
    fileName: "themes/ColorPalettePopover.css",
    content: ".ui5-cp-header {\n\twidth: 100%;\n\theight: var(--_ui5_color-palette-button-height);\n\tdisplay: flex;\n\talign-items: center;\n}\n\n.ui5-cp-footer {\n\twidth: 100%;\n\tdisplay: flex;\n\tjustify-content: flex-end;\n\tmargin: 0.1875rem 0;\n}\n\n[ui5-responsive-popover]::part(content) {\n\tpadding: 0;\n}\n\n.ui5-cp-item-container {\n\tpadding: 0.3125rem 0.6875rem;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});