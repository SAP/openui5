sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var TimePickerPopoverCss = {packageName:"@ui5/webcomponents",fileName:"themes/TimePickerPopover.css",content:".ui5-time-picker-footer{height:fit-content;display:flex;justify-content:flex-end;width:100%}.ui5-time-picker-footer>[ui5-button]{margin:1%;min-width:20%}.ui5-time-picker-popover::part(content){padding:0}"};

	return TimePickerPopoverCss;

});
