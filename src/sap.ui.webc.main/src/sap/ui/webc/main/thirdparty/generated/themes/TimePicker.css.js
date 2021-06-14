sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var TimePickerCss = ":host(:not([hidden])){display:inline-block}:host{color:var(--sapField_TextColor);background-color:var(--sapField_Background)}:host .ui5-time-picker-input{width:100%;color:inherit;background-color:inherit}.ui5-time-picker-input-icon-button{border-left:.0625rem solid transparent}.ui5-time-picker-input-icon-button:hover{cursor:pointer;border-left:var(--_ui5_time_picker_border);background:var(--sapButton_Hover_Background)}.ui5-time-picker-input-icon-button:active{background-color:var(--sapButton_Active_Background);color:var(--sapButton_Active_TextColor)}.ui5-time-picker-input-icon-button[pressed]{background-color:var(--sapButton_Active_Background);color:var(--sapButton_Active_TextColor)}";

	return TimePickerCss;

});
