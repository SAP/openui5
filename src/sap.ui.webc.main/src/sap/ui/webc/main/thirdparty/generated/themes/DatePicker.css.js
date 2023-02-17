sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Themes", "sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css", "./sap_fiori_3/parameters-bundle.css"], function (_exports, _Themes, _parametersBundle, _parametersBundle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parametersBundle = _interopRequireDefault(_parametersBundle);
  _parametersBundle2 = _interopRequireDefault(_parametersBundle2);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-theming", "sap_fiori_3", () => _parametersBundle.default);
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents", "sap_fiori_3", () => _parametersBundle2.default);
  var _default = {
    packageName: "@ui5/webcomponents",
    fileName: "themes/DatePicker.css",
    content: ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}[input-icon]{color:var(--_ui5_input_icon_color);cursor:pointer;outline:none;padding:var(--_ui5_input_icon_padding);border-inline-start:var(--_ui5_input_icon_border);min-width:1rem;min-height:1rem;border-radius:var(--_ui5_input_icon_border_radius)}[input-icon][pressed]{background:var(--_ui5_input_icon_pressed_bg);box-shadow:var(--_ui5_input_icon_box_shadow);border-inline-start:var(--_ui5_select_hover_icon_left_border);color:var(--_ui5_input_icon_pressed_color)}[input-icon]:active{background-color:var(--sapButton_Active_Background);box-shadow:var(--_ui5_input_icon_box_shadow);border-inline-start:var(--_ui5_select_hover_icon_left_border);color:var(--_ui5_input_icon_pressed_color)}[input-icon]:not([pressed]):not(:active):hover{background:var(--_ui5_input_icon_hover_bg);box-shadow:var(--_ui5_input_icon_box_shadow)}[input-icon]:hover{border-inline-start:var(--_ui5_select_hover_icon_left_border);box-shadow:var(--_ui5_input_icon_box_shadow)}:host(:not([hidden])){display:inline-block;line-height:normal;letter-spacing:normal;word-spacing:normal}:host{color:var(--sapField_TextColor);background-color:var(--sapField_Background);border-radius:var(--_ui5-datepicker_border_radius)}:host([value-state=Error]){background-color:var(--sapField_InvalidBackground)}:host(:not([disabled]):not([readonly]):active){background:var(--_ui5-datepicker-hover-background)}:host(:not([disabled]):not([readonly]):hover){background:var(--_ui5-datepicker-hover-background)}:host .ui5-date-picker-input{width:100%;min-width:12.5625rem;color:inherit;background-color:inherit;line-height:inherit;letter-spacing:inherit;word-spacing:inherit}:host(:not([disabled]):not([readonly])) .ui5-date-picker-input[focused]{background-color:var(--_ui5-datepicker-hover-background)}[slot=icon]{border-top-right-radius:var(--_ui5-datepicker_icon_border_radius);border-bottom-right-radius:var(--_ui5-datepicker_icon_border_radius)}"
  };
  _exports.default = _default;
});