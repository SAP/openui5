sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var dialogCSS = ":host{min-width:20rem;min-height:6rem;box-shadow:var(--sapContent_Shadow3)}:host([stretch]){width:90%;height:90%}:host([stretch][on-phone]){width:100%;height:100%}:host([stretch][on-phone]) .ui5-popup-root{max-height:100vh;max-width:100vw}:host([draggable]) .ui5-popup-header-root,:host([draggable]) ::slotted([slot=header]){cursor:move}:host([draggable]) .ui5-popup-header-root *{cursor:auto}.ui5-popup-header-root:focus{outline:var(--_ui5_dialog_header_focus_width) dotted var(--sapContent_FocusColor);outline-offset:var(--_ui5_dialog_header_focus_offset)}.ui5-popup-root{display:flex;flex-direction:column;max-width:100vw}:host([stretch]) .ui5-popup-content{width:100%;height:100%}.ui5-popup-content{min-height:var(--_ui5_dialog_content_min_height);flex:1 1 auto}.ui5-popup-resize-handle{position:absolute;bottom:-.0625rem;right:-.25rem;cursor:se-resize;color:var(--_ui5_dialog_resize_handle_color)}.ui5-popup-resize-handle[dir=rtl]{left:-.25rem;right:unset;cursor:sw-resize}";

	return dialogCSS;

});
