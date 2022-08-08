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
    fileName: "themes/Menu.css",
    content: ".ui5-menu-rp[ui5-responsive-popover]::part(content),.ui5-menu-rp[ui5-responsive-popover]::part(footer),.ui5-menu-rp[ui5-responsive-popover]::part(header){padding:0}.ui5-menu-rp[ui5-responsive-popover]{box-shadow:var(--sapContent_Shadow1);border-radius:var(--_ui5_menu_popover_border_radius);max-width:20rem}.ui5-menu-item-icon-end{display:inline-block;vertical-align:middle;padding-inline-start:.5rem;float:var(--_ui5-menu_item_icon_float)}.ui5-menu-item-no-icon-end{min-width:var(--_ui5_list_item_icon_size);min-height:var(--_ui5_list_item_icon_size);display:inline-block;vertical-align:middle;padding-inline-start:.5rem;float:var(--_ui5-menu_item_icon_float)}.ui5-menu-item-dummy-icon{min-width:var(--_ui5_list_item_icon_size);min-height:var(--_ui5_list_item_icon_size);display:inline-block;vertical-align:middle;padding-inline-end:.5rem}.ui5-menu-dialog-header{display:flex;height:var(--_ui5-responsive_popover_header_height);align-items:center;justify-content:space-between;padding:0 1rem;width:100%;overflow:hidden}.ui5-menu-dialog-title{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;width:calc(100% - 6.5rem);padding-right:1rem}.ui5-menu-dialog-title>div{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-menu-back-button{margin-right:1rem}.ui5-menu-item:not([is-phone])::part(native-li){padding:var(--_ui5_menu_item_padding)}.ui5-menu-item[starts-section]{border-top:1px solid var(--sapGroup_ContentBorderColor)}.ui5-menu-item[active] .ui5-menu-item-icon-end{color:var(--sapList_Active_TextColor)}.ui5-menu-item[focused]:not([active]){background-color:var(--sapList_Hover_Background)}.ui5-menu-rp[sub-menu]{margin-top:.25rem;margin-inline:var(--_ui5_menu_submenu_margin_offset)}"
  };
  _exports.default = _default;
});