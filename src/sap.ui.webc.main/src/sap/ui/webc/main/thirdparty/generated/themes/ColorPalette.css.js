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
    fileName: "themes/ColorPalette.css",
    content: ":host(:not([hidden])) {\n\tdisplay: inline-block;\n}\n\n:host(:not([hidden])[popup-mode]) {\n\twidth: 100%;\n}\n\n.ui5-cp-root {\n\tdisplay: flex;\n\tflex-direction: column;\n}\n\n.ui5-cp-root.ui5-cp-root-phone,\n.ui5-cp-separator,\n.ui5-cp-root.ui5-cp-root-phone .ui5-cp-more-colors-wrapper,\n.ui5-cp-root.ui5-cp-root-phone .ui5-cp-default-color-button-wrapper,\n.ui5-cp-recent-colors-wrapper {\n\twidth: 100%;\n}\n\n.ui5-cp-root.ui5-cp-root-phone .ui5-cp-item-container {\n\twidth: 18.5rem;\n\tmax-width: 19.5rem;\n\tmax-height: 13rem;\n\tpadding: 0.375rem 0.625rem;\n}\n\n.ui5-cp-recent-colors-wrapper {\n\tdisplay: flex;\n\talign-items: center;\n\tflex-direction: column;\n}\n\n.ui5-cp-root.ui5-cp-root-phone {\n\tdisplay: flex;\n\talign-items: center;\n}\n\n.ui5-cp-item-container {\n\tdisplay: flex;\n\tmax-width: var(--_ui5_color-palette-row-width);\n\tflex-flow: wrap;\n\tmax-height: var(--_ui5_color-palette-row-height);\n\toverflow: hidden;\n\tpadding: var(--_ui5_color-palette-swatch-container-padding);\n}\n\n.ui5-cp-separator {\n\theight: 0.0625rem;\n\tbackground: var(--sapToolbar_SeparatorColor);\n}\n\n.ui5-cp-more-colors,\n.ui5-cp-default-color-button {\n\twidth: 100%;\n\theight: var(--_ui5_color-palette-button-height);\n\ttext-align: center;\n\tborder: none;\n}\n\n.ui5-cp-more-colors-wrapper,\n.ui5-cp-default-color-button-wrapper {\n\tdisplay: flex;\n\tflex-direction: column;\n}\n\n.ui5-cp-separator {\n\theight: 0.0625rem;\n\tbackground: var(--sapToolbar_SeparatorColor);\n}\n\n.ui5-cp-default-color-button,\n.ui5-cp-more-colors {\n\tpadding: 0.0625rem;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});