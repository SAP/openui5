sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var styles = ":host{display:contents}:host([_busy]) .ui5-table-group-row-root{opacity:.72;pointer-events:none}.ui5-table-group-row-root{height:2rem;border-bottom:1px solid var(--sapList_TableGroupHeaderBorderColor);background-color:var(--sapList_TableGroupHeaderBackground);color:var(--sapList_TableGroupHeaderTextColor);font-family:\"72override\",var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400}.ui5-table-group-row-root:focus{outline:var(--ui5_table_row_outline_width) dotted var(--sapContent_FocusColor);outline-offset:-.0625rem}td{word-break:break-word;vertical-align:middle;padding:.5rem .25rem .5rem 1rem;text-align:left}:host [dir=rtl] td{text-align:right}";

	return styles;

});
