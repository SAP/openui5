sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/core/util/MockServerAnnotationsHandler"
], function (MockServer) {
	"use strict";

	var oMockServer;

	var oMockServerInterface = {

		/**
		 * Initializes mock server for SEPMRA_PROD_MAN service.
		 * For demo purposes the local mock data in this folder is returned instead of real data.
		 * @protected
		 */
		init: function () {
			// avoid reinitialization of mock server
			if (oMockServer) {
				return Promise.resolve();
			}

			var sJsonFilesUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/SEPMRA_PROD_MAN/mockdata"),
				sMetadataUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/SEPMRA_PROD_MAN/metadata.xml");

			oMockServer = new MockServer({
				rootUri: "/SEPMRA_PROD_MAN/"
			});

			// simulate all requests using mock data
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl : sJsonFilesUrl,
				bGenerateMissingMockData : true,
				aEntitySetsNames: [
					"SEPMRA_C_PD_Product",
					"SEPMRA_C_PD_ProductText",
					"SEPMRA_C_PD_Supplier"
				]
			});

			oMockServer.start();

			return Promise.resolve();
		},

		destroy: function () {
			if (!oMockServer) {
				return;
			}

			oMockServer.destroy();
			oMockServer = null;
		}
	};

	return oMockServerInterface;
});