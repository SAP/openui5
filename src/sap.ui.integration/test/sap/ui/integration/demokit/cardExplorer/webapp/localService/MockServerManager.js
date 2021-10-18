sap.ui.define([
	"./SEPMRA_PROD_MAN/mockServer",
	"./graphql/mockServer",
	"./activities/mockServer",
	"sap/ui/core/util/MockServer"
], function (
	SEPMRA_PROD_MAN_mockServer,
	graphql_mockServer,
	timeline_mockServer,
	MockServer
) {
	"use strict";

	// configure all mock servers with default delay of 1s
	MockServer.config({
		autoRespond: true,
		autoRespondAfter: 1000
	});

	var MockServerManager = {};

	MockServerManager._aMockServers = [
		SEPMRA_PROD_MAN_mockServer,
		graphql_mockServer,
		timeline_mockServer
	];

	MockServerManager.initAll = function (bSampleUsesMockServer) {
		var pAwait = Promise.resolve();

		// init mock server only on demand
		if (bSampleUsesMockServer) {
			pAwait = Promise.all(
				MockServerManager._aMockServers.map(function (oMockServer) {
					return oMockServer.init();
				})
			);
			MockServerManager._bMockServersCreated = true;
		} else {
			// Stop all mock servers on samples which don't need it. Else all requests go through sinon.
			MockServerManager.destroyAll();
		}

		return pAwait;
	};

	MockServerManager.destroyAll = function () {
		if (!MockServerManager._bMockServersCreated) {
			return;
		}

		MockServerManager._aMockServers.map(function (oMockServer) {
			return oMockServer.destroy();
		});

		MockServer.destroyAll(); // restore sinon fake server
		MockServerManager._bMockServersCreated = false;
	};

	return MockServerManager;
});