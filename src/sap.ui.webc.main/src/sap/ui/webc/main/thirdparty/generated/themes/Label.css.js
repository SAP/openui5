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
    fileName: "themes/Label.css",
    content: ":host(:not([hidden])){display:inline-flex}:host{color:var(--sapContent_LabelColor);cursor:text;font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;max-width:100%}.ui5-label-root{cursor:inherit;width:100%}:host([wrapping-type=Normal]) .ui5-label-root{white-space:normal}:host(:not([wrapping-type=Normal])) .ui5-label-root{display:inline-flex;white-space:nowrap}:host(:not([wrapping-type=Normal])) .ui5-label-text-wrapper{display:inline-block;flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;vertical-align:top}:host([show-colon]) .ui5-label-required-colon:before{content:attr(data-colon)}:host([required]) .ui5-label-required-colon:after{color:var(--sapField_RequiredColor);content:\"*\";font-size:1.25rem;font-style:normal;font-weight:700;line-height:0;position:relative;vertical-align:middle}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}bdi{padding-right:.075rem}:host([show-colon]) .ui5-label-required-colon{margin-inline-start:-.05rem;white-space:pre}"
  };
  var _default = styleData;
  _exports.default = _default;
});