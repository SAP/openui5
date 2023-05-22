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
    fileName: "themes/GrowingButton.css",
    content: "[growing-button] {\n\tdisplay: flex;\n\talign-items: center;\n\tpadding: var(--_ui5_load_more_padding);\n\tborder-top: 1px solid var(--sapList_BorderColor);\n\tborder-bottom: var(--_ui5_load_more_border-bottom);\n\tbox-sizing: border-box;\n\tcursor: pointer;\n\toutline: none;\n}\n\n[growing-button-inner] {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\tflex-direction: column;\n\tmin-height: var(--_ui5_load_more_text_height);\n\twidth: 100%;\n\tcolor: var(--sapButton_TextColor);\n\tbackground-color: var(--sapList_Background);\n\tborder: var(--_ui5_load_more_border);\n\tborder-radius: var(--_ui5_load_more_border_radius);\n\tbox-sizing: border-box;\n}\n\n[growing-button-inner]:focus {\n\toutline: var(--_ui5_load_more_outline_width) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\toutline-offset: -0.125rem;\n\tborder-color: transparent;\n}\n\n[growing-button-inner]:hover {\n\tbackground-color: var(--sapList_Hover_Background);\n}\n\n[growing-button-inner]:active,\n[growing-button-inner][active] {\n\tbackground-color: var(--sapList_Active_Background);\n\tborder-color: var(--sapList_Active_Background);\n}\n\n[growing-button-inner]:active > *,\n[growing-button-inner][active] > * {\n\tcolor: var(--sapList_Active_TextColor);\n}\n\n[growing-button-text],\n[growing-button-subtext] {\n\twidth: 100%;\n\ttext-align: center;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\twhite-space: nowrap;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\tbox-sizing: border-box;\n}\n\n[growing-button-text] {\n\theight: var(--_ui5_load_more_text_height);\n\tpadding: 0.875rem 1rem 0 1rem;\n\tfont-size: var(--_ui5_load_more_text_font_size);\n\tfont-weight: bold;\n}\n\n[growing-button-subtext] {\n\tfont-size: var(--sapFontSize);\n\tpadding: var(--_ui5_load_more_desc_padding);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});