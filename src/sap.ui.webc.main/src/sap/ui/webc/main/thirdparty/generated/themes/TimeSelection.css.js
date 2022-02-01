sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var timeSelectionCss = {packageName:"@ui5/webcomponents",fileName:"themes/TimeSelection.css",content:":host(:not([hidden])){display:inline-block;min-width:18rem}.ui5-time-selection-root{width:100%;height:100%;display:flex;justify-content:center;align-items:stretch;direction:ltr;box-sizing:border-box}.ui5-time-selection-root.ui5-phone{height:90vh}:host(.ui5-dt-time.ui5-dt-cal--hidden) .ui5-time-selection-root.ui5-phone{height:80vh}[ui5-wheelslider]{padding-left:.25rem;padding-right:.25rem}"};

	return timeSelectionCss;

});
