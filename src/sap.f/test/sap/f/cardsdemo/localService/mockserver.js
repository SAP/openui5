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

	let iCurrentExpiringTokenValue = 0;
	let iExpectedExpiringTokenValue = 1;
	const sActivitiesToken = "mynewToken";

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

					const acceptedTokens = [
						sActivitiesToken,
						"Token2340",
						"mynewTokenADD",
						"HostTokenValue"
					];

					if (!acceptedTokens.includes(requestHeaders.get("X-CSRF-Token"))) {
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

					const acceptedTokens = [
						sActivitiesToken,
						"Token2340",
						"mynewTokenADD",
						"HostTokenValue"
					];

					// TODO: check if it is possible to have the token in the body
					if (!acceptedTokens.includes(requestHeaders.get("X-CSRF-Token")) && !acceptedTokens.includes(oXhr.requestBody.get("X-CSRF-Token"))) {
						respondStatus = 403;
						responseHeaders["X-CSRF-Token"] = "required";
					}

					oXhr.respondJSON(respondStatus, responseHeaders, activities);
				}
			});

			aRequests.push({
				method: "GET",
				path: /.*ActivitiesExpiringToken/,
				response: function (oXhr, sQuery) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = { };
					var respondStatus = 200;

					if (requestHeaders.get("X-CSRF-Token") !== `ExpiringToken${iExpectedExpiringTokenValue}`) {
						respondStatus = 403;
						responseHeaders["X-CSRF-Token"] = "required";
					} else {
						iExpectedExpiringTokenValue++;
					}

					oXhr.respondJSON(respondStatus, responseHeaders, activities);
				}
			});

			aRequests.push({
				method: "POST",
				path: /\/TokensPath/,
				response: function (oXhr, sQuery) {
					oXhr.respondJSON(200, null, tokens);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /\/ExpiringToken/,
				response: function (oXhr) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};

					iCurrentExpiringTokenValue++;

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = `ExpiringToken${iCurrentExpiringTokenValue}`;
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			/**
			 * @deprecated As of version 1.121.0
			 */
			aRequests.push({
				method: "HEAD",
				path: /\/ExpiringTokenDeprecated/,
				response: function (oXhr) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};

					iCurrentExpiringTokenValue++;

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = `ExpiringToken${iCurrentExpiringTokenValue}`;
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /\/ExpiredToken/,
				response: function (oXhr) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = "ExpiredToken";
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /\/Tokens/,
				response: function (oXhr) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = sActivitiesToken;
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			oMockServer.setRequests(aRequests);
			oMockServer.start();

			return Promise.resolve();
		}
	};
});