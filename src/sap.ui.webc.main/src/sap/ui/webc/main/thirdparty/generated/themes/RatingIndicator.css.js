sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var RatingIndicatorCss = ":host(:not([hidden])){display:inline-block;font-size:1.5rem;cursor:pointer}:host([disabled]){opacity:.6;cursor:auto;outline:none}:host([readonly]){cursor:auto}:host([_focused]){outline:1px dotted var(--sapContent_FocusColor)}.ui5-rating-indicator-root{outline:none}.ui5-rating-indicator-icon{position:relative;color:var(--sapContent_UnratedColor);user-select:none}.ui5-rating-indicator-icon.ui5-rating-indicator-active-icon{color:var(--sapContent_RatedColor)}.ui5-rating-indicator-icon.ui5-rating-indicator-half-icon:before{content:\"\\2605\";position:absolute;top:0;left:0;width:50%;height:100%;color:var(--sapContent_RatedColor);overflow:hidden}.ui5-rating-indicator-stars-wrapper{display:flex}";

	return RatingIndicatorCss;

});
