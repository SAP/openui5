sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	return {

		init: function (sODataServiceUrl) {
			var oMockServer, sLocalServicePath, aRequests, oErrorResponse, fnResponse;

			// create
			oMockServer = new MockServer({
				rootUri: sODataServiceUrl
			});

			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 1000
			});

			sLocalServicePath = jQuery.sap.getModulePath("sap.ui.table.sample.TreeTable.BasicODataTreeBinding.localService");

			// simulate
			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl : sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: false
			});

			// start
			oMockServer.start();
		}

	};

});
