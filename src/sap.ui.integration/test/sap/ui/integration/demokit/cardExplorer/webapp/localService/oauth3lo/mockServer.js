sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], function (MockServer, Log) {
	"use strict";

	let oMockServer;

	const aData = {
		"value": [
			{
				"ProductID": 1,
				"ProductName": "Product 1",
				"UnitsInStock": 39,
				"Discontinued": false
			},
			{
				"ProductID": 2,
				"ProductName": "Product 2",
				"UnitsInStock": 17,
				"Discontinued": false
			},
			{
				"ProductID": 3,
				"ProductName": "Product 3",
				"UnitsInStock": 13,
				"Discontinued": false
			},
			{
				"ProductID": 4,
				"ProductName": "Product 4",
				"UnitsInStock": 53,
				"Discontinued": false
			},
			{
				"ProductID": 5,
				"ProductName": "Product 5",
				"UnitsInStock": 0,
				"Discontinued": true
			}
		]
	};

	return {
		init: function () {

			// avoid reinitialization of mock server
			if (oMockServer) {
				return Promise.resolve();
			}

			const oChannel = new BroadcastChannel("sap-ui5-cardExplorer-simulateOAuth3LO");

			oChannel.addEventListener("message", (oMessage) => {
				// this simulates an update on the server, for which a consent was given
				if (oMessage.data.id === "simulate-consent-given") {
					this._bConsentGiven = true;
				}
			});

			// create
			oMockServer = new MockServer({
				rootUri: "/getDataWithOAuth3LO"
			});

			const aRequests = oMockServer.getRequests();

			aRequests.push({
				method: "GET",
				path: /.*?(\?.*)?/,
				response: this._onRequest.bind(this)
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
		},

		_onRequest: function (oXhr, sQuery) {
			if (!this._bConsentGiven) {
				Log.info("OAuth 3LO request for resources. Consent not given yet.", "sap.ui.integration.test.localService.oauth3lo.mockServer");

				const mResponseHeaders = this._create3LOHeaders();
				oXhr.respondJSON(502, mResponseHeaders, {});

				return;
			}

			Log.info("OAuth 3LO request for resources. Consent given.", "sap.ui.integration.test.localService.oauth3lo.mockServer");
			oXhr.respondJSON(200, {}, aData);
		},

		_create3LOHeaders: function () {
			let sConsentUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/oauth3lo/consentApp/index.html");
			let sHostAppUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/oauth3lo/hostApp/index.html");
			let sImageUrl = sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/oauth3lo/hostApp/images/PrivateBlue.svg");

			sConsentUrl = new URL(sConsentUrl, window.location.href).href;
			sHostAppUrl = new URL(sHostAppUrl, window.location.href).href;
			sImageUrl = new URL(sImageUrl, window.location.href).href;

			sConsentUrl += "?redirect="	+ encodeURIComponent(sHostAppUrl);

			const oHeader =	{
				"status": "ok",
				"popupWindow": {
					"height": "500",
					"width": "600"
				},
				"consent": {
					"id": "Q1uO53KEQXO14-ae03lnd",
					"url": sConsentUrl
				},
				"polling": {
					"frequency": 3000,
					"maximum": 600000
				},
				"buttonText": "Authorize and Connect",
				"title": "Authorization Required",
				"description": "This application requires access to data from a third-party provider.",
				"imageSrc": sImageUrl
			};

			return {
				"SAP-3LO-FLOW": window.btoa(JSON.stringify(oHeader))
			};
		}
	};
});