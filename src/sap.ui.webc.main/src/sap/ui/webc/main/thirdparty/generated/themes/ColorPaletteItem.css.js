sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var ColorPaletteItemCss = ":host(:not([hidden])){height:var(--_ui5_color-palette-item-height);width:var(--_ui5_color-palette-item-height);border:1px solid var(--sapContent_ForegroundBorderColor);border-radius:.25rem;display:inline-block;margin:var(--_ui5_color-palette-item-margin)}:host(:not([_disabled]):hover){height:var(--_ui5_color-palette-item-hover-height);width:var(--_ui5_color-palette-item-hover-height);margin:var(--_ui5_color-palette-item-hover-margin)}.ui5-cp-item{position:relative;width:100%;height:100%}:host(:not([_disabled])) .ui5-cp-item:focus{outline:none}:host(:not([_disabled]):focus) .ui5-cp-item{pointer-events:none}:host(:not([_disabled])) .ui5-cp-item:focus:before{content:\"\";box-sizing:border-box;position:absolute;left:.125rem;top:.125rem;right:.125rem;bottom:.125rem;border:.0625rem solid #fff;pointer-events:none}:host(:not([_disabled])) .ui5-cp-item:focus:after{content:\"\";box-sizing:border-box;position:absolute;left:.125rem;top:.125rem;right:.125rem;bottom:.125rem;border:.0625rem dotted #000;pointer-events:none}";

	return ColorPaletteItemCss;

});
