sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.f",
		objectCapabilities: {
			"sap.f.shellBar.CoPilot": {
				apiVersion: 1
			}
		}
	});

	return oConfig;
});