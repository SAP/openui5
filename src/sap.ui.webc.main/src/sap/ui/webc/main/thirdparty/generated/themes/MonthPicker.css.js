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
    fileName: "themes/MonthPicker.css",
    content: ":host(:not([hidden])) {\n\tdisplay: block;\n}\n\n:host {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.ui5-mp-root {\n\tpadding: 2rem 0 1rem 0;\n\tdisplay: flex;\n\tflex-direction: column;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n\tjustify-content: center;\n\talign-items: center;\n}\n\n.ui5-mp-item {\n\tdisplay: flex;\n\tflex-direction: column;\n\twidth: calc(33.333% - 0.125rem);\n\theight: var(--_ui5_month_picker_item_height);\n\tcolor: var(--sapButton_Lite_TextColor);\n\tbackground-color: var(--sapLegend_WorkingBackground);\n\talign-items: center;\n\tjustify-content: center;\n\tmargin: var(--_ui5_monthpicker_item_margin);\n\tbox-sizing: border-box;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\tuser-select: none;\n\tcursor: default;\n\toutline: none;\n\tposition: relative;\n\tborder: var(--_ui5_monthpicker_item_border);\n\tborder-radius: var(--_ui5_monthpicker_item_border_radius);\n}\n\n.ui5-dp-monthsectext {\n\tfont-size: 0.75rem;\n\tcolor: var(--sapNeutralElementColor);\n}\n\n.ui5-mp-item:hover {\n\tbackground-color: var(--sapList_Hover_Background);\n}\n\n.ui5-mp-item.ui5-mp-item--selected,\n.ui5-mp-item.ui5-mp-item--selected .ui5-dp-monthsectext {\n\tbox-shadow: var(--_ui5_monthpicker_item_selected_box_shadow);\n\tfont-weight: var(--_ui5_monthpicker_item_selected_font_wieght);\n\tbackground-color: var(--_ui5_monthpicker_item_selected_background_color);\n\tcolor: var(--_ui5_monthpicker_item_selected_text_color);\n}\n\n.ui5-mp-item.ui5-mp-item--disabled {\n\tpointer-events: none;\n\topacity: 0.5;\n}\n\n.ui5-mp-item.ui5-mp-item--selected:focus {\n\tbackground-color: var(--sapContent_Selected_Background);\n}\n\n.ui5-mp-item.ui5-mp-item--selected:focus::after {\n\tborder-color: var(--_ui5_monthpicker_item_focus_after_border);\n}\n\n.ui5-mp-item.ui5-mp-item--selected:hover {\n\tbackground-color: var(--_ui5_monthpicker_item_selected_hover_color);\n}\n\n.ui5-mp-item:focus::after {\n\tcontent: \"\";\n\tposition: absolute;\n\tborder: var(--_ui5_button_focused_border);\n\tinset: 0;\n\tborder-radius: var(--_ui5_monthpicker_item_focus_after_border_radius);\n}\n\n.ui5-mp-quarter {\n\tdisplay: flex;\n\tjustify-content: center;\n\talign-items: center;\n\twidth: 100%;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});