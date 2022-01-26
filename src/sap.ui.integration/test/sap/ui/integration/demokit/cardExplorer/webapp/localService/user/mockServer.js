sap.ui.define([
	"../products/ProductsDatabase",
	"sap/ui/core/util/MockServer"
], function (ProductsDatabase, MockServer) {
	"use strict";

	var oMockServer;

	function initMockServer () {
		oMockServer = new MockServer({
			rootUri: "/user"
		});

		var aRequests = oMockServer.getRequests();

		aRequests.push({
			method: "POST",
			path: "\/(.+)\/favorites",
			response: function (oXhr, sUserId) {
				var body = JSON.parse(oXhr.requestBody);
				var sProductId = body.productId;

				if (ProductsDatabase.addToFavorites(sProductId)) {
					oXhr.respond(200, null, sProductId + " added to favorites.");
				} else {
					oXhr.respond(500, null, "Couldn't add " + sProductId + " to favorites. Server error ocurred.");
				}

			}
		});

		oMockServer.setRequests(aRequests);
		oMockServer.start();
	}

	var oMockServerInterface = {
		_pInit: null,

		init: function () {
			this._pInit = this._pInit || Promise.resolve()
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
