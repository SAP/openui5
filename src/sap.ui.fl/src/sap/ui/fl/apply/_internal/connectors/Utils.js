/*
 * ! ${copyright}
 */

/* global XMLHttpRequest */

sap.ui.define([
	"sap/base/security/encodeURLParameters",
	"sap/base/Log"
], function (
	encodeURLParameters,
	Log
) {
	"use strict";

	/**
	 * Util class for Connector implementations (apply).
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.Utils
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.connectors, sap.ui.fl.write._internal.connectors, sap.ui.fl.write._internal.transport
	 */

	var TIMEOUT = 0; //TODO Define a certain timeout value

	/**
	 * Creates <code>Error<code> object from <code>XMLHttpRequest<code> and an additional message for end user
	 *
	 * @param {XMLHttpRequest} oRequest <code>XMLHttpRequest<code>
	 * @param {string} sUserMessage Message which can be displayed to end user
	 * @returns {object} <code>Error<code> object
	 */
	var _createError = function (oRequest, sUserMessage) {
		var oError = new Error(oRequest.statusText);
		oError.status = oRequest.status;
		oError.userMessage = sUserMessage;
		return oError;
	};

	/**
	 * Gets text value from resource bundle
	 *
	 * @param {string} sTextKey Text key for text look up
	 * @returns {string} Text value
	 */
	var _getTextFromResourceBundle = function (sTextKey) {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText(sTextKey);
	};

	return {
		/**
		 * Creates a Error messages in case of a failed Connector call while getting responses from multiple endpoints
		 *
		 * @param {object} oResponse Response from the sent request
		 * @param {object} oConnectorConfig Configured Connector
		 * @param {string} sFunctionName Name of the called function
		 * @param {string} sErrorMessage Error messages retrieved from the endpoint
		 * @returns {object} oResponse Response from the endpoint
		 */
		logAndResolveDefault: function (oResponse, oConnectorConfig, sFunctionName, sErrorMessage) {
			Log.error("Connector (" + oConnectorConfig.connector + ") failed call '" + sFunctionName + "': " + sErrorMessage);
			return oResponse;
		},

		/**
		 * Creating a full request url. Generic Method for all Connectors.
		 * This includes the url prefix and optional cache buster token, flex reference and query parameters.
		 *
		 * @param {string} sRoute Url-suffix e.g. "/flex/data/"
		 * @param {object} mPropertyBag Object with parameters as properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.reference] Flexibility reference
		 * @param {string} [mPropertyBag.cacheKey] Cache-Buster token
		 * @param {string} [mPropertyBag.fileName] Filename of an existing flex object
		 * @param {object} [mParameters] Query-parameters which will be added to the url
		 * @returns {string} Complete request url
		 * @private
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		getUrl: function (sRoute, mPropertyBag, mParameters) {
			if (!sRoute || !mPropertyBag.url) {
				throw new Error("Not all necessary parameters were passed");
			}
			var sUrl = mPropertyBag.url + sRoute;

			// If any of the following properties are available in mPropertyBag we append them to the Url
			if (mPropertyBag.cacheKey) {
				sUrl += "~" + mPropertyBag.cacheKey + "~/";
			}
			if (mPropertyBag.reference) {
				sUrl += mPropertyBag.reference;
			} else if (mPropertyBag.fileName) {
				sUrl += mPropertyBag.fileName;
			}

			// Adding Query-Parameters to the Url
			if (mParameters) {
				Object.keys(mParameters).forEach(function (sKey) {
					if (mParameters[sKey] === undefined) {
						delete mParameters[sKey];
					}
				});
				var sQueryParameters = encodeURLParameters(mParameters);

				if (sQueryParameters.length > 0) {
					sUrl += "?" + sQueryParameters;
				}
			}
			return sUrl;
		},

		/**
		 * Sending a xhr request and handling the response according to the status code of the response.
		 *
		 * @param {string} sUrl Url of the sent request
		 * @param {string} [sMethod="GET"] Desired action to be performed for a given resource
		 * @param {object} [mPropertyBag] Object with parameters as properties
		 * @param {string} [mPropertyBag.xsrfToken] Existing X-CSRF token of the connector which triggers the request
		 * @param {string} [mPropertyBag.payload] Payload of the request
		 * @param {string} [mPropertyBag.contentType] Content type of the request
		 * @param {string} [mPropertyBag.dataType] Expected data type of the response
		 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to actual component
		 * @param {string} [mPropertyBag.siteId] <code>sideId</code> that belongs to actual component
		 * @returns {Promise<object>} Promise resolving with the JSON parsed response of the request
		 */
		sendRequest: function (sUrl, sMethod, mPropertyBag) {
			sMethod = sMethod || "GET";
			sMethod = sMethod.toUpperCase();

			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open(sMethod, sUrl);
				xhr.timeout = TIMEOUT;
				if ((sMethod === "GET" || sMethod === "HEAD") && (!mPropertyBag || !mPropertyBag.xsrfToken)) {
					xhr.setRequestHeader("X-CSRF-Token", "fetch");
				}
				if ((sMethod === "POST" || sMethod === "PUT" || sMethod === "DELETE") && mPropertyBag && mPropertyBag.xsrfToken) {
					xhr.setRequestHeader("X-CSRF-Token", mPropertyBag.xsrfToken);
				}
				if (mPropertyBag && mPropertyBag.contentType) {
					xhr.setRequestHeader("Content-Type", mPropertyBag.contentType);
				}
				if (mPropertyBag && mPropertyBag.siteId) {
					xhr.setRequestHeader("X-LRep-Site-Id", mPropertyBag.siteId);
				}
				if (mPropertyBag && mPropertyBag.sAppDescriptorId) {
					xhr.setRequestHeader("X-LRep-AppDescriptor-Id", mPropertyBag.sAppDescriptorId);
				}
				if (mPropertyBag && mPropertyBag.dataType) {
					xhr.responseType = mPropertyBag.dataType;
				}
				if (mPropertyBag && mPropertyBag.payload) {
					xhr.send(mPropertyBag.payload);
				} else {
					xhr.send();
				}

				xhr.onload = function () {
					if (xhr.status >= 200 && xhr.status < 400) {
						try {
							var oResult = {};

							if (xhr.status !== 204) {
								// mockservers using sinon servers have the response in responseText, not in response
								if (!xhr.response && xhr.responseText) {
									xhr.response = xhr.responseText;
								}

								if (xhr.response) {
									oResult.response = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;
								}
							}
							oResult.status = xhr.status;
							if (xhr.getResponseHeader("X-CSRF-Token")) {
								oResult.xsrfToken = xhr.getResponseHeader("X-CSRF-Token");
							}
							if (xhr.getResponseHeader("Etag")) {
								oResult.etag = xhr.getResponseHeader("Etag");
							}
							resolve(oResult);
						} catch (oError) {
							oError.userMessage = _getTextFromResourceBundle("MSG_LOADING_SERVER_RESPONSE_ERROR");
							reject(oError);
						}
					} else {
						var sErrorMessage = "";
						try {
							//Handle back end error. TODO Implement CF error with the same format
							var oResponse = JSON.parse(xhr.response);
							if (Array.isArray(oResponse.messages) && oResponse.messages.length) {
								sErrorMessage = oResponse.messages.reduce(function(sConcatenatedMessage, oErrorResponse) {
									return sConcatenatedMessage.concat(oErrorResponse.severity === "Error" ? oErrorResponse.text + "\n" : "");
								}, sErrorMessage);
							}
						} catch (e) {
							//Do nothing if the response is not in JSON format
						}
						reject(_createError(xhr, sErrorMessage));
					}
				};

				xhr.ontimeout = function () {
					reject(_createError(xhr, _getTextFromResourceBundle("MSG_CONNECTION_TIMEOUT_ERROR")));
				};

				xhr.onerror = function () {
					reject(_createError(xhr, _getTextFromResourceBundle("MSG_NETWORK_ERROR")));
				};
			});
		}
	};
});