sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.suite",
		/*
		 * Note: the following configuration has no effect yet as the generic test base
		 * does not visit controls that are not listed in the library.js arrays
		 */
		objectCapabilities: {
			"sap.ui.suite.hcm.QvItem": {
				moduleName: "sap/ui/suite/QuickViewUtils"
			},
			"sap.ui.suite.hcm.QvContent": {
				moduleName: "sap/ui/suite/QuickViewUtils"
			}
		}
	});

	return oConfig;
});