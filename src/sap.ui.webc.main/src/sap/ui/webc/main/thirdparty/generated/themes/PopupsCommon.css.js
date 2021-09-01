sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var PopupsCommonCss = ":host{display:none;position:fixed;min-width:6.25rem;background:var(--sapGroup_ContentBackground);box-shadow:var(--sapContent_Shadow2);border-radius:.25rem;min-height:2rem;box-sizing:border-box}.ui5-popup-root{background:inherit;border-radius:inherit;width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;max-height:94vh;max-width:90vw;outline:none}@media screen and (-ms-high-contrast:active){.ui5-popup-root{border:1px solid var(--sapPageFooter_BorderColor)}}.ui5-popup-root .ui5-popup-header-root{box-shadow:var(--sapContent_Shadow0);margin-bottom:.125rem}.ui5-popup-footer-root{background:var(--sapPageFooter_Background);border-top:1px solid var(--sapPageFooter_BorderColor);color:var(--sapPageFooter_TextColor)}.ui5-popup-footer-root,.ui5-popup-header-root,:host([header-text]) .ui5-popup-header-text{margin:0;color:var(--sapPageHeader_TextColor);font-size:1rem;font-weight:400;font-family:\"72override\",var(--sapFontFamily);display:flex;justify-content:center;align-items:center}.ui5-popup-content{overflow:auto;padding:var(--_ui5_popup_content_padding);box-sizing:border-box}:host([no-padding]) .ui5-popup-content{padding:0}:host([header-text]) .ui5-popup-header-text{padding:0 .25rem;text-align:center;min-height:var(--_ui5_popup_default_header_height);max-height:var(--_ui5_popup_default_header_height);line-height:var(--_ui5_popup_default_header_height);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:100%;display:inline-block}:host(:not([header-text])) .ui5-popup-header-text{display:none}:host([disable-scrolling]) .ui5-popup-content{overflow:hidden}";

	return PopupsCommonCss;

});
