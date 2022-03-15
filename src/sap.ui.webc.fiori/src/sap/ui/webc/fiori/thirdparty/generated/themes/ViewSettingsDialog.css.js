sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theming/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var viewSettingsDialogCSS = {packageName:"@ui5/webcomponents-fiori",fileName:"themes/ViewSettingsDialog.css",content:"[on-desktop] .ui5-vsd-content{height:375px;min-width:350px}.ui5-vsd-header{width:100%}.ui5-vsd-header>[ui5-bar]{height:4rem;box-shadow:none}.ui5-vsd-content{margin:0 .1px 0 -1rem}.ui5-vsd-title{margin-bottom:.3rem;font-size:var(--ui5_title_level_5Size)}.ui5-vsd-start{display:flex;justify-content:center;align-items:center}.ui5-vsd-bar-title{display:flex;flex-direction:column;margin-left:.5rem}.ui5-vsd-back-button{margin-right:.5rem}.ui5-vsd-footer{width:100%;display:flex;justify-content:flex-end;margin:.1875rem 1rem;margin-left:.5rem;margin-right:.5rem}.ui5-vsd-footer [ui5-button]:first-child{margin-right:.5rem;min-width:4rem}.ui5-vsd-sort{width:100%;height:100%}[ui5-li-groupheader]{overflow:hidden}[ui5-dialog]::part(content){padding-top:0;padding-bottom:0}"};

	return viewSettingsDialogCSS;

});
