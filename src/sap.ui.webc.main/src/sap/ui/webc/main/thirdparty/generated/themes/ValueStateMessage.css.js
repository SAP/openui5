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
    fileName: "themes/ValueStateMessage.css",
    content: ".ui5-valuestatemessage-popover {\n\tborder-radius: var(--_ui5_value_state_message_popover_border_radius);\n\tbox-shadow: var(--_ui5_value_state_message_popover_box_shadow);\n}\n\n.ui5-input-value-state-message-icon {\n\twidth: var(--_ui5_value_state_message_icon_width);\n\theight: var(--_ui5_value_state_message_icon_height);\n\tdisplay: var(--_ui5_input_value_state_icon_display);\n\tposition: absolute;\n\tpadding-right: 0.375rem;\n}\n\n.ui5-valuestatemessage-root .ui5-input-value-state-message-icon {\n\tleft: var(--_ui5_input_value_state_icon_offset);\n}\n\n.ui5-input-value-state-message-icon[name=\"error\"] {\n\tcolor: var(--sapNegativeElementColor);\n}\n\n.ui5-input-value-state-message-icon[name=\"alert\"] {\n\tcolor: var(--sapCriticalElementColor);\n}\n\n.ui5-input-value-state-message-icon[name=\"success\"] {\n\tcolor: var(--sapPositiveElementColor);\n}\n\n.ui5-input-value-state-message-icon[name=\"information\"] {\n\tcolor: var(--sapInformativeElementColor);\n}\n\n.ui5-valuestatemessage-root {\n\tbox-sizing: border-box;\n\tdisplay: inline-block;\n\tcolor: var(--sapTextColor);\n\tfont-size: var(--sapFontSmallSize);\n\tfont-family: \"72override\", var(--sapFontFamily);\n\theight: auto;\n\tpadding: var(--_ui5_value_state_message_padding);\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\tmin-width: 6.25rem;\n\tborder: var(--_ui5_value_state_message_border);\n}\n\n[ui5-responsive-popover] .ui5-valuestatemessage-header, [ui5-popover] .ui5-valuestatemessage-header  {\n\tmin-height: 2rem;\n}\n\n[ui5-responsive-popover] .ui5-valuestatemessage-header {\n\tpadding: var(--_ui5_value_state_header_padding);\n\tborder: var(--_ui5_value_state_header_border);\n\tborder-bottom: var(--_ui5_value_state_header_border_bottom);\n}\n\n.ui5-valuestatemessage--success {\n\tbackground: var(--sapSuccessBackground);\n}\n\n.ui5-valuestatemessage--warning {\n\tbackground: var(--sapWarningBackground);\n}\n\n.ui5-valuestatemessage--error {\n\tbackground: var(--sapErrorBackground);\n}\n\n.ui5-valuestatemessage--information {\n\tbackground: var(--sapInformationBackground);\n}\n\n.ui5-responsive-popover-header[focused], .ui5-responsive-popover-header:focus {\n\toutline-offset: var(--_ui5_value_state_header_offset);\n\toutline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);\n}\n\n.ui5-valuestatemessage-popover::part(header),\n.ui5-valuestatemessage-popover::part(content) {\n\tpadding: 0;\n}\n\n.ui5-valuestatemessage-popover::part(header),\n.ui5-valuestatemessage-popover::part(footer) {\n\tmin-height: 0;\n}\n\n.ui5-valuestatemessage-popover::part(header),\n.ui5-suggestions-popover-with-value-state-header::part(header) {\n\tmargin-bottom: 0;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});