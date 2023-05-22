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
    fileName: "themes/Icon.css",
    content: ":host {\n\t-webkit-tap-highlight-color: rgba(0,0,0,0);\n}\n\n:host([hidden]) {\n\tdisplay: none;\n}\n\n:host([invalid]) {\n\tdisplay:none;\n}\n\n/*The ui5_hovered class is set by FileUploader to indicate hover state of the control*/\n\n:host(:not([hidden]).ui5_hovered) {\n\topacity: .7;\n}\n\n:host {\n\tdisplay: inline-block;\n\twidth: 1rem;\n\theight: 1rem;\n\tcolor: var(--sapContent_NonInteractiveIconColor);\n\tfill: currentColor;\n\toutline: none;\n}\n\n:host([design=\"Contrast\"]) {\n\tcolor: var(--sapContent_ContrastIconColor);\n}\n\n:host([design=\"Critical\"]) {\n\tcolor: var(--sapCriticalElementColor);\n}\n\n:host([design=\"Default\"]) {\n\tcolor: var(--sapContent_IconColor);\n}\n\n:host([design=\"Information\"]) {\n\tcolor: var(--sapInformativeElementColor);\n}\n\n:host([design=\"Negative\"]) {\n\tcolor: var(--sapNegativeElementColor);\n}\n\n:host([design=\"Neutral\"]) {\n\tcolor: var(--sapNeutralElementColor);\n}\n\n:host([design=\"NonInteractive\"]) {\n\tcolor: var(--sapContent_NonInteractiveIconColor);\n}\n\n:host([design=\"Positive\"]) {\n\tcolor: var(--sapPositiveElementColor);\n}\n\n:host([interactive][focused]) .ui5-icon-root {\n\toutline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n\tborder-radius: var(--ui5-icon-focus-border-radius);\n}\n\n.ui5-icon-root {\n\tdisplay:flex;\n\theight: 100%;\n\twidth: 100%;\n\toutline: none;\n\tvertical-align: top;\n}\n\n:host([interactive]) {\n\tcursor: pointer;\n}\n\n/*\n * The Icon is currently the only component that enforces \"LTR\" direction inside its ShadowDOM\n * as some icons should not be mirrored in RTL (f.e. checkmark, search, etc.).\n * That means, we can have \"RTL\" set globally and \"LTR\" set internally for the Icon ShadowDom\n  * html dir=rtl\n * \t\t[ui5-icon]\n * \t\t\t#shadowroot\n * \t\t\t\tsvg dir=ltr\n * In this case, we need to explicitly check for it as the global CSS definitions (rtl-parameters.css)\n * is placed in the \"head\" and won't consider it.\n */\n\n.ui5-icon-root:not([dir=\"ltr\"]) {\n\ttransform: var(--_ui5_icon_transform_scale);\n\ttransform-origin: center;\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});