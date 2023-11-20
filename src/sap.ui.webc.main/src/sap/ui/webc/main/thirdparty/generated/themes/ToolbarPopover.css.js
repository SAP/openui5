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
    fileName: "themes/ToolbarPopover.css",
    content: ".ui5-overflow-popover::part(content){padding:var(--_ui5-v1-18-0_toolbar_overflow_padding)}.ui5-overflow-list{align-items:center;display:flex;flex-direction:column;justify-content:center}.ui5-tb-popover-item{margin-bottom:.25rem;width:100%}.ui5-tb-separator-in-overflow{background:var(--sapToolbar_SeparatorColor);box-sizing:border-box;display:none;height:.0625rem}.ui5-tb-separator-in-overflow[visible]{display:block}"
  };
  var _default = styleData;
  _exports.default = _default;
});