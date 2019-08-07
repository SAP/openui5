/*
 * ! ${copyright}
 */

/* global XMLHttpRequest */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/StaticFileConnector",
	"sap/base/security/encodeURLParameters",
	"sap/base/Log"
], function (
	StaticFileConnector,
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
	 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
	 */

	var APPLY_CONNECTOR_NAME_SPACE = "sap/ui/fl/apply/_internal/connectors/";

	/**
	 * Adds entities of one object into another; depending of the type and presence of entries the behaviour differs:
	 * * not present: it is just added
	 * * present and an array: it is merged
	 * * present and an object: it is merged (recursion)
	 * This function changes the object directly without returning it.
	 *
	 * @param {object} oSource Object providing the data to merge
	 * @param {object} oTarget Object which got the data added provided by the source
	 * @param {string} sKey Key of the property which should be added
	 * @private
	 */
	function addToObject(oSource, oTarget, sKey) {
		if (!oTarget[sKey]) {
			oTarget[sKey] = oSource[sKey];
			return; // continue
		}

		if (Array.isArray(oTarget[sKey])) {
			oTarget[sKey] = oTarget[sKey].concat(oSource[sKey]);
			return; // continue
		}

		if (typeof oTarget[sKey] === 'object') {
			Object.keys(oSource[sKey]).forEach(function (sInnerKey) {
				addToObject(oSource[sKey], oTarget[sKey], sInnerKey);
			});
		}
		// simple entities are just overwritten
		oTarget[sKey] = oSource[sKey];
	}

	return {

		/**
		 * Provides all mandatory connectors required to apply or write data depending on the given namespace.
		 *
		 * @param {string} sNameSpace Namespace to determine the path to the configured connectors
		 * @param {boolean} bIncludingStaticFileConnector Flag to determine if StaticFileConnector should be included
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured connectors and their requested modules
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		getConnectors: function(sNameSpace, bIncludingStaticFileConnector) {
			var aConfiguredConnectors = sap.ui.getCore().getConfiguration().getFlexibilityServices();
			var mConnectors = [];
			if (bIncludingStaticFileConnector) {
				mConnectors = [StaticFileConnector.CONFIGURATION];
			}

			mConnectors = mConnectors.concat(aConfiguredConnectors);

			return new Promise(function (resolve) {
				var aConnectorNames = mConnectors.map(function (mConnectorConfiguration) {
					var sConnectorName = mConnectorConfiguration.connectorName;
					return mConnectorConfiguration.custom ? sConnectorName : sNameSpace + sConnectorName;
				});

				sap.ui.require(aConnectorNames, function () {
					Array.from(arguments).forEach(function (oConnector, iIndex) {
						mConnectors[iIndex].connector = oConnector;
					});

					resolve(mConnectors);
				});
			});
		},

		/**
		 * Provides all mandatory connectors required to read data for the apply case; these are the static file connector as well as all connectors
		 * mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured apply connectors and their requested modules
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		getApplyConnectors: function () {
			return this.getConnectors(APPLY_CONNECTOR_NAME_SPACE, true);
		},

		/**
		 * Creates a Error messages in case of a failed Connector call while getting responses from multiple endpoints
		 *
		 * @param {object} oResponse Response from the sent request
		 * @param {object} oConnectorConfig Configured Connector
		 * @param {string} sFunctionName Name of the called function
		 * @param {string} sErrorMessage Error messages retrieved from the endpoint
		 * @returns {object} oResponse Response from the endpoint
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		logAndResolveDefault: function(oResponse, oConnectorConfig, sFunctionName, sErrorMessage) {
			Log.error("Connector (" + oConnectorConfig.connectorName + ") failed call '" + sFunctionName + "': " + sErrorMessage);
			return oResponse;
		},

		/**
		 * Merges the results from all involved connectors.
		 *
		 * @param {object[]} aResponses All responses provided by the different connectors
		 * @returns {object} Merged result
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		mergeResults: function(aResponses) {
			var oResult = {};
			aResponses.forEach(function (oResponse) {
				Object.keys(oResponse).forEach(function (sKey) {
					addToObject(oResponse, oResult, sKey);
				});
			});
			return oResult;
		},

		/**
		 * Takes a source object and returns a target object that has a subset of properties of the source object
		 * specified in 'aKeys'.
		 *
		 * @param {object} oSource Object containing the information needed for filling oTarget
		 * @param {array<string>} aKeys Keys which should be added to oTarget
		 * @returns {object} oTarget Object containing all key-value pairs which where found in oSource
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		getSubsetOfObject: function(oSource, aKeys) {
			var oTarget = {};
			if (Array.isArray(aKeys)) {
				aKeys.forEach(function (sKey) {
					if (oSource[sKey]) {
						oTarget[sKey] = oSource[sKey];
					}
				});
			}
			return oTarget;
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
		 * @param {object} [mParameters] Query-parameters which will be added to the url
		 * @returns {string} Complete request url
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		getUrl: function(sRoute, mPropertyBag, mParameters) {
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
			}

			// Adding Query-Parameters to the Url
			if (mParameters) {
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
		 * @param {string} sMethod Desired action to be performed for a given resource
		 * @param {object} [mPropertyBag] Object with parameters as properties
		 * @param {string} [mPropertyBag.token] Existing X-CSRF token of the connector which triggers the request
		 * @returns {Promise<object>} Promise resolving with the JSON parsed response of the request
		 * @restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
		 */
		sendRequest: function(sUrl, sMethod, mPropertyBag) {
			sMethod = sMethod || "GET";
			sMethod = sMethod.toUpperCase();

			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open(sMethod, sUrl);
				if ((sMethod === "GET" || sMethod === "HEAD") && mPropertyBag && !mPropertyBag.token) {
					xhr.setRequestHeader("X-CSRF-Token", "fetch");
				}
				if ((sMethod === "POST" || sMethod === "PUT" || sMethod === "DELETE") && mPropertyBag && mPropertyBag.token) {
					xhr.setRequestHeader("X-CSRF-Token", mPropertyBag.token);
				}
				xhr.send();
				xhr.onload = function() {
					if (xhr.status >= 200 && xhr.status < 400) {
						var oResult = {};
						oResult.response = JSON.parse(xhr.response);
						oResult.status = xhr.status;
						oResult.token = xhr.getResponseHeader("X-CSRF-Token");
						resolve(oResult);
					} else {
						reject({
							status : xhr.status,
							message : xhr.statusText
						});
					}
				};
			});
		}
	};
});