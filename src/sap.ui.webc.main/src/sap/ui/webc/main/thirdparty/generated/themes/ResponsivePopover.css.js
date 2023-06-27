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
    content: ":host {\n\t--_ui5_input_width: 100%;\n\tmin-width: 6.25rem;\n\tmin-height: 2rem;\n}\n\n:host([opened]) {\n\tdisplay: inline-block;\n}\n\n.ui5-responsive-popover-header {\n\theight: var(--_ui5-responsive_popover_header_height);\n\tdisplay: flex;\n\tjustify-content: space-between;\n\talign-items: center;\n\twidth:100%;\n}\n\n.ui5-responsive-popover-header-text {\n\twidth: calc(100% - var(--_ui5_button_base_min_width));\n}\n\n.ui5-responsive-popover-header-no-title {\n\tjustify-content: flex-end;\n}\n"
  };
  var _default = styleData;
  _exports.default = _default;
});