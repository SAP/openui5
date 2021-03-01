sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var styles = ":host{display:contents}th{background:var(--sapList_HeaderBackground);border:none;border-bottom:1px solid var(--sapList_BorderColor);width:inherit;font-weight:400;padding:.25rem;box-sizing:border-box;height:3rem;text-align:left;vertical-align:middle}th[dir=rtl]{text-align:right}:host([first]) th{padding-left:1rem}:host([sticky]) th{position:sticky;top:0;z-index:99}";

	return styles;

});
