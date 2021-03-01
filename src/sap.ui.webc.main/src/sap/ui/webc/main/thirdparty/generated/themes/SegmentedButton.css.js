sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var SegmentedButtonCss = ":host(:not([hidden])){display:inline-block}.ui5-segmented-button-root{display:flex}::slotted([ui5-toggle-button]){border-radius:0;height:var(--_ui5_button_base_height);min-width:2.5rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}::slotted([ui5-toggle-button]:nth-child(odd)){border:1px solid var(--sapButton_Selected_BorderColor);border-right:0;border-left:0}::slotted([ui5-toggle-button]:last-child){border-top-right-radius:var(--_ui5_segmented_btn_border_radius);border-bottom-right-radius:var(--_ui5_segmented_btn_border_radius);border-right:1px solid var(--sapButton_Selected_BorderColor)}::slotted([ui5-toggle-button]:first-child){border-top-left-radius:var(--_ui5_segmented_btn_border_radius);border-bottom-left-radius:var(--_ui5_segmented_btn_border_radius);border-left:1px solid var(--sapButton_Selected_BorderColor)}[dir=rtl] ::slotted([ui5-toggle-button]:first-child){border-top-right-radius:var(--_ui5_segmented_btn_border_radius);border-bottom-right-radius:var(--_ui5_segmented_btn_border_radius);border-top-left-radius:0;border-bottom-left-radius:0;border-right:1px solid var(--sapButton_Selected_BorderColor)}[dir=rtl] ::slotted([ui5-toggle-button]:last-child){border-top-right-radius:0;border-bottom-right-radius:0;border-top-left-radius:var(--_ui5_segmented_btn_border_radius);border-bottom-left-radius:var(--_ui5_segmented_btn_border_radius);border-left:1px solid var(--sapButton_Selected_BorderColor)}[dir=rtl] ::slotted([ui5-toggle-button]:only-child){border-top-right-radius:var(--_ui5_segmented_btn_border_radius);border-bottom-right-radius:var(--_ui5_segmented_btn_border_radius);border-top-left-radius:var(--_ui5_segmented_btn_border_radius);border-bottom-left-radius:var(--_ui5_segmented_btn_border_radius)}";

	return SegmentedButtonCss;

});
