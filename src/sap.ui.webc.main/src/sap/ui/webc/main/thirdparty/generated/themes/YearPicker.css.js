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
    fileName: "themes/YearPicker.css",
    content: ":host(:not([hidden])) {\n\tdisplay: block;\n}\n\n:host {\n\twidth: 100%;\n\theight: 100%;\n}\n\n.ui5-yp-root {\n\tpadding: 2rem 0 1rem 0;\n\tdisplay: flex;\n\tflex-direction: column;\n\tfont-family: \"72override\", var(--sapFontFamily);\n\tfont-size: var(--sapFontSize);\n\tjustify-content: center;\n\talign-items: center;\n}\n\n.ui5-yp-interval-container {\n\tdisplay: flex;\n\tjustify-content: center;\n\talign-items: center;\n\twidth: 100%;\n}\n\n.ui5-yp-item {\n\tdisplay: flex;\n\tmargin: var(--_ui5_yearpicker_item_margin);\n\twidth: calc(25% - 0.125rem);\n\theight: var(--_ui5_year_picker_item_height);\n\tcolor: var(--sapButton_Lite_TextColor);\n\tbackground-color: var(--sapLegend_WorkingBackground);\n\talign-items: center;\n\tjustify-content: center;\n\tbox-sizing: border-box;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\tuser-select: none;\n\tcursor: default;\n\toutline: none;\n\tposition: relative;\n\tborder: var(--_ui5_yearpicker_item_border);\n\tborder-radius: var(--_ui5_yearpicker_item_border_radius);\n}\n\n.ui5-yp-item-secondary-type {\n\tflex-direction: column;\n\twidth: calc(50% - 0.125rem);\n}\n\n.ui5-yp-item-sec-type{\n\tfont-size: 0.75rem;\n\tcolor: var(--sapNeutralElementColor);\n}\n\n.ui5-yp-item:hover {\n\tbackground-color: var(--sapList_Hover_Background);\n}\n\n.ui5-yp-item.ui5-yp-item--selected,\n.ui5-yp-item.ui5-yp-item--selected .ui5-yp-item-sec-type {\n\tbackground-color: var(--_ui5_yearpicker_item_selected_background_color);\n\tcolor: var(--_ui5_yearpicker_item_selected_text_color);\n\tbox-shadow: var(--_ui5_yearpicker_item_selected_box_shadow);\n\tfont-weight: bold;\n}\n\n.ui5-yp-item.ui5-yp-item--disabled {\n\tpointer-events: none;\n\topacity: 0.5;\n}\n\n.ui5-yp-item.ui5-yp-item--selected:focus {\n\tbackground-color: var(--_ui5_yearpicker_item_selected_focus);\n}\n\n.ui5-yp-item.ui5-yp-item--selected:focus::after {\n\tborder-color: var(--_ui5_yearpicker_item_focus_after_border);\n}\n\n.ui5-yp-item.ui5-yp-item--selected:hover {\n\tbackground-color: var(--_ui5_yearpicker_item_selected_hover_color);\n}\n\n.ui5-yp-item:focus::after {\n\tcontent: \"\";\n\tposition: absolute;\n\tborder: var(--_ui5_yearpicker_item_focus_after_border);\n\tinset: 0;\n\tborder-radius: var(--_ui5_yearpicker_item_focus_after_border_radius);\n\toutline: var(--_ui5_yearpicker_item_focus_after_outline);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});