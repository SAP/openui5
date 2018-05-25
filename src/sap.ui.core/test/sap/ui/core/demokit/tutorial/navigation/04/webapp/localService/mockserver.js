sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	var _sAppModulePath = "sap/ui/demo/nav/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	return {

		init: function () {
			var sManifestUrl = sap.ui.require.toUrl(_sAppModulePath + "manifest.json"),
				sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesModulePath),
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oMainDataSource = oManifest["sap.app"].dataSources.employeeRemote,
				sMetadataUrl = sap.ui.require.toUrl(_sAppModulePath + oMainDataSource.settings.localUri);

			// create
			var oMockServer = new MockServer({
				rootUri: oMainDataSource.uri
			});

			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 1000
			});

			// simulate
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl : sJsonFilesUrl
			});

			// start
			oMockServer.start();
		}
	};

});