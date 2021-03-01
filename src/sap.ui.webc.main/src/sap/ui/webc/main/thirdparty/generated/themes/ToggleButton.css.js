sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var toggleBtnCss = ":host(:not([hidden])){display:inline-block}:host([disabled]){pointer-events:none}:host([design=Positive][pressed]),:host([design=Positive][pressed]:hover),:host([design=Positive][pressed][focused]){background:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Selected_TextColor);outline-color:var(--sapContent_ContrastFocusColor)}:host([design=Positive][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover),:host([design=Positive][pressed][active]){background:var(--sapButton_Accept_Selected_Hover_Background)}:host([design=Negative][pressed]),:host([design=Negative][pressed]:hover),:host([design=Negative][pressed][focused]){background:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Selected_TextColor);outline-color:var(--sapContent_ContrastFocusColor)}:host([design=Negative][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover),:host([design=Negative][pressed][active]){background:var(--sapButton_Reject_Selected_Hover_Background)}:host([design=Emphasized][pressed]),:host([design=Emphasized][pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover),:host([design=Transparent][pressed]),:host([design=Transparent][pressed]:hover),:host([pressed]),:host([pressed]:hover),:host([pressed][focused]){background:var(--sapButton_Selected_Background);border-color:var(--sapButton_Selected_BorderColor);color:var(--sapButton_Selected_TextColor);outline-color:var(--sapContent_ContrastFocusColor)}:host([pressed]:not([active]):not([non-interactive]):not([_is-touch]):hover),:host([pressed][active]){background:var(--sapButton_Selected_Hover_Background)}";

	return toggleBtnCss;

});
