sap.ui.define([
	"sap/ui/webc/common/thirdparty/base/CSP"
], function(CSP) {
	"use strict";

	// configure CSS paths for CSP
	CSP.setPackageCSSRoot("@ui5/webcomponents", sap.ui.require.toUrl("sap/ui/webc/main/thirdparty/css/"));
});
