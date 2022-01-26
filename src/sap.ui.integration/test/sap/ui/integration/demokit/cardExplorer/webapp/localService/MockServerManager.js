sap.ui.define([
	"./SEPMRA_PROD_MAN/mockServer",
	"./graphql/mockServer",
	"./activities/mockServer",
	"./csrf/mockServer",
	"./products/mockServer",
	"./user/mockServer",
	"sap/ui/core/util/MockServer"
], function (
	SEPMRA_PROD_MAN_mockServer,
	graphql_mockServer,
	timeline_mockServer,
	csrf_mockServer,
	products_mockServer,
	user_mockSever,
	MockServer
) {
	"use strict";

	var MockServerManager = {};

	MockServerManager._aMockServers = [
		SEPMRA_PROD_MAN_mockServer,
		graphql_mockServer,
		timeline_mockServer,
		csrf_mockServer,
		products_mockServer,
		user_mockSever
	];

	MockServerManager.initAll = function (bSampleUsesMockServer) {
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: 600
		});

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

		MockServerManager._aMockServers.forEach(function (oMockServer) {
			oMockServer.destroy();
		});

		MockServer.destroyAll(); // restore sinon fake server
		MockServerManager._bMockServersCreated = false;
	};

	return MockServerManager;
});