sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var ColorPaletteCss = ":host(:not([hidden])){display:inline-block}.ui5-cp-root{display:flex;flex-direction:column}.ui5-cp-item-container{display:flex;max-width:var(--_ui5_color-palette-row-width);flex-flow:wrap;max-height:var(--_ui5_color-palette-row-height);overflow:hidden}.ui5-cp-separator{height:.0625rem;background:var(--sapToolbar_SeparatorColor)}.ui5-cp-more-colors{width:100%;height:2rem;text-align:center;border:none}.ui5-cp-more-colors-wrapper{display:flex;flex-direction:column}";

	return ColorPaletteCss;

});
