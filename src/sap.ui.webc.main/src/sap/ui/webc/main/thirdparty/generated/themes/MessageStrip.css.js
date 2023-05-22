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
    fileName: "themes/MessageStrip.css",
    content: ".ui5-hidden-text {\n\tposition: absolute;\n\tclip: rect(1px,1px,1px,1px);\n\tuser-select: none;\n\tleft: -1000px; /* ensure the invisible texts are never part of the viewport */\n\ttop: -1000px;\n\tpointer-events: none;\n\tfont-size: 0;\n}\n\n:host(:not([hidden])) {\n\tdisplay: inline-block;\n\twidth: 100%;\n}\n\n/** Root classes **/\n\n.ui5-message-strip-root {\n\twidth: 100%;\n\theight: 100%;\n\tdisplay: flex;\n\tborder-radius: var(--sapPopover_BorderCornerRadius);\n\tpadding: var(--_ui5_message_strip_padding);\n\tborder-width: var(--_ui5_message_strip_border_width);\n\tborder-style: solid;\n\tbox-sizing: border-box;\n\tposition: relative;\n}\n\n.ui5-message-strip-root-hide-icon {\n\tpadding-inline: var(--_ui5_message_strip_padding_inline_no_icon);\n\tpadding-block: var(--_ui5_message_strip_padding_block_no_icon);\n}\n\n.ui5-message-strip-root-hide-close-button {\n\tpadding-inline-end: 1rem;\n}\n\n.ui5-message-strip-root--info {\n\tbackground-color: var(--sapInformationBackground);\n\tborder-color: var(--sapMessage_InformationBorderColor);\n\tcolor: var(--sapTextColor);\n}\n\n.ui5-message-strip-root--info .ui5-message-strip-icon {\n\tcolor: var(--sapInformativeElementColor);\n}\n\n.ui5-message-strip-root--positive {\n\tbackground-color: var(--sapSuccessBackground);\n\tborder-color: var(--sapMessage_SuccessBorderColor);\n}\n\n.ui5-message-strip-root--positive .ui5-message-strip-icon {\n\tcolor: var(--sapPositiveElementColor);\n}\n\n.ui5-message-strip-root--negative {\n\tbackground-color: var(--sapErrorBackground);\n\tborder-color: var(--sapMessage_ErrorBorderColor);\n}\n\n.ui5-message-strip-root--negative .ui5-message-strip-icon {\n\tcolor: var(--sapNegativeElementColor);\n}\n\n.ui5-message-strip-root--warning {\n\tbackground-color: var(--sapWarningBackground);\n\tborder-color: var(--sapMessage_WarningBorderColor);\n}\n\n.ui5-message-strip-root--warning .ui5-message-strip-icon {\n\tcolor: var(--sapCriticalElementColor);\n}\n\n/** Icon wrapper **/\n\n.ui5-message-strip-icon-wrapper {\n\tposition: absolute;\n\ttop: var(--_ui5_message_strip_icon_top);\n\tinset-inline-start: 0.75rem;\n\tbox-sizing: border-box;\n}\n\n/** Text **/\n\n.ui5-message-strip-text {\n\twidth: 100%;\n\tcolor: var(--sapTextColor);\n\tline-height: 1.2;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n}\n\n/** Close button - always in compact mode **/\n\n.ui5-message-strip-close-button {\n\twidth: 2rem;\n\tmin-width: 2rem;\n\theight: 1.65rem;\n\tmin-height: 1.65rem;\n\tposition: absolute;\n\ttop: var(--_ui5_message_strip_close_button_top);\n\tinset-inline-end: var(--_ui5_message_strip_close_button_right);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});