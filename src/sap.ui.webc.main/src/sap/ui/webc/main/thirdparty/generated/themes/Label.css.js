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
    fileName: "themes/Label.css",
    content: ":host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}.ui5-label-root{width:100%;cursor:inherit}:host([wrapping-type=Normal]) .ui5-label-root{white-space:normal}:host(:not([wrapping-type=Normal])) .ui5-label-root{display:inline-block;white-space:nowrap}bdi{content:\"\";padding-right:.075rem}:host(:not([wrapping-type=Normal])) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;max-width:100%}:host(:not([wrapping-type=Normal])[required][show-colon]) .ui5-label-text-wrapper,:host(:not([wrapping-type=Normal])[required][show-colon]) .ui5-label-text-wrapper.ui5-label-text-wrapper-safari{max-width:calc(100% - .8rem)}:host(:not([wrapping-type=Normal])[required]) .ui5-label-text-wrapper{max-width:calc(100% - .475rem)}:host(:not([wrapping-type=Normal])[required]) .ui5-label-text-wrapper.ui5-label-text-wrapper-safari{max-width:calc(100% - .425rem)}:host(:not([wrapping-type=Normal])[show-colon]) .ui5-label-text-wrapper{max-width:calc(100% - .125rem)}:host([show-colon]) .ui5-label-required-colon{margin-left:-.05rem}:host([show-colon]) .ui5-label-required-colon:before{content:\":\"}:host([required]) .ui5-label-required-colon:after{content:\"*\";color:var(--sapField_RequiredColor);font-size:1.25rem;font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}"
  };
  _exports.default = _default;
});