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
    fileName: "themes/ResponsivePopover.css",
    content: ":host{--_ui5-v1-18-0_input_width:100%;min-height:2rem;min-width:6.25rem}:host([opened]){display:inline-block}.ui5-responsive-popover-header{align-items:center;display:flex;height:var(--_ui5-v1-18-0-responsive_popover_header_height);justify-content:space-between;width:100%}.ui5-responsive-popover-header-text{width:calc(100% - var(--_ui5-v1-18-0_button_base_min_width))}.ui5-responsive-popover-header-no-title{justify-content:flex-end}"
  };
  var _default = styleData;
  _exports.default = _default;
});