sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/MockServer"
], function(
	Log,
	MockServer
) {
	"use strict";

	return {
		/**
		 * Starts the MockServers for all OData data sources declared in the app's manifest.
		 *
		 * This must run before the Component is created: the OData models are declared in the
		 * manifest and therefore instantiated by the Component framework during construction
		 * (so sap.ui.fl can apply annotation changes via the modelCreatedHook). Their metadata
		 * requests go out immediately, so the MockServers have to be up beforehand.
		 *
		 * @returns {Promise} Resolves once all MockServers are started
		 */
		async init() {
			const sResourcePath = sap.ui.require.toUrl("sap/ui/rta/test");
			const iServerDelay = parseInt(new URLSearchParams(window.location.search).get("serverDelay"));
			const iAutoRespond = iServerDelay || 1000;

			const oResponse = await fetch(`${sResourcePath}/manifest.json`);
			const oManifest = await oResponse.json();
			const oDataSources = oManifest["sap.app"].dataSources;

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: iAutoRespond
			});

			for (const sProperty in oDataSources) {
				if (oDataSources.hasOwnProperty(sProperty)) {
					const oDataSource = oDataSources[sProperty];

					if (oDataSource.settings && oDataSource.settings.localUri) {
						if (typeof oDataSource.type === "undefined" || oDataSource.type === "OData") {
							const oMockServer = new MockServer({
								rootUri: oDataSource.uri
							});
							const sMetadataUrl = sResourcePath + oDataSource.settings.localUri;
							const sMockServerPath = sMetadataUrl.slice(0, sMetadataUrl.lastIndexOf("/") + 1);
							const aEntities = oDataSource.settings.aEntitySetsNames ? oDataSource.settings.aEntitySetsNames : [];
							oMockServer.simulate(sMetadataUrl, {
								sMockdataBaseUrl: sMockServerPath,
								bGenerateMissingMockData: true,
								aEntitySetsNames: aEntities
							});
							oMockServer.start();
							Log.info(`Running the app with mock data for ${sProperty}`);
						}
					} else {
						Log.error(`Running the app with mock data for ${sProperty}`);
					}
				}
			}
		}
	};
});
