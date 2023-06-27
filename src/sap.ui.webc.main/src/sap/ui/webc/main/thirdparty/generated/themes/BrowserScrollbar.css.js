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
    fileName: "themes/BrowserScrollbar.css",
    content: ":not(.ui5-content-native-scrollbars) ::-webkit-scrollbar:horizontal {\n\theight: var(--sapScrollBar_Dimension);\n}\n\n:not(.ui5-content-native-scrollbars) ::-webkit-scrollbar:vertical {\n\twidth: var(--sapScrollBar_Dimension);\n}\n\n:not(.ui5-content-native-scrollbars) ::-webkit-scrollbar {\n\tbackground-color: var(--sapScrollBar_TrackColor);\n\tborder-left: var(--browser_scrollbar_border);\n}\n\n:not(.ui5-content-native-scrollbars) ::-webkit-scrollbar-thumb {\n\tborder-radius: var(--browser_scrollbar_border_radius);\n\tbackground-color: var(--sapScrollBar_FaceColor);\n}\n\n:not(.ui5-content-native-scrollbars) ::-webkit-scrollbar-thumb:hover {\n\tbackground-color: var(--sapScrollBar_Hover_FaceColor);\n}\n\n:not(.ui5-content-native-scrollbars) ::-webkit-scrollbar-corner {\n\tbackground-color: var(--sapScrollBar_TrackColor);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});