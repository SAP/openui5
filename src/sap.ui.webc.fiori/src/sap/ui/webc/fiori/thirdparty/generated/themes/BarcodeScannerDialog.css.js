sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Themes', 'sap/ui/webc/common/thirdparty/theme-base/generated/themes/sap_fiori_3/parameters-bundle.css', './sap_fiori_3/parameters-bundle.css'], function (Themes, defaultThemeBase, parametersBundle_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var defaultThemeBase__default = /*#__PURE__*/_interopDefaultLegacy(defaultThemeBase);

	Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", "sap_fiori_3", () => defaultThemeBase__default);
	Themes.registerThemePropertiesLoader("@ui5/webcomponents-fiori", "sap_fiori_3", () => parametersBundle_css);
	var barcodeScannerDialogCss = ".ui5-barcode-scanner-dialog-video,.ui5-barcode-scanner-dialog-video-wrapper{height:100%;width:100%}.ui5-barcode-scanner-dialog-video{object-fit:cover}.ui5-barcode-scanner-dialog-footer{display:flex;justify-content:flex-end;width:100%;padding:0 .5rem 0 0}[dir=rtl] .ui5-barcode-scanner-dialog-footer{padding:0 0 0 .5rem}.ui5-barcode-scanner-dialog-busy{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1}.ui5-barcode-scanner-dialog-busy:not([active]){display:none}";

	return barcodeScannerDialogCss;

});
