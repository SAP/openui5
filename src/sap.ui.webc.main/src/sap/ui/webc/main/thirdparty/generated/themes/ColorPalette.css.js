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
    fileName: "themes/ColorPalette.css",
    content: ":host(:not([hidden])){display:inline-block}:host(:not([hidden])[popup-mode]){width:100%}.ui5-cp-root{display:flex;flex-direction:column}.ui5-cp-recent-colors-wrapper,.ui5-cp-root.ui5-cp-root-phone,.ui5-cp-root.ui5-cp-root-phone .ui5-cp-default-color-button-wrapper,.ui5-cp-root.ui5-cp-root-phone .ui5-cp-more-colors-wrapper,.ui5-cp-separator{width:100%}.ui5-cp-root.ui5-cp-root-phone .ui5-cp-item-container{width:18.5rem;max-width:19.5rem;max-height:13rem;padding:.375rem .625rem}.ui5-cp-recent-colors-wrapper{display:flex;align-items:center;flex-direction:column}.ui5-cp-root.ui5-cp-root-phone{display:flex;align-items:center}.ui5-cp-item-container{display:flex;max-width:var(--_ui5_color-palette-row-width);flex-flow:wrap;max-height:var(--_ui5_color-palette-row-height);overflow:hidden;padding:var(--_ui5_color-palette-swatch-container-padding)}.ui5-cp-default-color-button,.ui5-cp-more-colors{width:100%;height:var(--_ui5_color-palette-button-height);text-align:center;border:none}.ui5-cp-default-color-button-wrapper,.ui5-cp-more-colors-wrapper{display:flex;flex-direction:column}.ui5-cp-separator{height:.0625rem;background:var(--sapToolbar_SeparatorColor)}.ui5-cp-default-color-button,.ui5-cp-more-colors{padding:.0625rem}"
  };
  _exports.default = _default;
});