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
    fileName: "themes/ColorPalette.css",
    content: ":host(:not([hidden])){display:inline-block}:host(:not([hidden])[popup-mode]){width:100%}.ui5-cp-root{display:flex;flex-direction:column}.ui5-cp-recent-colors-wrapper,.ui5-cp-root.ui5-cp-root-phone,.ui5-cp-root.ui5-cp-root-phone .ui5-cp-default-color-button-wrapper,.ui5-cp-root.ui5-cp-root-phone .ui5-cp-more-colors-wrapper,.ui5-cp-separator{width:100%}.ui5-cp-root.ui5-cp-root-phone .ui5-cp-item-container{max-height:13rem;max-width:19.5rem;padding:.375rem .625rem;width:18.5rem}.ui5-cp-recent-colors-wrapper{align-items:center;display:flex;flex-direction:column}.ui5-cp-root.ui5-cp-root-phone{align-items:center;display:flex}.ui5-cp-item-container{display:flex;flex-flow:wrap;max-height:var(--_ui5-v1-18-0_color-palette-row-height);max-width:var(--_ui5-v1-18-0_color-palette-row-width);overflow:hidden;padding:var(--_ui5-v1-18-0_color-palette-swatch-container-padding)}.ui5-cp-default-color-button,.ui5-cp-more-colors{border:none;height:var(--_ui5-v1-18-0_color-palette-button-height);text-align:center;width:100%}.ui5-cp-default-color-button-wrapper,.ui5-cp-more-colors-wrapper{display:flex;flex-direction:column}.ui5-cp-separator{background:var(--sapToolbar_SeparatorColor);height:.0625rem}.ui5-cp-default-color-button,.ui5-cp-more-colors{padding:.0625rem}"
  };
  var _default = styleData;
  _exports.default = _default;
});