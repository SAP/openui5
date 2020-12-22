/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/util/DataProvider",
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
	 * @extends sap.ui.integration.util.DataProvider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.65
	 * @alias sap.ui.integration.util.RequestDataProvider
	 */
	var RequestDataProvider = DataProvider.extend("sap.ui.integration.util.RequestDataProvider", {

		metadata: {

			/**
			 * Defines whether it's possible to later provide a dataType property to the Request Configuration object, which declares the expected Content-Type of the response.
			 * @since 1.81
			 */
			properties: {
				allowCustomDataType: { type: "boolean", defaultValue: false }
			}

		}

	});

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

			if (!oRequestConfig || !oRequestConfig.url) {
				Log.error(sMessage);
				reject(sMessage);
				return;
			}

			if (!this.getAllowCustomDataType() && oRequestConfig.dataType) {
				Log.error("To specify dataType property in the Request Configuration, first set allowCustomDataType to 'true'.");
			}

			var vData = oRequestConfig.parameters,
				oCard = this.getCardInstance(),
				sUrl = oRequestConfig.url;

			if (oCard && !sUrl.startsWith("/")) {
				sUrl = oCard.getRuntimeUrl(oRequestConfig.url);
			}

			// if not 'application/x-www-form-urlencoded', data has to be serialized manually
			if (this._hasHeader(oRequestConfig, "Content-Type", "application/json")) {
				vData = JSON.stringify(oRequestConfig.parameters);
			}

			var oRequest = {
				"mode": oRequestConfig.mode || "cors",
				"url": sUrl,
				"method": (oRequestConfig.method && oRequestConfig.method.toUpperCase()) || "GET",
				"dataType": (this.getAllowCustomDataType() && oRequestConfig.dataType) || "json",
				"data": vData,
				"headers": oRequestConfig.headers,
				"timeout": 15000,
				"xhrFields": {
					"withCredentials": !!oRequestConfig.withCredentials
				}
			};

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

	/**
	 * Checks if header with given value is part of the request.
	 * Header name is case-insensitive, but the value is case-sensitive (RFC7230 https://tools.ietf.org/html/rfc7230#section-3.2).
	 *
	 * @private
	 * @param {*} oRequestConfig The request config.
	 * @param {*} sHeader Searched header. For example "Content-Type"
	 * @param {*} sValue Checked value. For example "application/json"
	 * @returns {boolean} Whether a header with given value is present.
	 */
	RequestDataProvider.prototype._hasHeader = function (oRequestConfig, sHeader, sValue) {
		if (!oRequestConfig.headers) {
			return false;
		}

		for (var sKey in oRequestConfig.headers) {
			if (sKey.toLowerCase() === sHeader.toLowerCase() && oRequestConfig.headers[sKey] === sValue) {
				return true;
			}
		}

		return false;
	};

	return RequestDataProvider;
});
