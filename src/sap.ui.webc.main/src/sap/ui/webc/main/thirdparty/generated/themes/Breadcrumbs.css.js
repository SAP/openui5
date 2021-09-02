sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var breadcrumbsCss = ".ui5-breadcrumbs-root{white-space:nowrap;outline:none;margin:0 0 .5rem 0}.ui5-breadcrumbs-root>ol{margin:0;padding:0;list-style-type:none;display:-webkit-box;display:-webkit-flex;display:flex}.ui5-breadcrumbs-root>ol>li{display:inline}.ui5-breadcrumbs-current-location{min-width:1%;-webkit-flex:1;-webkit-box-flex:1;flex:1 1 auto}.ui5-breadcrumbs-current-location>span:focus{outline-offset:-1px;outline:1px dotted var(--sapContent_FocusColor)}.ui5-breadcrumbs-dropdown-arrow-link-wrapper[hidden]{display:none}.ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-icon]{width:var(--sapFontSize);height:var(--sapFontSize);padding-left:.675rem;vertical-align:text-top;color:var(--sapLinkColor)}.ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-icon]:before{content:\"...\";vertical-align:middle;position:absolute;left:0;bottom:0}.ui5-breadcrumbs-dropdown-arrow-link-wrapper:hover [ui5-icon]:after,.ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-link][focused] [ui5-icon]:after{content:\"\";position:absolute;border-bottom:.0625rem solid;top:0;left:0;bottom:1px;right:0}[ui5-link]:after{content:\"/\";padding:0 .25rem;cursor:auto;color:var(--sapContent_LabelColor);display:flex;align-items:flex-end}.ui5-breadcrumbs-popover-footer{display:flex;justify-content:flex-end;width:100%}:host([separator-style=BackSlash]) [ui5-link]:after{content:\"\\\\\"}:host([separator-style=DoubleBackSlash]) [ui5-link]:after{content:\"\\\\\\\\\"}:host([separator-style=DoubleGreaterThan]) [ui5-link]:after{content:\">>\"}:host([separator-style=DoubleSlash]) [ui5-link]:after{content:\"//\"}:host([separator-style=GreaterThan]) [ui5-link]:after{content:\">\"}";

	return breadcrumbsCss;

});
