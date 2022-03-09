sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.ux3",
		skipTests: [GenericTestCollection.Test.EnforceSemanticRendering],
		objectCapabilities: {
			"sap.ui.ux3.NotificationBar.NotifierView": {
				moduleName: "sap/ui/ux3/NotificationBar"
			},
			"sap.ui.ux3.NotificationBar.MessageView": {
				moduleName: "sap/ui/ux3/NotificationBar"
			},
			"sap.ui.ux3.ExactList.LB": {
				moduleName: "sap/ui/ux3/ExactList",
				rendererHasDependencies: true
			},
			"sap.ui.ux3.ExactAreaToolbarTitle": {
				moduleName: "sap/ui/ux3/ExactArea"
			}
		}
	});

	return oConfig;
});