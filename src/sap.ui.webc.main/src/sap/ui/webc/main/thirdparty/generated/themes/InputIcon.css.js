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
    content: "/*\n\tThis CSS file enables visual alignment of all icons within input elements.\n\tAPI:\n\t- add input-icon attribute to an icon\n\t- [Optional] pressed attribute set to the icon will enable additional styling (check MultiComboBox, Select, etc.)\n*/\n\n[input-icon] {\n\tcolor: var(--_ui5_input_icon_color);\n\tcursor: pointer;\n\toutline: none;\n\tpadding: var(--_ui5_input_icon_padding);\n\tborder-inline-start: var(--_ui5_input_icon_border);\n\tmin-width: 1rem;\n\tmin-height: 1rem;\n\tborder-radius: var(--_ui5_input_icon_border_radius);\n}\n\n[input-icon][pressed] {\n\tbackground: var(--_ui5_input_icon_pressed_bg);\n\tbox-shadow: var(--_ui5_input_icon_box_shadow);\n\tborder-inline-start: var(--_ui5_select_hover_icon_left_border);\n\tcolor: var(--_ui5_input_icon_pressed_color);\n}\n\n[input-icon]:active {\n\tbackground-color: var(--sapButton_Active_Background);\n\tbox-shadow: var(--_ui5_input_icon_box_shadow);\n\tborder-inline-start: var(--_ui5_select_hover_icon_left_border);\n\tcolor: var(--_ui5_input_icon_pressed_color);\n}\n\n[input-icon]:not([pressed]):not(:active):hover {\n\tbackground: var(--_ui5_input_icon_hover_bg);\n\tbox-shadow: var(--_ui5_input_icon_box_shadow);\n}\n\n[input-icon]:hover {\n\tborder-inline-start: var(--_ui5_select_hover_icon_left_border);\n\tbox-shadow: var(--_ui5_input_icon_box_shadow);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});