sap.ui.define([
	"./ProductsDatabase",
	"sap/ui/core/util/MockServer"
], function (ProductsDatabase, MockServer) {
	"use strict";

	var oMockServer;

	function initMockServer () {
		oMockServer = new MockServer({
			rootUri: "/products"
		});

		var aRequests = oMockServer.getRequests();

		aRequests.push({
			method: "GET",
			path: ".*",
			response: function (oXhr, sQuery) {
				oXhr.respondJSON(200, null, ProductsDatabase.getData());
			}
		});

		aRequests.push({
			method: "DELETE",
			path: "\/(.+)",
			response: function (oXhr, sProductId) {
				if (ProductsDatabase.remove(sProductId)) {
					oXhr.respond(200, null, "Successfully removed " + sProductId);
				} else {
					oXhr.respond(404, null, "Couldn't remove " + sProductId + ". Product not found.");
				}
			}
		});

		oMockServer.setRequests(aRequests);
		oMockServer.start();
	}

	var oMockServerInterface = {
		_pInit: null,

		init: function () {
			ProductsDatabase.resetData();

			this._pInit = this._pInit || ProductsDatabase.init()
				.then(initMockServer);

			return this._pInit;
		},

		destroy: function () {
			if (!oMockServer) {
				return;
			}

			oMockServer.destroy();
			oMockServer = null;
			this._pInit = null;
		}
	};

	return oMockServerInterface;
});
