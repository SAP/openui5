sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	var oMockServer;

	var aProductas = {
		data: [
			{
				"Name": "Product 1",
				"Weight": "4000",
				"WeightUnit": "kg"
			},
			{
				"Name": "Product 2",
				"Weight": "5000",
				"WeightUnit": "kg"
			},
			{
				"Name": "Product 3",
				"Weight": "2000",
				"WeightUnit": "kg"
			},
			{
				"Name": "Product 4",
				"Weight": "6000",
				"WeightUnit": "kg"
			}
		]
	};

	var sTokenValue = "Token2340";

	return {
		init: function () {
			// avoid reinitialization of mock server
			if (oMockServer) {
				return Promise.resolve();
			}

			// create
			oMockServer = new MockServer({
				rootUri: "/getDataWithCSRF"
			});

			var aRequests = oMockServer.getRequests();

			aRequests.push({
				method: "GET",
				path: /.*/,
				response: function (oXhr, sQuery) {
					var requestHeaders = oXhr.requestHeaders;
					var respondStatus = 200;

					if (requestHeaders["X-CSRF-Token"] !== sTokenValue) {
						respondStatus = 403;
					}

					oXhr.respondJSON(respondStatus, {}, aProductas);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /.*/,
				response: function (oXhr, sQuery) {
					var requestHeaders = oXhr.requestHeaders;
					var headers = {};

					if (requestHeaders["X-CSRF-Token"] === "Fetch") {
						headers["X-CSRF-Token"] = sTokenValue;
					}

					oXhr.respond(200, headers);
				}
			});

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
});