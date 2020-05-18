sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log"
], function (MockServer, JSONModel, Log) {
	"use strict";

	var shouldUpdate = [
		{

		}
	];

	var _sAppPath = "sap/ui/CardsCaching/",
		_sJsonFilesPath = _sAppPath + "localService/mockdata";

	return {

		init: function () {

			return new Promise(function(fnResolve, fnReject) {
				var sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json"),
					oManifestModel = new JSONModel(sManifestUrl);

				oManifestModel.attachRequestCompleted(function () {
					var sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath),
						oMainDataSource = oManifestModel.getProperty("/sap.app/dataSources/shouldUpdateActivities"),
						sMetadataUrl = sap.ui.require.toUrl(_sAppPath + oMainDataSource.settings.localUri);

					// create
					var oMockServer = new MockServer({
						rootUri: oMainDataSource.uri
					});

					// configure
					MockServer.config({
						autoRespond: true,
						autoRespondAfter: 500
					});

					// simulate
					oMockServer.simulate(sMetadataUrl, {
						sMockdataBaseUrl: sJsonFilesUrl
					});

					var fnCustom = function(oEvent) {

						// var sParameter = "timespan=";
						//
						// var oXhr = oEvent.getParameter("oXhr");
						// if (oXhr) {
						//
						// 	var iIndexOf = oXhr.url.indexOf(sParameter);
						// 	if (iIndexOf > -1) {
						// 		var iTime = oXhr.url.substring(iIndexOf + sParameter.length);
						// 		iTime = parseInt(iTime);
						// 	}
						// }


						oEvent.getParameter("oFilteredData").results = shouldUpdate;
					};
					oMockServer.attachAfter("GET", fnCustom, "Activities");

					// start
					oMockServer.start();

					Log.info("Running the app with mock data");
					fnResolve();
				});

				oManifestModel.attachRequestFailed(function () {
					var sError = "Failed to load application manifest";

					Log.error(sError);
					fnReject(new Error(sError));
				});
			});
		}
	};
});