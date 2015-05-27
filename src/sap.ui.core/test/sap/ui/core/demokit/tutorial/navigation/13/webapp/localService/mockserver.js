sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	var _sAppModulePath = "sap/ui/demo/nav/manifest";

	return {

		init: function () {
			var sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath, ".json"),
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oMainDataSource = oManifest["sap.app"].dataSources.employeeRemote,
				sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml");

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
			var sPath = jQuery.sap.getModulePath("sap.ui.demo.nav.test.service");
			oMockServer.simulate(sMetadataUrl, sPath);

			// start
			oMockServer.start();
		}
	};

});
