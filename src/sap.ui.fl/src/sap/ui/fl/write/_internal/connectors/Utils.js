/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/Utils"
], function (
	Utils
) {
	"use strict";

	/**
	 * Util class for Connector implementations (write).
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.Utils
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.connectors, sap.ui.fl.write._internal.transport
	 */

	function updateTokenInConnectorAndSendRequest (mPropertyBag, sUrl, sMethod) {
		return Utils.sendRequest(mPropertyBag.tokenUrl, "HEAD", {initialConnector: mPropertyBag.initialConnector})
            .then(Utils.sendRequest.bind(undefined, sUrl, sMethod, mPropertyBag));
	}

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
		 * Gets options for requests which writing data to the back end.
		 *
		 * @param {object} oInitialConnector Corresponding apply connector which stores an existing X-CSRF token
		 * @param {string} sTokenUrl The url to be called when new token fetching is necessary
		 * @param {object} [vFlexObjects] The content which is send to the server
		 * @param {string} [sContentType] Content type of the request
		 * @param {string} [sDataType] Expected data type of the response
		 * @returns {object} Resolving with an object of options
		 */
		getRequestOptions: function (oInitialConnector, sTokenUrl, vFlexObjects, sContentType, sDataType) {
			var oOptions = {
				tokenUrl: sTokenUrl,
				initialConnector: oInitialConnector
			};
			if (vFlexObjects) {
				oOptions.payload = JSON.stringify(vFlexObjects);
			}
			if (sContentType) {
				oOptions.contentType = sContentType;
			}
			if (sDataType) {
				oOptions.dataType = sDataType;
			}
			return oOptions;
		},

		/**
		 * Sending a xhr request with provided X-CSRF token;
		 * If the token has been expired, fetch a new token and resend the request.
		 *
		 * @param {string} sUrl Url of the request
		 * @param {string} sMethod Desired action to be performed for a given resource
		 * @param {object} mPropertyBag Object with parameters as properties
		 * @param {object} mPropertyBag.initialConnector Corresponding initial connector which stores an existing X-CSRF token
		 * @param {string} mPropertyBag.tokenUrl The url to be called when new token fetching is necessary
		 * @param {string} [mPropertyBag.flexObjects] Payload of the request
		 * @param {string} [mPropertyBag.contentType] Content type of the request
		 * @param {string} [mPropertyBag.dataType] Expected data type of the response
		 * @returns {Promise<object>} Promise resolving with the JSON parsed response of the request
		 */
		sendRequest: function (sUrl, sMethod, mPropertyBag) {
			if (
				!mPropertyBag.initialConnector
				|| (
					!mPropertyBag.initialConnector.xsrfToken
					&& !(sMethod === 'GET') // For GET and HEAD operations, there is no need to fetch a token
					&& !(sMethod === 'HEAD')
				)
			) {
				return updateTokenInConnectorAndSendRequest(mPropertyBag, sUrl, sMethod);
			}

			return Utils.sendRequest(sUrl, sMethod, mPropertyBag).then(function(oResult) {
				return oResult;
			})
			.catch(function (oFirstError) {
				if (oFirstError.status === 403) {
					//token is invalid, get a new token and retry
					return updateTokenInConnectorAndSendRequest(mPropertyBag, sUrl, sMethod);
				}
				throw oFirstError;
			});
		},

		/**
		 * Merges the results from all involved connectors.
		 *
		 * @param {object[]} aResponses All responses provided by the different connectors
		 * @returns {object} Merged result
		 */
		mergeResults: function(aResponses) {
			var oResult = {};
			aResponses.forEach(function (oResponse) {
				Object.keys(oResponse).forEach(function (sKey) {
					addToObject(oResponse, oResult, sKey);
				});
			});
			return oResult;
		}
	};
});
