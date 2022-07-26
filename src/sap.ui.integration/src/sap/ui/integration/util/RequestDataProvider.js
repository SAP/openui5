/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/util/DataProvider",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/ui/model/odata/v4/ODataUtils",
	"sap/ui/core/Core"
], function (DataProvider, jQuery, Log, ODataUtils, Core) {
	"use strict";
	/*global Response*/

	/**
	 * @const List of HTTP response status codes for which the request can be retried.
	 */
	var RETRY_STATUS_CODES = [429, 503];

	var aModes = ["no-cors", "same-origin", "cors"];
	var aMethods = ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"];

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
	 * @ui5-restricted sap.ui.integration, shell-toolkit
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
			},

			associations : {
				/**
				 * The host which is used for communication with the caching service worker.
				 */
				host: {
					type : "sap.ui.integration.Host",
					multiple: false
				}
			}

		}

	});

	RequestDataProvider.prototype.destroy = function () {
		if (this._iRetryAfterTimeout) {
			clearTimeout(this._iRetryAfterTimeout);
		}

		DataProvider.prototype.destroy.apply(this, arguments);
	};

	RequestDataProvider.prototype.getLastJQXHR = function () {
		return this._lastJQXHR;
	};

	/**
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.integration, shell-toolkit
	 * @returns {Promise} A promise resolved when the data is available and rejected in case of an error.
	 */
	RequestDataProvider.prototype.getData = function () {
		var oRequestConfig = this.getSettings().request,
			pRequestChain = Promise.resolve(oRequestConfig);

		if (this._oDestinations) {
			pRequestChain = this._oDestinations.process(oRequestConfig);
		}

		if (this._oCsrfTokenHandler) {
			pRequestChain = pRequestChain.then(function (oRequest) {
				return this._oCsrfTokenHandler.resolveToken(oRequest);
			}.bind(this));
		}

		pRequestChain = pRequestChain.then(this._fetch.bind(this));

		if (this._oCsrfTokenHandler) {
			pRequestChain = pRequestChain.catch(this._handleExpiredToken.bind(this));
		}

		return pRequestChain;
	};

	RequestDataProvider.prototype._handleExpiredToken = function (oError) {
		if (this._oCsrfTokenHandler.isExpiredToken(this.getLastJQXHR())) {
			// csrf token has expired, reset the token and retry this whole request
			this._oCsrfTokenHandler.resetTokenByRequest(this.getSettings().request);

			return this.getData().catch(function (oError) {
				throw oError;
			});
		}

		throw oError;
	};

	RequestDataProvider.prototype._fetch = function (oRequestConfig) {
		var sMessage = "Invalid request",
			oSettings = this._oSettings;

		if (!oRequestConfig || !oRequestConfig.url) {
			Log.error(sMessage);
			return Promise.reject(sMessage);
		}

		if (!this.getAllowCustomDataType() && oRequestConfig.dataType) {
			Log.error("To specify dataType property in the Request Configuration, first set allowCustomDataType to 'true'.");
		}

		var vData = oRequestConfig.parameters,
			sUrl = oRequestConfig.url,
			sDataType = (this.getAllowCustomDataType() && oRequestConfig.dataType) || "json",
			mHeaders = oRequestConfig.headers || {},
			mBatchRequests = oRequestConfig.batch,
			oBatchSerialized,
			oRequest;

		if ( !sUrl.startsWith("/")) {
			sUrl = this._getRuntimeUrl(oRequestConfig.url);
		}

		// if not 'application/x-www-form-urlencoded', data has to be serialized manually
		if (this._hasHeader(oRequestConfig, "Content-Type", "application/json")) {
			vData = JSON.stringify(oRequestConfig.parameters);
		}

		if (mBatchRequests) {
			oBatchSerialized = ODataUtils.serializeBatchRequest(Object.values(mBatchRequests));
			sDataType = "text";
			vData = oBatchSerialized.body;
			mHeaders = Object.assign({}, mHeaders, oBatchSerialized.headers);
		}

		mHeaders = this._prepareHeaders(mHeaders, oSettings);

		oRequest = {
			"mode": oRequestConfig.mode || "cors",
			"url": sUrl,
			"method": (oRequestConfig.method && oRequestConfig.method.toUpperCase()) || "GET",
			"dataType": sDataType,
			"data": vData,
			"headers": mHeaders,
			"timeout": 15000,
			"xhrFields": {
				"withCredentials": !!oRequestConfig.withCredentials
			}
		};

		if (!vData) {
			delete oRequest.data;
		}

		if (!this._isValidRequest(oRequest)) {
			Log.error(sMessage);
			return Promise.reject(sMessage);
		}

		return this._request(oRequest)
			.then(function (vResult) {
				var vData = vResult[0];

				if (mBatchRequests) {
					return this._deserializeBatchResponse(mBatchRequests, vData);
				}

				return vData;
			}.bind(this));
	};

	/**
	 * Sends a request with jQuery.ajax(). Wrapped in a Promise.
	 * @param {Object} oRequest The request to be sent with jQuery.ajax().
	 * @param {boolean} bNoRetry Set to true if this request should not be retried when failed.
	 * @returns {Promise} A Promise which is resolved when request is done and rejected when it fails.
	 */
	RequestDataProvider.prototype._request = function (oRequest, bNoRetry) {
		return new Promise(function (resolve, reject) {
			jQuery.ajax(oRequest).done(
				function (vData, sTextStatus, jqXHR) {
					if (this.bIsDestroyed) {
						reject("RequestDataProvider is already destroyed before the response is received.");
						return;
					}

					this._lastJQXHR = jqXHR;

					resolve([vData, jqXHR]);
				}.bind(this)
			).fail(
				function (jqXHR, sTextStatus, sError) {
					var aError = [sError, jqXHR];

					if (this.bIsDestroyed) {
						reject("RequestDataProvider is already destroyed while error in the response occurred.");
						return;
					}

					this._lastJQXHR = jqXHR;

					if (bNoRetry) {
						reject(aError);
						return;
					}

					this._retryRequest(aError, oRequest).then(resolve, reject);
				}.bind(this));
		}.bind(this));
	};

	/**
	 * Retries to send the given request if response status code allows it
	 * and if a retry-after value is specified in response header or in the request settings.
	 * @param {Array} aError The error from the previous failed request.
	 * @param {Object} oRequest The request to be sent.
	 * @returns {Promise} A Promise which is fulfilled if retry is successful and rejected otherwise.
	 */
	RequestDataProvider.prototype._retryRequest = function (aError, oRequest) {
		var jqXHR = aError[1],
			iRetryAfter = this._getRetryAfter(jqXHR);

		if (!RETRY_STATUS_CODES.includes(jqXHR.status)) {
			// Request should not be retried.
			return Promise.reject(aError);
		}

		if (!iRetryAfter) {
			Log.warning("Request could be retried, but Retry-After header or configuration parameter retryAfter are missing.");
			return Promise.reject(aError);
		}

		if (this._iRetryAfterTimeout) {
			return Promise.reject("The retry was already scheduled.");
		}

		return new Promise(function (resolve, reject) {
			this._iRetryAfterTimeout = setTimeout(function () {
				this._request(oRequest, true).then(resolve, reject);
				this._iRetryAfterTimeout = null;
			}.bind(this), iRetryAfter * 1000);
		}.bind(this));
	};

	/**
	 * Reads retry-after value from response headers or from settings.
	 * @param {Object} jqXHR The jQuery XHR response.
	 * @returns {int} The number of seconds after which to retry the request.
	 */
	RequestDataProvider.prototype._getRetryAfter = function (jqXHR) {
		var oRequestConfig = this.getSettings().request,
			vRetryAfter = jqXHR.getResponseHeader("Retry-After") || oRequestConfig.retryAfter;

		if (!vRetryAfter) {
			return 0;
		}

		if (Number.isInteger(vRetryAfter)) {
			return vRetryAfter;
		}

		if (!vRetryAfter.match(/^\d+$/)) {
			Log.error("Only number of seconds is supported as value of retry-after. Given '" + vRetryAfter + "'.");
			return 0;
		}

		return parseInt(vRetryAfter);
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

	/**
	 * Deserializes the result of a batch (multipart/mixed) request.
	 * @private
	 * @param {map} mBatchRequests The requests which were send in batch. Order in the response must match.
	 * @param {Object} sResponseBody The response to be deserialized.
	 * @returns {Object} The deserialized response. Each object in the result will have a key matching the one in the request.
	 */
	RequestDataProvider.prototype._deserializeBatchResponse = function (mBatchRequests, sResponseBody) {
		return new Promise(function(resolve, reject) {
			var sContentType = this.getLastJQXHR().getResponseHeader("Content-Type"),
				aBatchResponses = ODataUtils.deserializeBatchResponse(sContentType, sResponseBody, false),
				aKeys = Object.keys(mBatchRequests),
				mResult = {};

			aKeys.forEach(function(sKey, iInd) {
				var mResponse = aBatchResponses[iInd],
					oResponse;

				if (!mResponse) {
					reject("Batch responses do not match the batch requests.");
					return;
				}

				oResponse = new Response(mResponse.responseText, mResponse);

				if (!oResponse.ok) {
					reject("One of batch requests fails with '" + oResponse.status + " " + oResponse.statusText + "'");
					return;
				}

				mResult[sKey] = mResponse.responseText ? JSON.parse(mResponse.responseText) : {};
			});

			resolve(mResult);
		}.bind(this));
	};

	/**
	 * Override if modification to the headers is needed.
	 * Allows the host to modify the headers.
	 * @param {map} mHeaders The current headers
	 * @param {Object} oSettings The request settings
	 * @returns {map} The modified headers
	 */
	RequestDataProvider.prototype._prepareHeaders = function (mHeaders, oSettings) {
		var oCard = Core.byId(this.getCard()),
			oHost = Core.byId(this.getHost());

		if (oHost && oHost.modifyRequestHeaders) {
			return oHost.modifyRequestHeaders(Object.assign({}, mHeaders), oSettings, oCard);
		}

		return mHeaders;
	};

	/**
	 * @override
	 */
	RequestDataProvider.prototype.getDetails = function () {
		return "Load data from URL: " + this.getSettings().request.url;
	};

	return RequestDataProvider;
});
