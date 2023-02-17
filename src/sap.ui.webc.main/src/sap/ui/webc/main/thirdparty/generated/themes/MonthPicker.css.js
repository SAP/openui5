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
    fileName: "themes/MonthPicker.css",
    content: ":host(:not([hidden])){display:block}:host{width:100%;height:100%}.ui5-mp-root{padding:2rem 0 1rem 0;display:flex;flex-direction:column;font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);justify-content:center;align-items:center}.ui5-mp-item{display:flex;width:calc(33.333% - .125rem);height:var(--_ui5_month_picker_item_height);color:var(--sapButton_Lite_TextColor);background-color:var(--sapLegend_WorkingBackground);align-items:center;justify-content:center;margin:var(--_ui5_monthpicker_item_margin);box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;user-select:none;cursor:default;outline:none;position:relative;border:var(--_ui5_monthpicker_item_border);border-radius:var(--_ui5_monthpicker_item_border_radius)}.ui5-mp-item:hover{background-color:var(--sapList_Hover_Background)}.ui5-mp-item.ui5-mp-item--selected{box-shadow:var(--_ui5_monthpicker_item_selected_box_shadow);font-weight:var(--_ui5_monthpicker_item_selected_font_wieght);background-color:var(--_ui5_monthpicker_item_selected_background_color);color:var(--_ui5_monthpicker_item_selected_text_color)}.ui5-mp-item.ui5-mp-item--disabled{pointer-events:none;opacity:.5}.ui5-mp-item.ui5-mp-item--selected:focus{background-color:var(--sapContent_Selected_Background)}.ui5-mp-item.ui5-mp-item--selected:focus:after{border-color:var(--sapContent_ContrastFocusColor)}.ui5-mp-item.ui5-mp-item--selected:hover{background-color:var(--_ui5_monthpicker_item_selected_hover_color)}.ui5-mp-item:focus:after{content:\"\";position:absolute;border:var(--_ui5_button_focused_border);inset:0;border-radius:var(--_ui5_monthpicker_item_focus_after_border_radius)}.ui5-mp-quarter{display:flex;justify-content:center;align-items:center;width:100%}"
  };
  _exports.default = _default;
});