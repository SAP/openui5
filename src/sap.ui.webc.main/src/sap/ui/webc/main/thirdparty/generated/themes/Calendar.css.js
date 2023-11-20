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
    content: ":host(:not([hidden])){display:inline-block}.ui5-cal-root{background:var(--sapList_Background);box-sizing:border-box;display:flex;flex-direction:column-reverse;height:var(--_ui5-v1-18-0_calendar_height);justify-content:flex-end;padding:var(--_ui5-v1-18-0_calendar_top_bottom_padding) var(--_ui5-v1-18-0_calendar_left_right_padding) 0;width:var(--_ui5-v1-18-0_calendar_width)}.ui5-cal-root [ui5-calendar-header]{font-family:var(--_ui5-v1-18-0_button_fontFamily);height:var(--_ui5-v1-18-0_calendar_header_height)}.ui5-cal-root .ui5-cal-content{padding:0 var(--_ui5-v1-18-0_calendar_left_right_padding) var(--_ui5-v1-18-0_calendar_top_bottom_padding)}"
  };
  var _default = styleData;
  _exports.default = _default;
});