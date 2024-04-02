sap.ui.define([
	"sap/ui/core/util/MockServer",
	"./csrfTokens/Storage"
], function (MockServer, CSRFTokensStorage) {
	"use strict";

	var activities = {
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
		]
	};

	return {
		init: function () {
			// create
			var oMockServer = new MockServer({
				rootUri: "/getData"
			});

			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 500
			});

			var aRequests = oMockServer.getRequests();

			aRequests.push({
				method: "GET",
				path: /.*Activities/,
				response: function (oXhr, sQuery) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};
					var respondStatus = 200;

					if (!CSRFTokensStorage.isValid(requestHeaders.get("X-CSRF-Token"))) {
						respondStatus = 403;
						responseHeaders["X-CSRF-Token"] = "required";
					}

					oXhr.respondJSON(respondStatus, responseHeaders, activities);
				}
			});

			aRequests.push({
				method: "POST",
				path: /.*Activities/,
				response: function (oXhr, sQuery) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};
					var respondStatus = 200;

					if (!CSRFTokensStorage.isValid(requestHeaders.get("X-CSRF-Token")) && !CSRFTokensStorage.isValid(oXhr.requestBody.get("X-CSRF-Token"))) {
						respondStatus = 403;
						responseHeaders["X-CSRF-Token"] = "required";
					}

					oXhr.respondJSON(respondStatus, responseHeaders, activities);
				}
			});

			oMockServer.setRequests(aRequests);
			oMockServer.start();

			return Promise.resolve();
		}
	};
});