sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
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

	var tokens = {
		data: [
			{
				"Token": "Token2340"
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
				path: /.*/,
				response: function (oXhr, sQuery) {

					var requestHeaders = oXhr.requestHeaders;
					var headers = {

					};
					var respondStatus = 200;

					if (requestHeaders["X-CSRF-Token"]) {
						headers["X-CSRF-Token"] = requestHeaders["X-CSRF-Token"];
					}

					if (oXhr.url.indexOf("ExpiringToken") !== -1) {
						if (!this.firstTime) {
							this.firstTime = true;
						} else {
							this.firstTime = false;
							respondStatus = 403;

							headers["X-CSRF-Token"] = "required";
						}
					}

					oXhr.respondJSON(respondStatus, headers, activities);
				}
			});

			aRequests.push({
				method: "POST",
				path: /.*/,
				response: function (oXhr, sQuery) {
					if (oXhr.url.indexOf("Tokens") > -1) {
						oXhr.respondJSON(200, null, tokens);
						return;
					}

					var requestHeaders = oXhr.requestHeaders;
					var headers = {

					};
					var respondStatus = 200;

					if (requestHeaders["X-CSRF-Token"]) {
						headers["X-CSRF-Token"] = requestHeaders["X-CSRF-Token"];
					}

					if (oXhr.url.indexOf("ExpiringToken") !== -1) {
						if (!this.firstTime) {
							this.firstTime = true;
						} else {
							this.firstTime = false;
							respondStatus = 403;

							headers["X-CSRF-Token"] = "required";
						}
					}

					oXhr.respondJSON(respondStatus, headers, activities);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /.*/,
				response: function (oXhr, sQuery) {

					var requestHeaders = oXhr.requestHeaders;
					var sXCSRFToken = "";
					var headers = {

					};

					if (requestHeaders["X-CSRF-Token"] === "Fetch") {
						sXCSRFToken = "mynewToken";
					} else if (requestHeaders["X-CSRF-Token"]) {
						sXCSRFToken = requestHeaders["X-CSRF-Token"];
					}

					if (sXCSRFToken) {
						headers["X-CSRF-Token"] = sXCSRFToken;
					}

					oXhr.respond(200, headers);
				}
			});

			oMockServer.setRequests(aRequests);
			oMockServer.start();

			return Promise.resolve();
		}
	};
});