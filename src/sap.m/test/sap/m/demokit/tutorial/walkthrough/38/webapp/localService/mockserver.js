sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	return {

		init: function () {

			// create
			var oMockServer = new MockServer({
				rootUri: "https://services.odata.org/V2/Northwind/Northwind.svc/"
			});

			var oUriParameters = jQuery.sap.getUriParameters();

			// configure mock server with a delay
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 1000
			});

			// simulate
			var sPath = sap.ui.require.toUrl("sap/ui/demo/walkthrough/") + "localService";
			oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");

			// start
			oMockServer.start();
		}
	};

});