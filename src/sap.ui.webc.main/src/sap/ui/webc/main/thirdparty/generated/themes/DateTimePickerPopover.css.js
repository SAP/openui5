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
    fileName: "themes/DateTimePickerPopover.css",
    content: ".ui5-dt-picker-content {\n\tdisplay: flex;\n\tflex-direction: row;\n\theight: var(--_ui5_datetime_picker_height);\n\tmin-width: var(--_ui5_datetime_picker_width);\n\tbox-sizing: border-box;\n\tjustify-content: center;\n}\n\n.ui5-dt-picker-toggle-button {\n    width: 8rem;\n}\n\n.ui5-dt-cal {\n\twidth: auto;\n\tbox-sizing: border-box;\n}\n\n.ui5-dt-time {\n\twidth: 100%;\n\tmin-width: var(--_ui5_datetime_timeview_width);\n\tbox-sizing: border-box;\n}\n\n.ui5-dt-cal.ui5-dt-cal--hidden,\n.ui5-dt-time.ui5-dt-time--hidden {\n\tdisplay: none;\n}\n\n.ui5-dt-picker-header {\n\tdisplay: flex;\n\tjustify-content: center;\n\twidth: 100%;\n\tmargin-top: 1rem;\n\tbox-sizing: border-box;\n}\n\n.ui5-dt-picker-separator {\n\theight: calc(100% - 2rem);\n\twidth: 0px;\n\tmargin-top: 1rem;\n\tmargin-bottom: 1rem;\n\tborder-left: 1px solid var(--sapGroup_ContentBorderColor);\n\tbox-sizing: border-box;\n}\n\n.ui5-dt-picker-footer {\n\tdisplay: flex;\n\tjustify-content: flex-end;\n\talign-items: center;\n\theight: 2.75rem;\n\twidth: 100%;\n}\n\n.ui5-dt-picker-footer.ui5-dt-picker-footer-time-hidden {\n\tpadding: 0;\n}\n\n.ui5-dt-picker-action {\n\tmargin: 0.25rem;\n}\n\n#ok.ui5-dt-picker-action {\n\twidth: 4rem;\n}\n\n/* Phone mode */\n\n/* TODO: Improve that layouting */\n\n.ui5-dt-picker-content--phone.ui5-dt-picker-content {\n\tmin-width: auto;\n\theight: calc(100% - 4rem);\n}\n\n.ui5-dt-picker-content--phone .ui5-dt-cal {\n\twidth: 100%;\n}\n\n.ui5-dt-picker-content--phone .ui5-dt-time {\n\tmin-width: var(--_ui5_datetime_timeview_phonemode_width);\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});