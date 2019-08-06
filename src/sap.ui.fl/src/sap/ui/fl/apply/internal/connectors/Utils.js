/*
 * ! ${copyright}
 */

/* global XMLHttpRequest */

sap.ui.define([
	"sap/ui/fl/apply/internal/connectors/StaticFileConnector",
	"sap/base/security/encodeURLParameters",
	"sap/base/Log"
], function (
	StaticFileConnector,
	encodeURLParameters,
	Log
) {
	"use strict";

	/**
	 * Util class for Connector implementations (apply and write)
	 *
	 * @namespace sap.ui.fl.apply.internal.connectors.Utils
	 * @experimental Since 1.70
	 * @since 1.70
	 * @version ${version}
	 * @ui5-restricted sap.ui.fl.apply.internal, sap.ui.fl.write.internal
	 */


	var mApplyConnectors;
	var mWriteConnectors;
	var APPLY_CONNECTOR_NAME_SPACE = "sap/ui/fl/apply/internal/connectors/";
	var WRITE_CONNECTOR_NAME_SPACE = "sap/ui/fl/write/internal/connectors/";

	function getConnectors (sNameSpace, bIncludingStaticFileConnector) {
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
	}

	/**
	 * Adds entities of one object into another; depending of the type and presence of entries the behaviour differs:
	 * * not present: it is just added
	 * * present and an array: it is merged
	 * * present and an object: it is merged (recursion)
	 * This function changes the object directly without returning it.
	 *
	 * @param {Object} oSource Object providing the data to merge
	 * @param {Object} oTarget Object which got the data added provided by the source
	 * @param {string} sKey key of the property which should be added
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
		 * Provides all mandatory connectors required to read data for the apply case; these are the static file connector as well as all connectors
		 * mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured connectors and their requested modules
		 */
		getApplyConnectors: function () {
			if (!mApplyConnectors) {
				mApplyConnectors = getConnectors(APPLY_CONNECTOR_NAME_SPACE, true);
			}
			return mApplyConnectors;
		},

		logAndResolveDefault: function(oResponse, oConnectorConfig, sFunctionName, sErrorMessage) {
			Log.error("Connector (" + oConnectorConfig.connectorName + ") failed call '" + sFunctionName + "': " + sErrorMessage);
			return oResponse;
		},

		/**
		 * Merges the results from all involved connectors.
		 *
		 * @param {Object[]} aResponses all responses provided by the different connectors
		 * @returns {Object} merged result
		 * @private
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
		 * Provides all mandatory connectors to write data; these are the connector mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured connectors and their requested modules
		 */
		getWriteConnectors: function () {
			if (!mWriteConnectors) {
				mWriteConnectors = getConnectors(WRITE_CONNECTOR_NAME_SPACE, false);
			}
			return mWriteConnectors;
		},

		/**
		 * Creating a full request url. Generic Method for all Connectors.
		 * This includes the url prefix and optional cache buster token, flex reference and query parameters.
		 *
		 * @param {string} sRoute Url-prefix e.g. "/flex/data/"
		 * @param {object} mPropertyBag Object with parameters as properties
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @param {string} [mPropertyBag.cacheKey] Cache-Buster token
		 * @param {object} [mParameters] Query-parameters which should be added to the url
		 * @returns {string} Complete request url
		 * @private
		 */
		getUrlWithQueryParameters: function(sRoute, mPropertyBag, mParameters) {
			var sUrl = mPropertyBag.url + sRoute;

			mPropertyBag.cacheKey && (sUrl += "~" + mPropertyBag.cacheKey + "~/");
			mPropertyBag.reference && (sUrl += mPropertyBag.reference);

			mParameters = mParameters || {};
			mPropertyBag.appVersion && (mParameters.appVersion = mPropertyBag.appVersion);

			var sQueryParameters = encodeURLParameters(mParameters);
			sQueryParameters.length > 0 && (sUrl += "?" + sQueryParameters);

			return sUrl;
		},

		/**
		 * Sending a xhr request and handling the response according to the status code of the response.
		 *
		 * @param {string} sUrl Url of the sent request
		 * @returns {Promise<object>} Promise resolving with the JSON parsed response of the request
		 * @private
		 */
		sendRequest: function(sUrl) {
			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', sUrl);
				xhr.send();
				xhr.onload = function() {
					if (xhr.status >= 200 && xhr.status < 400) {
						resolve(JSON.parse(xhr.response));
					} else {
						reject(xhr.status + ": " + xhr.statusText);
					}
				};
			});
		}
	};
});
