sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var cardCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none}:host(:not([hidden])){display:inline-block;width:100%}.ui5-card-root{width:100%;height:100%;color:var(--sapGroup_TitleTextColor);background:var(--sapTile_Background);box-shadow:var(--_ui5_card_box_shadow);border-radius:.25rem;border:1px solid var(--_ui5_card_border_color);overflow:hidden;font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);box-sizing:border-box}.ui5-card-root.ui5-card--nocontent{height:auto}.ui5-card-root.ui5-card--nocontent .ui5-card-header-root{border-bottom:none}.ui5-card-root .ui5-card-header-root{display:block;border-bottom:1px solid var(--_ui5_card_header_border_color)}";

	return cardCss;

});
