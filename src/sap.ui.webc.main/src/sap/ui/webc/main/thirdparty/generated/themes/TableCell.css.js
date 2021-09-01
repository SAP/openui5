sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var styles = ":host{display:table-cell;font-family:\"72override\",var(--sapFontFamily);font-size:.875rem;height:100%;box-sizing:border-box;overflow:hidden;color:var(--sapContent_LabelColor);word-break:break-word;vertical-align:middle}td{display:contents}.ui5-table-popin-row td{padding-left:1rem}:host([popined]) td{padding-left:0}::slotted([ui5-label]){color:inherit}";

	return styles;

});
