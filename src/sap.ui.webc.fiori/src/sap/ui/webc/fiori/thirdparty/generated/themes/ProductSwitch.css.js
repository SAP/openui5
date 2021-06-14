sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var ProductSwitchCss = ":host{font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize)}.ui5-product-switch-root{display:flex;flex-wrap:wrap;width:752px;padding:1.25rem .75rem}:host([desktop-columns=\"3\"]) .ui5-product-switch-root{width:564px}@media only screen and (max-width:900px){.ui5-product-switch-root{width:564px}}@media only screen and (max-width:600px){.ui5-product-switch-root,:host([desktop-columns=\"3\"]) .ui5-product-switch-root{flex-direction:column;padding:0;width:100%}}";

	return ProductSwitchCss;

});
