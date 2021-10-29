sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var valueStateMessageStyles = {packageName:"@ui5/webcomponents",fileName:"themes/ValueStateMessage.css",content:".ui5-valuestatemessage-popover{box-shadow:none}.ui5-valuestatemessage-root{box-sizing:border-box;display:inline-block;color:var(--sapTextColor);font-size:var(--sapFontSmallSize);font-family:\"72override\",var(--sapFontFamily);height:auto;padding:.5rem;overflow:hidden;text-overflow:ellipsis;min-width:6.25rem;border:var(--_ui5_value_state_message_border)}ui5-responsive-popover .ui5-valuestatemessage-header{min-height:2rem;padding:.5625rem 1rem}.ui5-valuestatemessage--success{background:var(--sapSuccessBackground)}.ui5-valuestatemessage--warning{background:var(--sapWarningBackground)}.ui5-valuestatemessage--error{background:var(--sapErrorBackground)}.ui5-valuestatemessage--information{background:var(--sapInformationBackground)}.ui5-responsive-popover-header:focus,.ui5-responsive-popover-header[focused]{outline-offset:-.125rem;outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--_ui5_value_state_message_focus_border_radius)}"};

	return valueStateMessageStyles;

});
