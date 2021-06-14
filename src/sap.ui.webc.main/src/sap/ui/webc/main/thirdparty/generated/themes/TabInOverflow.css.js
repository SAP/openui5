sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var overflowCss = ".ui5-tab-overflow-item{color:var(--_ui5_tc_overflowItem_default_color)}.ui5-tab-overflow-item--disabled{cursor:default;opacity:.5}.ui5-tab-overflow-item--positive{color:var(--_ui5_tc_overflowItem_positive_color);border-color:var(--_ui5_tc_headerItem_positive_selected_border_color)}.ui5-tab-overflow-item--negative{color:var(--_ui5_tc_overflowItem_negative_color);border-color:var(--_ui5_tc_headerItem_negative_selected_border_color)}.ui5-tab-overflow-item--critical{color:var(--_ui5_tc_overflowItem_critical_color);border-color:var(--_ui5_tc_headerItem_critical_selected_border_color)}.ui5-tab-overflow-item--neutral{color:var(--_ui5_tc_overflowItem_neutral_color);border-color:var(--_ui5_tc_headerItem_neutral_selected_border_color)}.ui5-tab-overflow-item[active] .ui5-tab-overflow-itemContent{color:var(--sapList_Active_TextColor)}.ui5-tab-overflow-itemContent{display:flex;align-items:center;padding:0 .5rem;height:var(--_ui5_tc_item_text);pointer-events:none}.ui5-tab-overflow-item [ui5-icon]{width:1.375rem;height:1.375rem;padding-right:1rem;color:var(--_ui5_tc_overflowItem_current_color)}";

	return overflowCss;

});
