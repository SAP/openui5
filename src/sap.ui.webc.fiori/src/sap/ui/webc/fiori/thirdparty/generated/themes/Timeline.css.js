sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var styles = {packageName:"@ui5/webcomponents-fiori",fileName:"themes/Timeline.css",content:":host(:not([hidden])){display:block}.ui5-timeline-root{padding:var(--_ui5_tl_padding);box-sizing:border-box;overflow:hidden}.ui5-timeline-list{list-style:none;margin:0;padding:0}.ui5-timeline-list-item{margin-bottom:var(--_ui5_tl_li_margin_bottom)}.ui5-timeline-list-item:last-child{margin-bottom:0}:host([layout=Horizontal]) .ui5-timeline-list{white-space:nowrap;list-style:none;margin:0;padding:0}:host([layout=Horizontal]) .ui5-timeline-list-item{display:inline-block;margin-inline-start:var(--_ui5_tl_li_margin_bottom)}:host([layout=Horizontal]) .ui5-timeline-scroll-container{overflow:auto;width:calc(100% + var(--_ui5_timeline_scroll_container_offset))}"};

	return styles;

});
