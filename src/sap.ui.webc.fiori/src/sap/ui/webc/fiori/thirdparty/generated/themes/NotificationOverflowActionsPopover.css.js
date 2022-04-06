sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var NotificationOverflowActionsPopoverCss = {packageName:"@ui5/webcomponents-fiori",fileName:"themes/NotificationOverflowActionsPopover.css",content:".ui5-notification-overflow-list{display:flex;flex-direction:column}.ui5-notification-overflow-popover::part(content){padding:var(--_ui5-notification-overflow-popover-padding)}"};

	return NotificationOverflowActionsPopoverCss;

});
