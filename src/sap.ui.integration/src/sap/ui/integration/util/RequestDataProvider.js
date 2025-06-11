/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/integration/util/DataProvider",
	"sap/base/Log",
	"sap/ui/model/odata/v4/ODataUtils",
	"sap/base/util/fetch",
	"sap/base/util/deepClone",
	"sap/base/util/isPlainObject"
], function (
	Element,
	DataProvider,
	Log,
	ODataUtils,
	fetch,
	deepClone,
	isPlainObject
) {
	"use strict";

	/**
	 * @const List of HTTP response status codes for which the request can be retried.
	 */
	var RETRY_STATUS_CODES = [429, 503];

	var aModes = ["no-cors", "same-origin", "cors"];
	var aMethods = ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"];
	var mDataTypeHeaders = {
		"json": "application/json, */*",
		"xml": "application/xml, text/xml, */*"
	};

	function combineUrlAndParams(sUrl, oParameters) {
		// url query parameters
		var sParamsString = Object.entries(oParameters).map(function (oParam) {
			return encodeURIComponent(oParam[0]) + "=" + encodeURIComponent(oParam[1]);
		});

		return sUrl + (sUrl.indexOf("?") !== -1 ? "&" : "?") + sParamsString.join('&');
	}

	function isJsonResponse(oResponse) {
		var sContentType = oResponse.headers.get("Content-Type");

		if (!sContentType) {
			return false;
		}

		return sContentType.indexOf("application/json") !== -1;
	}

	function isXmlResponse(oResponse) {
		var sContentType = oResponse.headers.get("Content-Type");

		if (!sContentType) {
			return false;
		}

		return sContentType.indexOf("application/xml") !== -1 || sContentType.indexOf("text/xml") !== -1;
	}

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
			library: "sap.ui.integration",

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

	RequestDataProvider.prototype.init = function () {
		DataProvider.prototype.init.apply(this, arguments);

		this._retryDueExpiredToken = false;
	};

	RequestDataProvider.prototype.destroy = function () {
		if (this._iRetryAfterTimeout) {
			clearTimeout(this._iRetryAfterTimeout);
		}

		DataProvider.prototype.destroy.apply(this, arguments);
	};

	RequestDataProvider.prototype.getLastResponse = function () {
		return this._lastResponse;
	};

	/**
	 * @override
	 */
	RequestDataProvider.prototype.getData = function () {
		const oRequestConfig = this._getResolvedRequestConfiguration();
		let pRequestChain = Promise.resolve(oRequestConfig);

		if (this._oDestinations) {
			pRequestChain = this._oDestinations.process(oRequestConfig);
		}

		if (this._oCsrfTokenHandler) {
			pRequestChain = pRequestChain.then(this._oCsrfTokenHandler.replacePlaceholders.bind(this._oCsrfTokenHandler));
		}

		pRequestChain = pRequestChain.then(this._fetch.bind(this));

		if (this._oCsrfTokenHandler) {
			pRequestChain = pRequestChain.catch(this._handleExpiredToken.bind(this));
		}

		return pRequestChain;
	};

	/**
	 * @override
	 */
	RequestDataProvider.prototype.triggerDataUpdate = function () {
		this._retryDueExpiredToken = false;

		return DataProvider.prototype.triggerDataUpdate.apply(this, arguments);
	};

	/**
	 * @override
	 */
	RequestDataProvider.prototype.getResolvedConfiguration = function () {
		const oConfiguration = DataProvider.prototype.getResolvedConfiguration.apply(this, arguments);

		this._reviveFormData(oConfiguration);

		return oConfiguration;
	};

	RequestDataProvider.prototype._reviveFormData = function (oResolvedConfiguration) {
		const oConfiguration = this.getConfiguration();

		if (oConfiguration?.request?.parameters instanceof FormData) {
			oResolvedConfiguration.request.parameters = oConfiguration.request.parameters;
		}
	};

	RequestDataProvider.prototype._handleExpiredToken = function (oError) {
		if (!this._oCsrfTokenHandler.isExpiredToken(this.getLastResponse())) {
			throw oError;
		}

		// csrf token has expired, reset the token and retry this whole request
		this._oCsrfTokenHandler.markExpiredTokenByRequest(this.getConfiguration().request);

		if (this._retryDueExpiredToken) {
			this._retryDueExpiredToken = false;
			throw oError;
		}

		this._retryDueExpiredToken = true;
		this._bActive = false; // prevents another triggerDataUpdate()

		return this._waitDependencies().then(this.getData.bind(this));
	};

	RequestDataProvider.prototype._fetch = function (oRequestConfig) {
		var sMessage = "Invalid request";

		if (!oRequestConfig || !oRequestConfig.url) {
			Log.error(sMessage);
			return Promise.reject(sMessage);
		}

		if (!this.getAllowCustomDataType() && oRequestConfig.dataType) {
			Log.error("To specify dataType property in the Request Configuration, first set allowCustomDataType to 'true'.");
		}

		var sUrl = oRequestConfig.url,
			oParameters = oRequestConfig.parameters,
			sDataType = (this.getAllowCustomDataType() && oRequestConfig.dataType) || "json",
			mHeaders = oRequestConfig.headers || {},
			mBatchRequests = oRequestConfig.batch,
			vBody,
			sMethod = oRequestConfig.method && oRequestConfig.method.toUpperCase() || "GET";

		if ( !sUrl.startsWith("/")) {
			sUrl = this._getRuntimeUrl(oRequestConfig.url);
		}

		if (oParameters && isPlainObject(oParameters) && ["GET", "HEAD"].includes(sMethod)) {
			sUrl = combineUrlAndParams(sUrl, oParameters);
		} else if (oParameters) {
			vBody = this._encodeParameters(oParameters, oRequestConfig);
		}

		if (mBatchRequests) {
			const oBatchSerialized = ODataUtils.serializeBatchRequest(Object.values(mBatchRequests));
			vBody = oBatchSerialized.body;
			mHeaders = Object.assign({}, mHeaders, oBatchSerialized.headers);
		}

		let oRequest = {
			url: sUrl,
			options: {
				mode: oRequestConfig.mode || "cors",
				method: sMethod,
				headers: new Headers(mHeaders)
			}
		};

		if (vBody) {
			oRequest.options.body = vBody;
		}

		if (oRequestConfig.withCredentials) {
			oRequest.options.credentials = "include";
		}

		if (!oRequest.options.headers.get("Accept") && mDataTypeHeaders[sDataType]) {
			oRequest.options.headers.set("Accept", mDataTypeHeaders[sDataType]);
		}

		oRequest = this._modifyRequestBeforeSent(oRequest, this.getResolvedConfiguration());

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

	RequestDataProvider.prototype._request = function (oRequest, bNoRetry) {
		var fnFetch = this._getFetchMethod(this._getResolvedRequestConfiguration());

		return fnFetch(oRequest.url, oRequest.options)
			.then(function (oResponse) {
				if (this.bIsDestroyed) {
					return Promise.reject("RequestDataProvider is already destroyed before the response is received.");
				}

				this._lastResponse = oResponse;

				if (!oResponse.ok) {
					return oResponse.text().then(function (sResponseText) {
						var aError = [oResponse.status + " " + oResponse.statusText, oResponse, sResponseText, oRequest];
						if (bNoRetry) {
							return Promise.reject(aError);
						}

						return this._retryRequest(aError);
					}.bind(this));
				}

				return oResponse.text().then(function (vData) {
					if (isJsonResponse(oResponse)) {
						try {
							vData = JSON.parse(vData);
						} catch (oError) {
							return Promise.reject([oError.toString(), null, null, oRequest]);
						}
					} else if (isXmlResponse(oResponse)) {
						vData = (new window.DOMParser()).parseFromString(vData, "text/xml");
					}

					return [vData, oResponse];
				});

			}.bind(this), function (oError) {
				return Promise.reject([oError.toString(), null, null, oRequest]);
			});
	};

	RequestDataProvider.prototype._encodeParameters = function (oParameters, oRequestConfiguration) {
		if (this._hasHeader(oRequestConfiguration, "Content-Type", /^application\/json$/)) {
			return JSON.stringify(oParameters);
		}

		if (this._hasHeader(oRequestConfiguration, "Content-Type", /^text\/plain/)) {
			return oParameters;
		}

		if (oParameters instanceof FormData) {
			return oParameters;
		}

		// application/x-www-form-urlencoded
		return new URLSearchParams(oParameters);
	};

	/**
	 * Retries to send the given request if response status code allows it
	 * and if a retry-after value is specified in response header or in the request settings.
	 * @param {Array} aError The error information from first failure.
	 * @returns {Promise} A Promise which is fulfilled if retry is successful and rejected otherwise.
	 */
	RequestDataProvider.prototype._retryRequest = function (aError) {
		var oResponse = aError[1],
			oRequest = aError[3],
			iRetryAfter = this._getRetryAfter(oResponse);

		if (!RETRY_STATUS_CODES.includes(oResponse.status)) {
			// Request should not be retried.
			return Promise.reject(aError);
		}

		if (!iRetryAfter) {
			Log.warning("Request could be retried, but Retry-After header or configuration parameter retryAfter are missing.");
			return Promise.reject(aError);
		}

		if (this._iRetryAfterTimeout) {
			aError[0] = "The retry was already scheduled.";
			return Promise.reject(aError);
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
	 * @param {Response} oResponse The failed response.
	 * @returns {int} The number of seconds after which to retry the request.
	 */
	RequestDataProvider.prototype._getRetryAfter = function (oResponse) {
		const oRequestConfig = this._getResolvedRequestConfiguration(),
			vRetryAfter = oResponse.headers.get("Retry-After") || oRequestConfig.retryAfter;

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
	 * Gets the method which should execute the HTTP fetch.
	 * @private
	 * @param {object} oRequestConfiguration Configuration in manifest format
	 * @returns {Function} The function to use for HTTP fetch.
	 */
	RequestDataProvider.prototype._getFetchMethod = function (oRequestConfiguration) {
		var oCard = this.getCardInstance(),
			oExtension = oCard && oCard.getAggregation("_extension"),
			oHost = Element.getElementById(this.getHost());

		if (oExtension) {
			return (sResource, mOptions) => {
				return oExtension.fetch(sResource, mOptions, this._cloneRequestConfiguration(oRequestConfiguration));
			};
		}

		if (oHost) {
			return (sResource, mOptions) => {
				return oHost.fetch(sResource, mOptions, this._cloneRequestConfiguration(oRequestConfiguration), oCard);
			};
		}

		return fetch;
	};

	RequestDataProvider.prototype._getResolvedRequestConfiguration = function () {
		return this.getResolvedConfiguration().request;
	};

	RequestDataProvider.prototype._cloneRequestConfiguration = function (oRequestConfiguration) {
		let oFormData;

		if (oRequestConfiguration?.parameters instanceof FormData) {
			oFormData = oRequestConfiguration.parameters;
			delete oRequestConfiguration.parameters;
		}

		const oClonedConfiguration = deepClone(oRequestConfiguration, 1000);

		if (oFormData) {
			oClonedConfiguration.parameters = oFormData;
		}

		return oClonedConfiguration;
	};

	/**
	 * Checks if header with given value is part of the request.
	 * Header name is case-insensitive RFC7230 https://tools.ietf.org/html/rfc7230#section-3.2.
	 *
	 * @private
	 * @param {*} oRequestConfig The request config.
	 * @param {*} sHeader Searched header. For example "Content-Type"
	 * @param {*} rValue Regex to match the value. For example /application\/json/
	 * @returns {boolean} Whether a header with given value is present.
	 */
	RequestDataProvider.prototype._hasHeader = function (oRequestConfig, sHeader, rValue) {
		if (!oRequestConfig.headers) {
			return false;
		}

		for (var sKey in oRequestConfig.headers) {
			if (sKey.toLowerCase() === sHeader.toLowerCase() && rValue.test(oRequestConfig.headers[sKey])) {
				return true;
			}
		}

		return false;
	};

	RequestDataProvider.prototype._isValidRequest = function (oRequest) {

		if (!oRequest) {
			Log.error("Request is not valid. Request object is missing.");
			return false;
		}

		if (!oRequest.url) {
			Log.error("Request is not valid. URL is missing.");
			return false;
		}

		if (!oRequest.options) {
			Log.error("Request is not valid. Options are missing.");
			return false;
		}

		if (aModes.indexOf(oRequest.options.mode) === -1) {
			Log.error("Request is not valid. Mode is not among " + aModes.toString());
			return false;
		}

		if (aMethods.indexOf(oRequest.options.method) === -1) {
			Log.error("Request is not valid. Method is not among " + aMethods.toString());
			return false;
		}

		if (oRequest.options.headers && !(oRequest.options.headers instanceof Headers)) {
			Log.error("Request is not valid. The headers option is not instance of Headers interface.");
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
			var sContentType = this.getLastResponse().headers.get("Content-Type"),
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
	 * Override if modification to the request is needed.
	 * Allows the host to modify the headers or the full request.
	 * @param {object} oRequest The current request.
	 * @param {object} oConfiguration The request configuration
	 * @returns {object} The modified request
	 */
	RequestDataProvider.prototype._modifyRequestBeforeSent = function (oRequest, oConfiguration) {
		var oHost = Element.getElementById(this.getHost());

		this.getCardInstance();

		if (!oHost) {
			return oRequest;
		}

		return oRequest;
	};

	/**
	 * @override
	 */
	RequestDataProvider.prototype.getDetails = function () {
		return "Backend interaction - load data from URL: " + this._getResolvedRequestConfiguration().url;
	};

	return RequestDataProvider;
});
