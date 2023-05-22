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
    fileName: "themes/Calendar.css",
    content: ":host(:not([hidden])) {\n    display: inline-block;\n}\n\n.ui5-cal-root {\n    background: var(--sapList_Background);\n    box-sizing: border-box;\n    height: var(--_ui5_calendar_height);\n    width: var(--_ui5_calendar_width);\n    padding: var(--_ui5_calendar_top_bottom_padding) var(--_ui5_calendar_left_right_padding) 0;\n    display: flex;\n    flex-direction: column-reverse;\n    justify-content: flex-end;\n}\n\n.ui5-cal-root [ui5-calendar-header] {\n    height: var(--_ui5_calendar_header_height);\n    font-family: var(--_ui5_button_fontFamily);\n}\n\n.ui5-cal-root .ui5-cal-content {\n    padding: 0 var(--_ui5_calendar_left_right_padding) var(--_ui5_calendar_top_bottom_padding);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});