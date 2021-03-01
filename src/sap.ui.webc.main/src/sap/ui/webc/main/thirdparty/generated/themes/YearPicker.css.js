sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var styles = ":host(:not([hidden])){display:block}:host{width:100%;height:100%}.ui5-yp-root{padding:2rem 0 1rem 0;display:flex;flex-direction:column;font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);justify-content:center;align-items:center}.ui5-yp-interval-container{display:flex;justify-content:center;align-items:center;width:100%}.ui5-yp-item{display:flex;margin:var(--_ui5_yearpicker_item_margin);width:calc(25% - .125rem);height:var(--_ui5_year_picker_item_height);color:var(--sapTextColor);background-color:var(--sapLegend_WorkingBackground);align-items:center;justify-content:center;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;outline:none;position:relative;border:var(--_ui5_yearpicker_item_border);border-radius:var(--_ui5_yearpicker_item_border_radius)}.ui5-yp-item:hover{background-color:var(--sapList_Hover_Background)}.ui5-yp-item.ui5-yp-item--selected{background-color:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}.ui5-yp-item.ui5-yp-item--disabled{pointer-events:none;opacity:.5}.ui5-yp-item.ui5-yp-item--selected:focus{background-color:var(--_ui5_yearpicker_item_selected_focus)}.ui5-yp-item.ui5-yp-item--selected:focus:after{border-color:var(--sapContent_ContrastFocusColor)}.ui5-yp-item.ui5-yp-item--selected:hover{background-color:var(--_ui5_yearpicker_item_selected_focus)}.ui5-yp-item:focus:after{content:\"\";position:absolute;width:var(--_ui5_yearpicker_item_focus_after_width);height:var(--_ui5_yearpicker_item_focus_after_height);border:var(--_ui5_yearpicker_item_focus_after_border);top:var(--_ui5_yearpicker_item_focus_after_offset);left:var(--_ui5_yearpicker_item_focus_after_offset)}";

	return styles;

});
