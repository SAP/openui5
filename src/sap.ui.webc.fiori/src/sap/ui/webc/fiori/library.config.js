sap.ui.define([
	"sap/ui/webc/common/thirdparty/base/CSP"
], function(CSP) {
	"use strict";

	// configure third parties
	window.sap.ui.loader.config({
		shim: {
			'sap/ui/webc/fiori/lib/zxing': {
				amd: true,
				exports: 'ZXing'
			}
		}
	});

	// configure CSS paths for CSP
	CSP.setPackageCSSRoot("@ui5/webcomponents-fiori", sap.ui.require.toUrl("sap/ui/webc/fiori/thirdparty/css/"));
});
