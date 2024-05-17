sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
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
			// create
			oMockServer = new MockServer({
				rootUri: "/getDataWithOAuth3LO"
			});

			// this._listenForConsent();

			const aRequests = oMockServer.getRequests();

			aRequests.push({
				method: "GET",
				path: /.*?(\?.*)?/,
				response: this._onRequest.bind(this)
			});

			oMockServer.setRequests(aRequests);
			oMockServer.start();

			this.consentGiven = false;
			this.simulateError = false;

			return oMockServer;
		},

		_onRequest: function (oXhr, sQuery) {
			if (this.simulateError) {
				const mResponseHeaders = this._create3LOHeadersWithError();
				oXhr.respondJSON(502, mResponseHeaders, {});
				return;
			}

			if (!this.consentGiven) {
				const mResponseHeaders = this._create3LOHeaders();
				oXhr.respondJSON(502, mResponseHeaders, {});
				return;
			}

			oXhr.respondJSON(200, {}, aData);
		},

		_create3LOHeaders: function () {
			const oHeader =	{
				"status": "ok",
				"popupWindow": {
					"height": "500",
					"width": "400"
				},
				"consent": {
					"id": "Q1uO53KEQXO14-ae03lnd",
					"url": "/consent"
				},
				"polling": {
					"frequency": 3000,
					"maximum": 600000
				},
				"buttonText": "Authorize and Connect",
				"title": "Authorization Required",
				"description": "This application requires access to data from a third-party provider.",
				"imageSrc": "test.svg"
			};

			return {
				"SAP-3LO-FLOW": window.btoa(JSON.stringify(oHeader))
			};
		},

		_create3LOHeadersWithError: function () {
			const oHeader =	{
				"status": "error",
				"message": "An error occurred"
			};

			return {
				"SAP-3LO-FLOW": window.btoa(JSON.stringify(oHeader))
			};
		}
	};
});