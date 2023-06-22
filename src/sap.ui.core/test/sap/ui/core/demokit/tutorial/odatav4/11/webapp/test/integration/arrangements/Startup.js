sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/core/tutorial/odatav4/localService/mockserver"
], function (Opa5, mockserver) {
	"use strict";

	return Opa5.extend("sap.ui.core.tutorial.odatav4.test.integration.arrangements.Startup", {

		iStartMyApp : function () {
			// start the mock server
			this.iWaitForPromise(mockserver.init());

			// start the app UI component
			this.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.tutorial.odatav4",
					async : true
				},
				autoWait : true,
				timeout : 45 // BCP: 2270085466
			});
		}
	});
});
