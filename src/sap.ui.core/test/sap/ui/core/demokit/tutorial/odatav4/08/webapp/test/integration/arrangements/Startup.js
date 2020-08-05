sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/core/tutorial/odatav4/localService/mockserver"
], function(Opa5, mockserver) {
	"use strict";

	return Opa5.extend("sap.ui.core.tutorial.odatav4.test.integration.arrangements.Startup", {

		iStartMyApp: function (oOptions) {
			oOptions = oOptions || {};

			// start the app with a minimal delay to make tests fast but still async to discover basic timing issues
			oOptions.delay = oOptions.delay || 50;

			// start the mock server
			this.iWaitForPromise(mockserver.init());

			// start the app UI component
			this.iStartMyUIComponent({
				componentConfig: {
					name: "sap.ui.core.tutorial.odatav4",
					async: true
				},
				hash: oOptions.hash,
				autoWait: oOptions.autoWait
			});
		}
	});
});