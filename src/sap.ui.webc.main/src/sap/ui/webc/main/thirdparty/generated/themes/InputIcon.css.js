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
    fileName: "themes/InputIcon.css",
    content: "[input-icon]{border-inline-start:var(--_ui5-v1-18-0_input_icon_border);border-radius:var(--_ui5-v1-18-0_input_icon_border_radius);color:var(--_ui5-v1-18-0_input_icon_color);cursor:pointer;min-height:1rem;min-width:1rem;outline:none;padding:var(--_ui5-v1-18-0_input_icon_padding)}[input-icon][pressed]{background:var(--_ui5-v1-18-0_input_icon_pressed_bg);border-inline-start:var(--_ui5-v1-18-0_select_hover_icon_left_border);box-shadow:var(--_ui5-v1-18-0_input_icon_box_shadow);color:var(--_ui5-v1-18-0_input_icon_pressed_color)}[input-icon]:active{background-color:var(--sapButton_Active_Background);border-inline-start:var(--_ui5-v1-18-0_select_hover_icon_left_border);box-shadow:var(--_ui5-v1-18-0_input_icon_box_shadow);color:var(--_ui5-v1-18-0_input_icon_pressed_color)}[input-icon]:not([pressed]):not(:active):hover{background:var(--_ui5-v1-18-0_input_icon_hover_bg);box-shadow:var(--_ui5-v1-18-0_input_icon_box_shadow)}[input-icon]:hover{border-inline-start:var(--_ui5-v1-18-0_select_hover_icon_left_border);box-shadow:var(--_ui5-v1-18-0_input_icon_box_shadow)}"
  };
  var _default = styleData;
  _exports.default = _default;
});