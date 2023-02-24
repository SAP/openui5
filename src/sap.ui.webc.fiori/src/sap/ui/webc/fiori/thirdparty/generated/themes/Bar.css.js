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
  (0, _Themes.registerThemePropertiesLoader)("@ui5/webcomponents-fiori", "sap_fiori_3", () => _parametersBundle2.default);
  var _default = {
    packageName: "@ui5/webcomponents-fiori",
    fileName: "themes/Bar.css",
    content: ":host{background-color:var(--sapPageHeader_Background);height:var(--_ui5_bar_base_height);width:100%;box-shadow:inset 0 -.0625rem var(--sapPageHeader_BorderColor);display:block}.ui5-bar-root{display:flex;align-items:center;justify-content:space-between;height:inherit;width:inherit;background-color:inherit;box-shadow:inherit;border-radius:inherit}.ui5-bar-root .ui5-bar-startcontent-container{padding-inline-start:.5rem;display:flex;flex-direction:row;align-items:center;justify-content:flex-start}.ui5-bar-root .ui5-bar-content-container{min-width:30%}.ui5-bar-root.ui5-bar-root-shrinked .ui5-bar-content-container{min-width:0;overflow:hidden}.ui5-bar-root .ui5-bar-endcontent-container{padding-inline-end:.5rem;display:flex;flex-direction:row;align-items:center;justify-content:flex-end}.ui5-bar-root .ui5-bar-midcontent-container{padding-left:.5rem;padding-right:.5rem;display:flex;flex-direction:row;align-items:center;justify-content:center}:host([design=Footer]){background-color:var(--sapPageFooter_Background);border-top:.0625rem solid var(--sapPageFooter_BorderColor);box-shadow:none}:host([design=Subheader]){height:var(--_ui5_bar_subheader_height)}:host([design=FloatingFooter]){border-radius:var(--sapElement_BorderCornerRadius);background-color:var(--sapPageFooter_Background);box-shadow:var(--sapContent_Shadow1);border:none}::slotted(*){margin:0 .25rem}"
  };
  _exports.default = _default;
});