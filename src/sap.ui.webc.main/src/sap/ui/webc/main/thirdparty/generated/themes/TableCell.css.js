sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var styles = {packageName:"@ui5/webcomponents",fileName:"themes/TableCell.css",content:":host{display:table-cell;font-family:\"72override\",var(--sapFontFamily);font-size:.875rem;height:100%;box-sizing:border-box;overflow:hidden;color:var(--sapContent_LabelColor);word-break:break-word;vertical-align:middle}td{display:contents}:host([popined]){padding-left:0;padding-top:.25rem}::slotted([ui5-label]){color:inherit}"};

	return styles;

});
