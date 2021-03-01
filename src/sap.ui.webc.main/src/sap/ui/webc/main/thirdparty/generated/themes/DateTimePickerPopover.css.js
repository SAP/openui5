sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var DateTimePickerPopoverCss = ".ui5-dt-picker-content{display:flex;flex-direction:row;height:var(--_ui5_datetime_picker_height);min-width:var(--_ui5_datetime_picker_width);box-sizing:border-box;justify-content:center}.ui5-dt-cal{width:auto;padding:.5rem .25rem 0 .25rem;box-sizing:border-box}.ui5-dt-time{width:100%;min-width:var(--_ui5_datetime_timeview_width);box-sizing:border-box}.ui5-dt-cal.ui5-dt-cal--hidden,.ui5-dt-time.ui5-dt-time--hidden{display:none}.ui5-dt-picker-header{display:flex;justify-content:center;width:100%;margin-top:1rem;box-sizing:border-box}.ui5-dt-picker-separator{height:calc(100% - 2rem);width:0;margin-top:1rem;margin-bottom:1rem;border-left:1px solid var(--sapGroup_ContentBorderColor);box-sizing:border-box}.ui5-dt-picker-footer{display:flex;justify-content:flex-end;align-items:center;height:2.75rem;width:100%;padding:0 .5rem 0 .25rem}.ui5-dt-picker-action{margin:.25rem}#ok.ui5-dt-picker-action{padding:0 .5625rem}.ui5-dt-picker-content--phone.ui5-dt-picker-content{min-width:auto;height:calc(100% - 4rem)}.ui5-dt-picker-content--phone .ui5-dt-cal{width:100%}.ui5-dt-picker-content--phone .ui5-dt-time{min-width:var(--_ui5_datetime_timeview_phonemode_width)}";

	return DateTimePickerPopoverCss;

});
