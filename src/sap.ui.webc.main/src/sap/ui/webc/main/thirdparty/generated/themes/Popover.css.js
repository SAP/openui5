sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents", "sap_fiori_3", () => parametersBundle_css);
	var PopoverCss = ".ui5-popover-arrow{pointer-events:none;display:block;width:1rem;height:1rem;position:absolute;overflow:hidden}.ui5-popover-arrow:after{content:\"\";display:block;width:.7rem;height:.7rem;background-color:var(--sapGroup_ContentBackground);box-shadow:var(--sapContent_Shadow3);transform:rotate(-45deg)}:host([actual-placement-type=Bottom]) .ui5-popover-arrow{left:calc(50% - .5625rem);top:-.5rem;height:.5625rem}:host([actual-placement-type=Bottom]) .ui5-popover-arrow:after{margin:.1875rem 0 0 .1875rem}:host([actual-placement-type=Left]) .ui5-popover-arrow{top:calc(50% - .5625rem);right:-.5625rem;width:.5625rem}:host([actual-placement-type=Left]) .ui5-popover-arrow:after{margin:.1875rem 0 0 -.375rem}:host([actual-placement-type=Left]) [dir=rtl] .ui5-popover-arrow:after{margin:.1875rem .25rem 0 0}:host([actual-placement-type=Bottom]) [dir=rtl] .ui5-popover-arrow:after{margin:.1875rem .125rem 0 0}:host([actual-placement-type=Top]) [dir=rtl] .ui5-popover-arrow:after{margin:-.4375rem .125rem 0 0}:host([actual-placement-type=Top]) .ui5-popover-arrow{left:calc(50% - .5625rem);height:.5625rem;top:100%}:host([actual-placement-type=Top]) .ui5-popover-arrow:after{margin:-.375rem 0 0 .125rem}:host(:not([actual-placement-type])) .ui5-popover-arrow,:host([actual-placement-type=Right]) .ui5-popover-arrow{left:-.5625rem;top:calc(50% - .5625rem);width:.5625rem;height:1rem}:host(:not([actual-placement-type])) .ui5-popover-arrow:after,:host([actual-placement-type=Right]) .ui5-popover-arrow:after{margin:.125rem 0 0 .25rem}:host(:not([actual-placement-type])) [dir=rtl] .ui5-popover-arrow:after,:host([actual-placement-type=Right]) [dir=rtl] .ui5-popover-arrow:after{margin:.1875rem -.375rem 0 0}:host([hide-arrow]) .ui5-popover-arrow{display:none}";

	return PopoverCss;

});
