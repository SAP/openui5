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
    content: ".ui5-valuestatemessage-popover{border-radius:var(--_ui5-v1-18-0_value_state_message_popover_border_radius);box-shadow:var(--_ui5-v1-18-0_value_state_message_popover_box_shadow)}.ui5-input-value-state-message-icon{display:var(--_ui5-v1-18-0_input_value_state_icon_display);height:var(--_ui5-v1-18-0_value_state_message_icon_height);padding-right:.375rem;position:absolute;width:var(--_ui5-v1-18-0_value_state_message_icon_width)}.ui5-valuestatemessage-root .ui5-input-value-state-message-icon{left:var(--_ui5-v1-18-0_input_value_state_icon_offset)}.ui5-input-value-state-message-icon[name=error]{color:var(--sapNegativeElementColor)}.ui5-input-value-state-message-icon[name=alert]{color:var(--sapCriticalElementColor)}.ui5-input-value-state-message-icon[name=success]{color:var(--sapPositiveElementColor)}.ui5-input-value-state-message-icon[name=information]{color:var(--sapInformativeElementColor)}.ui5-valuestatemessage-root{border:var(--_ui5-v1-18-0_value_state_message_border);box-sizing:border-box;color:var(--sapTextColor);display:inline-block;font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSmallSize);height:auto;min-width:6.25rem;overflow:hidden;padding:var(--_ui5-v1-18-0_value_state_message_padding);text-overflow:ellipsis}[ui5-popover] .ui5-valuestatemessage-header,[ui5-responsive-popover] .ui5-valuestatemessage-header{min-height:2rem}[ui5-responsive-popover] .ui5-valuestatemessage-header{border:var(--_ui5-v1-18-0_value_state_header_border);border-bottom:var(--_ui5-v1-18-0_value_state_header_border_bottom);padding:var(--_ui5-v1-18-0_value_state_header_padding)}.ui5-valuestatemessage--success{background:var(--sapSuccessBackground)}.ui5-valuestatemessage--warning{background:var(--sapWarningBackground)}.ui5-valuestatemessage--error{background:var(--sapErrorBackground)}.ui5-valuestatemessage--information{background:var(--sapInformationBackground)}.ui5-responsive-popover-header:focus,.ui5-responsive-popover-header[focused]{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:var(--_ui5-v1-18-0_value_state_header_offset)}.ui5-valuestatemessage-popover::part(content),.ui5-valuestatemessage-popover::part(header){padding:0}.ui5-valuestatemessage-popover::part(footer),.ui5-valuestatemessage-popover::part(header){min-height:0}.ui5-suggestions-popover-with-value-state-header::part(header),.ui5-valuestatemessage-popover::part(header){margin-bottom:0}"
  };
  var _default = styleData;
  _exports.default = _default;
});