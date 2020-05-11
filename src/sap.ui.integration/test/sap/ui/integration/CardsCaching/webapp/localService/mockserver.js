sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log"
], function (MockServer, JSONModel, Log) {
	"use strict";

	var activities1 = {
		data: [
			{
				"Name": "Career 1",
				"icon": "sap-icon://leads",
				"url": "/careers"
			},
			{
				"Name": "Company Directory 1",
				"icon": "sap-icon://address-book"
			}
		],
		time: Date.now()
	};

	var activities2 = {
		data: [
			{
				"Name": "Career 2",
				"icon": "sap-icon://leads",
				"url": "/careers"
			},
			{
				"Name": "Company Directory 2",
				"icon": "sap-icon://address-book"
			},
			{
				"Name": "Company Directory 2",
				"icon": "sap-icon://address-book"
			}
		],
		time: Date.now()
	};

	var title1 = {
		title: 'Card Title 1'
	};

	var title2 = {
		title: 'Card Title 2'
	};

	var _sAppPath = "sap/ui/CardsCaching/",
		_sJsonFilesPath = _sAppPath + "localService/mockdata";

	return {

		init: function () {

			return new Promise(function(fnResolve, fnReject) {
				var sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json"),
					oManifestModel = new JSONModel(sManifestUrl);

				oManifestModel.attachRequestCompleted(function () {
					var sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath),
						oMainDataSource = oManifestModel.getProperty("/sap.app/dataSources/getActivities"),
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

					var fnCustomActivities = function(oEvent) {

						this._lastActivities = this._lastActivities === activities1 ? activities2 : activities1;

						var activities = this._lastActivities;
						activities1.time = Date.now();

						oEvent.getParameter("oFilteredData").results = activities;
					};
					oMockServer.attachAfter("GET", fnCustomActivities, "Activities");

					var fnCustomTitles = function(oEvent) {

						this._lastTitle = this._lastTitle === title1 ? title2 : title1;

						oEvent.getParameter("oFilteredData").results = this._lastTitle;
					};
					oMockServer.attachAfter("GET", fnCustomTitles, "Titles");

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