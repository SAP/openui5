sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var InputIcon_css = {packageName:"@ui5/webcomponents",fileName:"themes/InputIcon.css",content:"[input-icon]{color:var(--_ui5_input_icon_color);cursor:pointer;outline:none;padding:var(--_ui5_input_icon_padding);border-left:1px solid transparent;min-width:1rem;min-height:1rem;border-radius:var(--_ui5_input_icon_border_radius)}[input-icon][pressed]{background:var(--_ui5_input_icon_pressed_bg);color:var(--_ui5_input_icon_pressed_color)}[input-icon]:active{background-color:var(--sapButton_Active_Background);color:var(--_ui5_input_icon_pressed_color)}[input-icon]:not([pressed]):not(:active):hover{background:var(--_ui5_input_icon_hover_bg)}[input-icon]:hover{border-left:var(--_ui5_select_hover_icon_left_border)}[input-icon][dir=rtl]:hover{border-left:none;border-right:var(--_ui5_select_hover_icon_left_border)}[input-icon][dir=rtl]{border-left:none;border-right:1px solid transparent}"};

	return InputIcon_css;

});
