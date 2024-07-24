/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/base/i18n/Localization",
	"sap/base/security/encodeURLParameters"
], function(
	Lib,
	Localization,
	encodeURLParameters
) {
	"use strict";

	var DEFAULT_TIMEOUT = 20000; // 20 seconds

	/**
	 * Creates <code>Error<code> object from <code>XMLHttpRequest<code> and an additional message for end user
	 *
	 * @param {XMLHttpRequest} oRequest <code>XMLHttpRequest<code>
	 * @param {string} sUserMessage Message which can be displayed to end user
	 * @returns {object} <code>Error<code> object
	 */
	var _createError = function(oRequest, sUserMessage) {
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
	var _getTextFromResourceBundle = function(sTextKey) {
		return Lib.getResourceBundleFor("sap.ui.fl").getText(sTextKey);
	};

	/**
	 * Adds additional path into a URL.
	 *
	 * @param {string} sUrl - URL of the request
	 * @param {string} sPath - Additional path to add into the URL
	 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
	 */
	const addPathIntoUrl = (sUrl, sPath) => {
		if (sUrl.slice(-1) !== "/" && sPath.charAt(0) !== "/") {
			sUrl += "/";
		}
		return sUrl + sPath;
	};
	/**
	 * Util class for Connector implementations (apply).
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.Utils
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.connectors, sap.ui.fl.write._internal.connectors, sap.ui.fl.write._internal.transport
	 */
	return {
		/**
		 * Adds current BCP-47 standard language code into request parameters as value of <code>sap-language</code> parameter.
		 *
		 * @param {object} mParameters - Parameters of the request
		 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		addLanguageInfo(mParameters) {
			if (!mParameters) {
				throw new Error("No parameters map were passed");
			}
			mParameters["sap-language"] = Localization.getLanguage();
		},

		/**
		 * Adds current SAP language code into request parameters as value of <code>sap-language</code> parameter.
		 *
		 * @param {object} mParameters - Parameters of the request
		 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		addSAPLogonLanguageInfo(mParameters) {
			if (!mParameters) {
				throw new Error("No parameters map were passed");
			}
			mParameters["sap-language"] = Localization.getSAPLogonLanguage();
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
		 * @ui5-restricted sap.ui.fl.initial._internal, sap.ui.fl.write._internal
		 */
		getUrl(sRoute, mPropertyBag, mParameters) {
			if (!sRoute || !mPropertyBag.url) {
				throw new Error("Not all necessary parameters were passed");
			}
			let sUrl = addPathIntoUrl(mPropertyBag.url, sRoute);

			// If any of the following properties are available in mPropertyBag we append them to the Url
			if (mPropertyBag.cacheKey) {
				sUrl = addPathIntoUrl(sUrl, `~${mPropertyBag.cacheKey}~`);
			}
			if (mPropertyBag.reference) {
				sUrl = addPathIntoUrl(sUrl, mPropertyBag.reference);
			} else if (mPropertyBag.fileName) {
				sUrl = addPathIntoUrl(sUrl, mPropertyBag.fileName);
			}

			// Adding Query-Parameters to the Url
			if (mParameters) {
				Object.keys(mParameters).forEach(function(sKey) {
					if (mParameters[sKey] === undefined) {
						delete mParameters[sKey];
					}
				});
				var sQueryParameters = encodeURLParameters(mParameters);

				if (sQueryParameters.length > 0) {
					sUrl += `?${sQueryParameters}`;
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
		 * @param {object} [mPropertyBag.initialConnector] Corresponding initial connector which has an existing X-CSRF token or stores a new X-CSRF token
		 * @param {string} [mPropertyBag.payload] Payload of the request
		 * @param {string} [mPropertyBag.contentType] Content type of the request
		 * @param {string} [mPropertyBag.dataType] Expected data type of the response
		 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to actual component
		 * @param {string} [mPropertyBag.siteId] <code>sideId</code> that belongs to actual component
		 * @param {boolean} [mPropertyBag.cacheable] <code>true</code> if the request can be cached in browsers
		 * @returns {Promise<object>} Promise resolving with the JSON parsed response of the request
		 */
		sendRequest(sUrl, sMethod, mPropertyBag) {
			sMethod ||= "GET";
			sMethod = sMethod.toUpperCase();

			return new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open(sMethod, sUrl);
				xhr.timeout = DEFAULT_TIMEOUT; // TODO Implement logic for connectors to configure dedicated timeout values which overwrite the default
				if ((sMethod === "GET" || sMethod === "HEAD") && (!mPropertyBag || (!mPropertyBag.initialConnector || !mPropertyBag.initialConnector.xsrfToken) && !mPropertyBag.cacheable)) {
					xhr.setRequestHeader("X-CSRF-Token", "fetch");
				}
				if ((sMethod === "POST" || sMethod === "PUT" || sMethod === "DELETE") && mPropertyBag && mPropertyBag.initialConnector && mPropertyBag.initialConnector.xsrfToken) {
					xhr.setRequestHeader("X-CSRF-Token", mPropertyBag.initialConnector.xsrfToken);
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

				xhr.onload = function() {
					if (xhr.status >= 200 && xhr.status < 400) {
						try {
							var oResult = {};

							if (xhr.status !== 204 && xhr.status !== 205) {
								// mockservers using sinon servers have the response in responseText, not in response
								if (!xhr.response && xhr.responseText) {
									xhr.response = xhr.responseText;
								}

								oResult.response = xhr.response;
								if (
									oResult.response
									&& typeof oResult.response === "string"
									&& xhr.getResponseHeader("content-type")
									&& (xhr.getResponseHeader("content-type").indexOf("json") > 0)
								) {
									oResult.response = JSON.parse(oResult.response);
								}
							}
							oResult.status = xhr.status;
							if (xhr.getResponseHeader("X-CSRF-Token")) {
								oResult.xsrfToken = xhr.getResponseHeader("X-CSRF-Token");
								if (mPropertyBag && mPropertyBag.initialConnector) {
									mPropertyBag.initialConnector.xsrfToken = oResult.xsrfToken;
								}
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
							// Handle back end error. TODO Implement CF error with the same format
							var oResponse = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;
							if (Array.isArray(oResponse.messages) && oResponse.messages.length) {
								sErrorMessage = oResponse.messages.reduce(function(sConcatenatedMessage, oErrorResponse) {
									return sConcatenatedMessage.concat(oErrorResponse.severity === "Error" ? `${oErrorResponse.text}\n` : "");
								}, sErrorMessage);
							}
						} catch (e) {
							// Do nothing if the response is not in JSON format
						}
						reject(_createError(xhr, sErrorMessage));
					}
				};

				xhr.ontimeout = function() {
					reject(_createError(xhr, _getTextFromResourceBundle("MSG_CONNECTION_TIMEOUT_ERROR")));
				};

				xhr.onerror = function() {
					reject(_createError(xhr, _getTextFromResourceBundle("MSG_NETWORK_ERROR")));
				};

				xhr.addEventListener("error", function() {
					reject(_createError(xhr, _getTextFromResourceBundle("MSG_NETWORK_ERROR")));
				});

				if (mPropertyBag && mPropertyBag.payload) {
					xhr.send(mPropertyBag.payload);
				} else {
					xhr.send();
				}
			});
		}
	};
});