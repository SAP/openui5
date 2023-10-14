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
    fileName: "themes/Title.css",
    content: ":host(:not([hidden])){cursor:text;display:block}:host{color:var(--sapGroup_TitleTextColor);font-family:\"72override\",var(--sapFontHeaderFamily);font-size:var(--sapFontHeader2Size);max-width:100%;text-shadow:var(--sapContent_TextShadow)}.ui5-title-root{-webkit-margin-before:0;-webkit-margin-after:0;-webkit-margin-start:0;-webkit-margin-end:0;box-sizing:border-box;cursor:inherit;display:inline-block;font-size:inherit;font-weight:400;margin:0;max-width:100%;overflow:hidden;position:relative;text-overflow:ellipsis;vertical-align:bottom;white-space:nowrap}:host([wrapping-type=Normal]) .ui5-title-root,:host([wrapping-type=Normal]) ::slotted(*){white-space:pre-line}::slotted(*){font-family:inherit;font-size:inherit;text-shadow:inherit}:host([level=H1]){font-size:var(--sapFontHeader1Size)}:host([level=H2]){font-size:var(--sapFontHeader2Size)}:host([level=H3]){font-size:var(--sapFontHeader3Size)}:host([level=H4]){font-size:var(--sapFontHeader4Size)}:host([level=H5]){font-size:var(--sapFontHeader5Size)}:host([level=H6]){font-size:var(--sapFontHeader6Size)}"
  };
  var _default = styleData;
  _exports.default = _default;
});