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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", async () => _parametersBundle2.default);
  const styleData = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/Bar.css",
    content: ":host{background-color:var(--sapPageHeader_Background);box-shadow:var(--sapContent_HeaderShadow);display:block;height:var(--_ui5-v1-18-0_bar_base_height);width:100%}.ui5-bar-root{align-items:center;background-color:inherit;border-radius:inherit;box-shadow:inherit;display:flex;height:inherit;justify-content:space-between;width:inherit}.ui5-bar-root .ui5-bar-startcontent-container{align-items:center;display:flex;flex-direction:row;justify-content:flex-start;padding-inline-start:var(--_ui5-v1-18-0_bar-start-container-padding-start)}.ui5-bar-root .ui5-bar-content-container{min-width:calc(30% - var(--_ui5-v1-18-0_bar-start-container-padding-start) - var(--_ui5-v1-18-0_bar-end-container-padding-end) - var(--_ui5-v1-18-0_bar-mid-container-padding-start-end)*2)}.ui5-bar-root.ui5-bar-root-shrinked .ui5-bar-content-container{height:100%;min-width:0;overflow:hidden}.ui5-bar-root .ui5-bar-endcontent-container{align-items:center;display:flex;flex-direction:row;justify-content:flex-end;padding-inline-end:var(--_ui5-v1-18-0_bar-end-container-padding-end)}.ui5-bar-root .ui5-bar-midcontent-container{align-items:center;display:flex;flex-direction:row;justify-content:center;padding:0 var(--_ui5-v1-18-0_bar-mid-container-padding-start-end)}:host([design=Footer]){background-color:var(--sapPageFooter_Background);border-top:.0625rem solid var(--sapPageFooter_BorderColor);box-shadow:none}:host([design=Subheader]){height:var(--_ui5-v1-18-0_bar_subheader_height)}:host([design=FloatingFooter]){background-color:var(--sapPageFooter_Background);border:none;border-radius:var(--sapElement_BorderCornerRadius);box-shadow:var(--sapContent_Shadow1)}::slotted(*){margin:0 .25rem}"
  };
  var _default = styleData;
  _exports.default = _default;
});