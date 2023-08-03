sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	var oMockServer;
	var aProducts = {
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
			},
			{
				"Name": "Product 5",
				"Weight": "3000",
				"WeightUnit": "kg"
			},
			{
				"Name": "Product 7",
				"Weight": "4000",
				"WeightUnit": "kg"
			},
			{
				"Name": "Product 8",
				"Weight": "2000",
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
				path: /.*?(\?.*)?/,
				response: function (oXhr, sQuery) {
					var oQueryParams = new URLSearchParams(sQuery);
					var iTop = oQueryParams.get("$top") || aProducts.length;
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var respondStatus = 200;

					if (requestHeaders.get("X-CSRF-Token") !== sTokenValue) {
						respondStatus = 403;
					}

					var oResponse = {
						data: aProducts.data.slice(0, iTop)
					};

					oXhr.respondJSON(respondStatus, {}, oResponse);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /.*/,
				response: function (oXhr) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var headers = {};

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
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