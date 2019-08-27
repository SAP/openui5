/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/Utils"
], function (
	ApplyUtils
) {
	"use strict";

	/**
	 * Util class for Connector implementations (write).
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.Utils
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 */

	var WRITE_CONNECTOR_NAME_SPACE = "sap/ui/fl/write/_internal/connectors/";

	/**
	 * Gets new X-CSRF token from the back end and update token value in the PropertyBag and apply connector.
	 *
	 * @param {object} mPropertyBag Object with parameters as properties
	 * @param {sap.ui.fl.connector.BaseConnector} mPropertyBag.applyConnector Corresponding apply connector which stores an existing X-CSRF token
	 * @param {string} mPropertyBag.tokenUrl The url to be called when new token fetching is necessary
	 * @private
	 * @returns {Promise} Promise resolves when new token is retrieved from response header
	 */
	var updateTokenInPropertyBagAndConnector = function (mPropertyBag) {
		return ApplyUtils.sendRequest(mPropertyBag.tokenUrl, "HEAD").then(function (oResult) {
			if (oResult && oResult.token) {
				mPropertyBag.applyConnector.sXsrfToken = oResult.token;
				mPropertyBag.token = oResult.token;
				return mPropertyBag;
			}
		}, function (oError) {
			return Promise.reject(oError);
		});
	};

	return {
		/**
		 * Provides all mandatory connectors to write data; these are the connector mentioned in the core-Configuration.
		 *
		 * @returns {Promise<map[]>} Resolving with a list of maps for all configured write connectors and their requested modules
		 */
		getWriteConnectors: function () {
			return ApplyUtils.getConnectors(WRITE_CONNECTOR_NAME_SPACE, false);
		},

		/**
		 * Gets options for requests which writing data to the back end.
		 *
		 * @param {object} oApplyConnector Corresponding apply connector which stores an existing X-CSRF token
		 * @param {string} sTokenUrl The url to be called when new token fetching is necessary
		 * @param {sap.ui.fl.Change[]} [aPayload] Array of flexibility object to be stored
		 * @param {string} [sContentType] Content type of the request
		 * @param {string} [sDataType] Expected data type of the response
		 * @returns {object} Resolving with an object of options
		 */
		getRequestOptions: function (oApplyConnector, sTokenUrl, aPayload, sContentType, sDataType) {
			var oOptions = {
				token : oApplyConnector.sXsrfToken,
				tokenUrl : sTokenUrl,
				applyConnector : oApplyConnector
			};
			if (aPayload) {
				oOptions.payload = JSON.stringify(aPayload);
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
		 * @param {string} mPropertyBag.token Existing X-CSRF token of the connector which triggers the request
		 * @param {object} mPropertyBag.applyConnector Corresponding apply connector which stores an existing X-CSRF token
		 * @param {string} mPropertyBag.tokenUrl The url to be called when new token fetching is necessary
		 * @param {string} [mPropertyBag.payload] Payload of the request
		 * @param {string} [mPropertyBag.contentType] Content type of the request
		 * @param {string} [mPropertyBag.dataType] Expected data type of the response
		 * @returns {Promise<object>} Promise resolving with the JSON parsed response of the request
		 */
		sendRequest:function (sUrl, sMethod, mPropertyBag) {
			return ApplyUtils.sendRequest(sUrl, sMethod, mPropertyBag).then(function(oResult) {
				return oResult.response;
			}, function (oFirstError) {
				if (oFirstError.status === 403) {
					//token is invalid, get a new token and retry
					return updateTokenInPropertyBagAndConnector(mPropertyBag)
						.then(ApplyUtils.sendRequest.bind(undefined, sUrl, sMethod))
						.then(function(oResult) {
							return oResult.response;
						});
				}
				throw oFirstError;
			})
			.catch(function(oError) {
				return Promise.reject(oError);
			});
		}
	};
});
