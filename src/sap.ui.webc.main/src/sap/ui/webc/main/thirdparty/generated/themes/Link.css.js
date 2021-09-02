sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var linkCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none}:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapLinkColor);font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);cursor:pointer;outline:none}:host([disabled]){pointer-events:none}:host(:not([disabled])) .ui5-link-root:hover{color:var(--sapLinkColor);text-decoration:var(--_ui5_link_hover_text_decoration)}:host([disabled]) .ui5-link-root{text-shadow:none;outline:none;cursor:default;pointer-events:none;opacity:var(--_ui5_link_opacity)}:host([design=Emphasized]) .ui5-link-root{font-weight:700}:host([design=Subtle]) .ui5-link-root,:host([design=Subtle]) .ui5-link-root:visited{color:var(--sapLink_SubtleColor)}:host([design=Subtle]) .ui5-link-root:focus{color:var(--sapLinkColor)}:host([wrapping-type=Normal]) .ui5-link-root{white-space:normal;word-wrap:break-word}.ui5-link-root{width:100%;display:inline-block;position:relative;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-wrap:normal;text-decoration:none;outline:none;text-decoration:var(--_ui5_link_text_decoration)}.ui5-link-root,.ui5-link-root:active,.ui5-link-root:visited{color:currentColor}:host([focused]) .ui5-link-root{outline-offset:-1px;outline:1px dotted var(--sapContent_FocusColor);text-decoration:underline}";

	return linkCss;

});
