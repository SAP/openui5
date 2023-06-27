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
    fileName: "themes/SideNavigation.css",
    content: ":host(:not([hidden])) {\n    display: inline-block;\n    width: 15rem;\n    height: 100%;\n    transition: width .25s;\n    --_ui5-tree-toggle-box-width: var(--_ui5_side_navigation_icon_padding);\n    --_ui5_list_item_icon_size: var(--_ui5_side_navigation_icon_size);\n    --_ui5-tree-toggle-icon-size: var(--_ui5_side_navigation_toggle_icon_size);\n    --_ui5_list_item_title_size: var(--sapFontLargeSize);\n    --_ui5_list_item_icon_padding-inline-end: var(--_ui5_side_navigation_icon_padding);\n    --_ui5-tree-indent-step: var(--_ui5_side_navigation_indent_step);\n}\n\n:host([collapsed]) {\n    width: var(--_ui5_side_navigation_collapsed_state_width);\n}\n\n:host(.ui5-side-navigation-in-popover) .ui5-sn-root {\n    border-right: none;\n}\n\n.ui5-sn-root {\n    height: 100%;\n    display: flex;\n    flex-direction: column;\n    box-sizing: border-box;\n    background: var(--sapList_Background);\n    border-right: var(--sapList_BorderWidth) solid var(--sapList_GroupHeaderBorderColor);\n    box-shadow: var(--sapContent_Shadow0);\n}\n\n.ui5-sn-items-tree {\n    overflow: auto;\n}\n\n.ui5-sn-bottom-content-border {\n    width: 100%;\n    padding: 0 1rem;\n    margin: 0.25rem 0;\n    display: flex;\n    justify-content: center;\n    box-sizing: border-box;\n}\n\n:host([collapsed]) .ui5-sn-bottom-content-border {\n    padding: 0 0.5rem;\n}\n\n.ui5-sn-bottom-content-border > span {\n    width: 100%;\n    height: .125rem;\n    background: var(--_ui5_side_navigation_separator_backgound);\n}\n\n.ui5-sn-spacer {\n    flex: 1;\n    min-height: 0;\n}\n\n[ui5-tree-item]::part(toggle-icon) {\n    color: var(--sapContent_NonInteractiveIconColor);\n    flex-shrink: 0;\n}\n\n[ui5-tree-item]::part(icon) {\n    color: var(--_ui5_side_navigation_icon_color);\n}"
  };
  var _default = styleData;
  _exports.default = _default;
});