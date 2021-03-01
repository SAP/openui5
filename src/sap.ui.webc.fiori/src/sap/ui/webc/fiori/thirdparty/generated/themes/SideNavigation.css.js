sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var SideNavigationCss = ":host(:not([hidden])){display:inline-block;width:15rem;height:100%;border-right:var(--sapList_BorderWidth) solid var(--sapList_GroupHeaderBorderColor);transition:width .25s;--_ui5-tree-toggle-box-width:1rem}:host([collapsed]){width:3rem;min-width:3rem}.ui5-sn-bottom-content-border{width:100%;padding:0 .5rem;margin:.25rem 0;display:flex;justify-content:center;box-sizing:border-box}.ui5-sn-bottom-content-border>span{width:90%;height:.125rem;background:var(--sapList_GroupHeaderBorderColor)}.ui5-sn-root{height:100%;display:flex;flex-direction:column;background:var(--sapList_Background)}.ui5-sn-spacer{flex:auto;min-height:3rem}";

	return SideNavigationCss;

});
