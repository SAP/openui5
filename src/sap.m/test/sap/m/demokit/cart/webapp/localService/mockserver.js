sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], function (MockServer, Log) {
	"use strict";

	var oMockServer,
		_sMetadataPath = "sap/ui/demo/cart/localService/metadata",
		_sJsonFilesModulePath = "sap/ui/demo/cart/localService/mockdata";

	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */

		init : function () {
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesModulePath),
				sMetadataUrl = sap.ui.require.toUrl(_sMetadataPath + ".xml");

			oMockServer = new MockServer({
				rootUri : "/sap/opu/odata/IWBEP/EPM_DEVELOPER_SCENARIO_SRV/",
				recordRequests: false
			});

			// configure mock server with a delay of 100ms
			MockServer.config({
				autoRespond : true,
				autoRespondAfter : (oUriParameters.get("serverDelay") || 100)
			});

			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl : sJsonFilesUrl,
				bGenerateMissingMockData : true
			});

			oMockServer.start();

			Log.info("Running the app with mock data");
		}
	};

});