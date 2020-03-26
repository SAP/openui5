/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/cards/DataProvider",
	"jquery.sap.global",
	"sap/base/Log"
], function (DataProvider, jQuery, Log) {
	"use strict";

	var aModes = ["no-cors", "same-origin", "cors"];
	var aMethods = ["GET", "POST"];

	/**
	 * Constructor for a new <code>RequestDataProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.cards.DataProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.65
	 * @alias sap.ui.integration.cards.RequestDataProvider
	 */
	var RequestDataProvider = DataProvider.extend("sap.ui.integration.cards.RequestDataProvider");

	/**
	 * @override
	 * @returns {Promise} A promise resolved when the data is available and rejected in case of an error.
	 */
	RequestDataProvider.prototype.getData = function () {
		var oRequestConfig = this.getSettings().request;

		if (this._oDestinations) {
			return this._oDestinations.process(oRequestConfig)
				.then(this._fetch.bind(this));
		}

		return this._fetch(oRequestConfig);
	};

	RequestDataProvider.prototype._isValidRequest = function (oRequest) {

		if (!oRequest) {
			return false;
		}

		if (aModes.indexOf(oRequest.mode) === -1) {
			return false;
		}

		if (aMethods.indexOf(oRequest.method) === -1) {
			return false;
		}

		if (typeof oRequest.url !== "string") {
			return false;
		}

		return true;
	};

	RequestDataProvider.prototype._fetch = function (oRequestConfig) {
		var sMessage = "Invalid request";

		return new Promise(function (resolve, reject) {

			if (!oRequestConfig) {
				Log.error(sMessage);
				reject(sMessage);
				return;
			}

			var oRequest = {
				"mode": oRequestConfig.mode || "cors",
				"url": oRequestConfig.url,
				"method": (oRequestConfig.method && oRequestConfig.method.toUpperCase()) || "GET",
				"data": oRequestConfig.parameters,
				"headers": oRequestConfig.headers,
				"timeout": 15000,
				"xhrFields": {
					"withCredentials": !!oRequestConfig.withCredentials
				}
			};

			if (oRequest.method === "GET") {
				oRequest.dataType = "json";
			}

			if (this._isValidRequest(oRequest)) {
				jQuery.ajax(oRequest).done(function (oData) {
						resolve(oData);

				}).fail(function (jqXHR, sTextStatus, sError) {
					reject(sError);
				});
			} else {
				Log.error(sMessage);
				reject(sMessage);
			}
		}.bind(this));
	};

	return RequestDataProvider;
});
