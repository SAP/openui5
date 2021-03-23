sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/core/util/MockServerAnnotationsHandler"
], function (MockServer) {
	"use strict";

	var oMockServerHelper = {

		/**
		 * Initializes mock server for SEPMRA_PROD_MAN service.
		 * For demo purposes the local mock data in this folder is returned instead of real data.
		 * @protected
		 * @returns {sap/ui/core/util/MockServer}
		 */
		init: function () {
			var sJsonFilesUrl = sap.ui.require.toUrl("test-resources/sap/ui/integration/qunit/testResources/localService/SEPMRA_PROD_MAN/mockdata"),
				sMetadataUrl = sap.ui.require.toUrl("test-resources/sap/ui/integration/qunit/testResources/localService/SEPMRA_PROD_MAN/metadata.xml"),
				oMockServer;

			// configure all mock servers auto respond and delay
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 0
			});

			oMockServer = new MockServer({
				rootUri: "/SEPMRA_PROD_MAN/"
			});

			// simulate all requests using mock data
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl : sJsonFilesUrl,
				bGenerateMissingMockData : true,
				aEntitySetsNames: [
					"SEPMRA_C_PD_Product",
					"SEPMRA_C_PD_Supplier",
					"SEPMRA_C_PD_ProductText"
				]
			});

			oMockServer.start();

			return oMockServer;
		}
	};

	return oMockServerHelper;
});