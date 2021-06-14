sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var ColorPaletteStaticAreaCss = ".ui5-cp-dialog-content{display:flex;justify-content:center;align-items:center;margin:1rem 0}.ui5-cp-dialog-footer{width:100%;display:flex;justify-content:flex-end;margin:.1875rem 1rem}.ui5-cp-dialog-footer [ui5-button]:first-child{margin-right:1rem}";

	return ColorPaletteStaticAreaCss;

});
