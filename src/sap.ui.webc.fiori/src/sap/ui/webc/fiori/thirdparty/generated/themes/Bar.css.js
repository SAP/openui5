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
    fileName: "themes/Bar.css",
    content: ":host {\n\tbackground-color: var(--sapPageHeader_Background);\n\theight: var(--_ui5_bar_base_height);\n\twidth: 100%;\n\tbox-shadow: inset 0 -0.0625rem var(--sapPageHeader_BorderColor);\n\tdisplay: block;\n}\n\n.ui5-bar-root {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\theight: inherit;\n\twidth: inherit;\n\tbackground-color: inherit;\n\tbox-shadow: inherit;\n\tborder-radius: inherit;\n}\n\n.ui5-bar-root .ui5-bar-startcontent-container {\n\tpadding-inline-start: 0.5rem;\n\tdisplay: flex;\n\tflex-direction: row;\n\talign-items: center;\n\tjustify-content: flex-start;\n}\n\n.ui5-bar-root .ui5-bar-content-container {\n\tmin-width: 30%;\n}\n\n.ui5-bar-root.ui5-bar-root-shrinked .ui5-bar-content-container {\n\tmin-width: 0px;\n\toverflow: hidden;\n\theight: 100%;\n}\n\n.ui5-bar-root .ui5-bar-endcontent-container {\n\tpadding-inline-end: 0.5rem;\n\tdisplay: flex;\n\tflex-direction: row;\n\talign-items: center;\n\tjustify-content: flex-end;\n}\n\n.ui5-bar-root .ui5-bar-midcontent-container {\n\tpadding-left: 0.5rem;\n\tpadding-right: 0.5rem;\n\tdisplay: flex;\n\tflex-direction: row;\n\talign-items: center;\n\tjustify-content: center;\n}\n\n:host([design=\"Footer\"]){\n\tbackground-color: var(--sapPageFooter_Background);\n\tborder-top: 0.0625rem solid var(--sapPageFooter_BorderColor);\n\tbox-shadow: none;\n}\n\n:host([design=\"Subheader\"]){\n\theight: var(--_ui5_bar_subheader_height);\n}\n\n:host([design=\"FloatingFooter\"]){\n\tborder-radius: var(--sapElement_BorderCornerRadius);\n\tbackground-color: var(--sapPageFooter_Background);\n\tbox-shadow: var(--sapContent_Shadow1);\n\tborder: none;\n}\n\n::slotted(*) {\n\tmargin: 0 0.25rem;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});