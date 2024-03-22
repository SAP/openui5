sap.ui.define([
	"sap/ui/core/util/MockServer",
	"./Storage"
], (MockServer, CSRFTokensStorage) => {
	"use strict";

	return {
		init() {
			// create
			const oMockServer = new MockServer({
				rootUri: "/csrfTokens/"
			});
			const aRequests = oMockServer.getRequests();

			aRequests.push({
				method: "HEAD",
				path: /generateToken/,
				response: function (oXhr) {
					const requestHeaders = new Headers(oXhr.requestHeaders);
					const responseHeaders = {};

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = CSRFTokensStorage.generateToken();
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /expiredToken/,
				response: function (oXhr) {
					const requestHeaders = new Headers(oXhr.requestHeaders);
					const responseHeaders = {};

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = CSRFTokensStorage.getExpiredToken();
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /token/,
				response: function (oXhr) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = "mynewToken";
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			aRequests.push({
				method: "HEAD",
				path: /expiringToken/,
				response: function (oXhr) {
					var requestHeaders = new Headers(oXhr.requestHeaders);
					var responseHeaders = {};

					if (requestHeaders.get("X-CSRF-Token") === "Fetch") {
						responseHeaders["X-CSRF-Token"] = CSRFTokensStorage.getSingleUseToken();
					}

					oXhr.respond(200, responseHeaders);
				}
			});

			aRequests.push({
				method: "POST",
				path: /tokenInBody/,
				response: function (oXhr, sQuery) {
					oXhr.respondJSON(200, null, {
						data: [{
							"Token": "Token2340"
						}]
					});
				}
			});

			oMockServer.setRequests(aRequests);
			oMockServer.start();

			return Promise.resolve();
		}
	};
});