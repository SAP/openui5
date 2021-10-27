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
		 * @param {object} [oOptionsParameter] init parameters for the mock server.
		 */
		init: function (oOptionsParameter) {
			// avoid reinitialization of mock server
			if (oMockServer) {
				return Promise.resolve();
			}

			var oOptions = oOptionsParameter || {},
				sJsonFilesUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/SEPMRA_PROD_MAN/mockdata"),
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
					"SEPMRA_C_PD_Supplier",
					"SEPMRA_C_PD_ProductText"
				]
			});

			var aRequests = oMockServer.getRequests();

			// compose an error response for each request
			var fnResponse = function (iErrCode, sMessage, aRequest) {
				aRequest.response = function(oXhr){
					oXhr.respond(iErrCode, {"Content-Type": "text/plain;charset=utf-8"}, sMessage);
				};
			};

			// simulate metadata errors
			if (oOptions.metadataError) {
				aRequests.forEach(function (aEntry) {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}

			// simulate request errors
			var sErrorParam = oOptions.errorType,
				iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
			if (sErrorParam) {
				aRequests.forEach(function (aEntry) {
					fnResponse(iErrorCode, sErrorParam, aEntry);
				});
			}

			oMockServer.setRequests(aRequests);
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