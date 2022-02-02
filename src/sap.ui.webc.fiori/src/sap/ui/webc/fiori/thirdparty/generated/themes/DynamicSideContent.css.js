sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var DynamicSideContentCss = {packageName:"@ui5/webcomponents-fiori",fileName:"themes/DynamicSideContent.css",content:":host{display:block;width:100%;height:100%;position:relative}.ui5-dsc-root{width:100%;height:100%;position:relative;overflow-x:hidden;overflow-y:auto;display:flex}.ui5-dsc-main,.ui5-dsc-side{display:inline;position:relative;overflow-x:hidden;overflow-y:auto;box-sizing:border-box;flex:none}.ui5-dsc-root>aside[class^=ui5-dsc-span],.ui5-dsc-root>div[class^=ui5-dcs-span]{overflow:auto}.ui5-dsc-main.ui5-dsc-span-fixed{width:calc(100% - 21.25rem)}.ui5-dsc-side.ui5-dsc-span-fixed{width:21.25rem}.ui5-dsc-root>.ui5-dsc-span-0{display:none}.ui5-dsc-root>.ui5-dsc-span-3{width:25%}.ui5-dsc-root>.ui5-dsc-span-4{width:33.333%}.ui5-dsc-root>.ui5-dsc-span-6{width:50%}.ui5-dsc-root>.ui5-dsc-span-8{width:66.666%}.ui5-dsc-root>.ui5-dsc-span-9{width:75%}.ui5-dsc-root>.ui5-dsc-span-12{width:100%}"};

	return DynamicSideContentCss;

});
