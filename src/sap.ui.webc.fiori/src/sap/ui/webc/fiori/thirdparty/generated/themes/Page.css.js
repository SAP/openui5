sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var PageCss = ":host(:not([hidden])){width:100%;height:100%;display:inline-block}.ui5-page-root{height:inherit;overflow:hidden;position:relative;z-index:0;box-sizing:border-box;background-color:inherit}.ui5-page-header-root{z-index:1}.ui5-page-content-root{overflow:hidden auto;position:absolute;will-change:scroll-position;width:100%;top:2.75rem;bottom:0;box-sizing:border-box}.ui5-page-footer-root{position:absolute;bottom:0;left:0;z-index:2;width:100%}:host([disable-scrolling]) .ui5-page-content-root{overflow:hidden}:host([floating-footer]) .ui5-page-footer-root{left:.5rem;right:.5rem;width:auto;opacity:1;bottom:.5rem}:host([hide-footer]:not([floating-footer])) .ui5-page-footer-root{display:none}:host([floating-footer]:not([hide-footer])) .ui5-page-footer-root{animation:bounceShow .35s ease-in-out forwards}:host([floating-footer][hide-footer]) .ui5-page-footer-root{animation:bounceHide .35s ease-in-out forwards}:host([background-design=Solid]){background-color:var(--sapBackgroundColor)}:host([background-design=Transparent]){background-color:transparent}:host([background-design=List]){background-color:var(--_ui5_page_list_bg)}@keyframes bounceShow{0%{transform:translateY(100%);opacity:0}to{opacity:1}}@keyframes bounceHide{0%{transform:translateY(-5%);opacity:1}to{transform:translateY(100%);opacity:0}}";

	return PageCss;

});
