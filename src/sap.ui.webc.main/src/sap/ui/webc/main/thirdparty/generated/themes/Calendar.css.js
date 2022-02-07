sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var calendarCSS = {packageName:"@ui5/webcomponents",fileName:"themes/Calendar.css",content:":host(:not([hidden])){display:inline-block}.ui5-cal-root{background:var(--sapList_Background);box-sizing:border-box;height:var(--_ui5_calendar_height);width:var(--_ui5_calendar_width);padding:var(--_ui5_calendar_top_bottom_padding) var(--_ui5_calendar_left_right_padding) 0;display:flex;flex-direction:column-reverse;justify-content:flex-end}.ui5-cal-root [ui5-calendar-header]{height:var(--_ui5_calendar_header_height);font-family:var(--_ui5_button_fontFamily)}.ui5-cal-root .ui5-cal-content{padding:0 var(--_ui5_calendar_left_right_padding) var(--_ui5_calendar_top_bottom_padding)}"};

	return calendarCSS;

});
