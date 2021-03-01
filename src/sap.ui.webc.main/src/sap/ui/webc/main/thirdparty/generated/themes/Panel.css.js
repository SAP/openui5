sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var panelCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none}:host(:not([hidden])){display:block}:host{font-family:\"72override\",var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-bottom:1px solid var(--sapGroup_TitleBorderColor)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{height:var(--_ui5_panel_header_height);width:100%;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:1rem;padding-left:.25rem;border-bottom:1px solid transparent}.ui5-panel-header-icon{color:var(--sapContent_IconColor)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header])) .ui5-panel-header-button{pointer-events:none}:host(:not([_has-header]):not([fixed])){cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus{outline:var(--_ui5_panel_focus_border);outline-offset:-3px}:host(:not([collapsed])) .ui5-panel-header-button{transform:rotate(90deg)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-header-title{width:calc(100% - var(--_ui5_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:\"72override\",var(--sapFontHeaderFamily);font-size:var(--sapFontHeader5Size);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-content{padding:.625rem 1rem 1.375rem 1rem;background-color:var(--sapGroup_ContentBackground);outline:none}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5_panel_button_root_width);margin-right:.25rem}";

	return panelCss;

});
