sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var viewSettingsDialogCSS = "[on-desktop] .ui5-vsd-content{height:375px;min-width:350px}.ui5-vsd-header{width:100%}.ui5-vsd-footer{width:100%;display:flex;justify-content:flex-end;margin:.1875rem 1rem;margin-left:.5rem;margin-right:.5rem}.ui5-vsd-footer [ui5-button]:first-child{margin-right:.5rem;min-width:4rem}.ui5-vsd-sort{width:100%;height:100%}.ui5-vsd-sort [ui5-li-groupheader]{overflow:hidden}";

	return viewSettingsDialogCSS;

});
