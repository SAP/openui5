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
    fileName: "themes/Menu.css",
    content: ".ui5-menu-rp[ui5-responsive-popover]::part(content),.ui5-menu-rp[ui5-responsive-popover]::part(footer),.ui5-menu-rp[ui5-responsive-popover]::part(header){padding:0}.ui5-menu-rp[ui5-responsive-popover]{border-radius:var(--_ui5-v1-18-0_menu_popover_border_radius);box-shadow:var(--sapContent_Shadow1);max-width:20rem}.ui5-menu-item-icon-end{display:inline-block;inset-inline-end:var(--_ui5-v1-18-0_menu_item_submenu_icon_right);padding-inline-start:.5rem;pointer-events:none;position:absolute;vertical-align:middle}.ui5-menu-item-no-icon-end{display:inline-block;inset-inline-end:var(--_ui5-v1-18-0_menu_item_submenu_icon_right);min-height:var(--_ui5-v1-18-0_list_item_icon_size);min-width:var(--_ui5-v1-18-0_list_item_icon_size);padding-inline-start:.5rem;pointer-events:none;vertical-align:middle}.ui5-menu-item[additional-text] .ui5-menu-item-no-icon-end{display:none}.ui5-menu-item-dummy-icon{display:inline-block;min-height:var(--_ui5-v1-18-0_list_item_icon_size);min-width:var(--_ui5-v1-18-0_list_item_icon_size);padding-inline-end:.5rem;pointer-events:none;vertical-align:middle}.ui5-menu-busy-indicator{width:100%}.ui5-menu-dialog-header{align-items:center;display:flex;height:var(--_ui5-v1-18-0-responsive_popover_header_height);justify-content:space-between;overflow:hidden;padding:0 1rem;width:100%}.ui5-menu-dialog-title{align-items:center;display:flex;flex-direction:row;justify-content:flex-start;padding-right:1rem;width:calc(100% - 6.5rem)}.ui5-menu-dialog-title>div{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-menu-back-button{margin-right:1rem}.ui5-menu-item::part(title){font-size:var(--sapFontSize);padding-top:.125rem}.ui5-menu-item[icon]:not([is-phone])::part(title),.ui5-menu-item[is-phone]:not([icon=\"\"])::part(title){padding-top:0}.ui5-menu-item:not([is-phone])::part(native-li){padding:var(--_ui5-v1-18-0_menu_item_padding)}.ui5-menu-item[starts-section]{border-top:1px solid var(--sapGroup_ContentBorderColor)}.ui5-menu-item[active] .ui5-menu-item-icon-end{color:var(--sapList_Active_TextColor)}.ui5-menu-item[focused]:not([active]){background-color:var(--sapList_Hover_Background)}.ui5-menu-rp[sub-menu]{margin-top:.25rem;margin-inline:var(--_ui5-v1-18-0_menu_submenu_margin_offset)}.ui5-menu-rp[sub-menu][actual-placement-type=Left]{margin-top:.25rem;margin-inline:var(--_ui5-v1-18-0_menu_submenu_placement_type_left_margin_offset)}.ui5-menu-item::part(additional-text){color:var(--sapContent_LabelColor);margin-inline-start:var(--_ui5-v1-18-0_menu_item_additional_text_start_margin);min-width:max-content}"
  };
  var _default = styleData;
  _exports.default = _default;
});