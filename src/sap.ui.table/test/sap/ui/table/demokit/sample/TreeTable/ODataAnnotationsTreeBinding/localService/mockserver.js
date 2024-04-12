sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";

	return {

		init: function(sODataServiceUrl) {
			const oMockServer = new MockServer({
				rootUri: sODataServiceUrl
			});
			const sLocalServicePath = sap.ui.require.toUrl("sap/ui/table/sample/TreeTable/ODataAnnotationsTreeBinding/localService");

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 500
			});

			oMockServer.simulate(sLocalServicePath + "/metadata.xml", {
				sMockdataBaseUrl: sLocalServicePath + "/mockdata",
				bGenerateMissingMockData: false
			});

			oMockServer.start();

			return oMockServer;
		}

	};

});