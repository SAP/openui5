sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var SelectPopoverCss = {packageName:"@ui5/webcomponents",fileName:"themes/SelectPopover.css",content:".ui5-select-popover:not(.ui5-valuestatemessage-popover) [ui5-li]:first-child::part(native-li):after{border-top-left-radius:var(--_ui5_select_option_focus_border_radius);border-top-right-radius:var(--_ui5_select_option_focus_border_radius)}.ui5-select-popover [ui5-li]:last-child::part(native-li):after{border-bottom-left-radius:var(--_ui5_select_option_focus_border_radius);border-bottom-right-radius:var(--_ui5_select_option_focus_border_radius)}"};

	return SelectPopoverCss;

});
