/*
 * ! ${copyright}
 */

/* global XMLHttpRequest */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/security/encodeURLParameters",
	"sap/base/util/UriParameters",
	"sap/ui/fl/apply/connectors/BaseConnector"
], function(
	merge,
	encodeURLParameters,
	UriParameters,
	BaseConnector
) {
	"use strict";

	var CONNECTOR_NAME = "LrepConnector";

	var URLS = {
		DATA: "/flex/data/",
		MODULES: "/flex/modules/"
	};


	/**
	 * Returns the tenant number for the communication with the ABAP back end.
	 *
	 * @private
	 * @function
	 * @returns {string} the current client
	 * @name sap.ui.fl.Utils.getClient
	 */
	function getClient () {
		var oUriParameter = UriParameters.fromQuery(window.location.search);
		var sClient = oUriParameter.get("sap-client");
		return sClient || undefined;
	}

	/**
	 * Creating a full request url;
	 * This includes the url prefix and optional cache buster token, flex reference and query parameters.
	 *
	 * @param {string} sUrl url prefix
	 * @param {string} sFlexReference flexibility reference
	 * @param {string} sCacheKey cache buster token
	 * @param {map} mParameters query parameters
	 * @returns {string} full request url
	 * @private
	 */
	function getUrlWithQueryParameters(mPropertyBag, sRoute) {
		var mParameters = {};

		if (mPropertyBag.appVersion) {
			mParameters.appVersion = mPropertyBag.appVersion;
		}

		var sUrl = mPropertyBag.urls[CONNECTOR_NAME] + sRoute;

		if (mPropertyBag.cacheKey) {
			sUrl += "~" + mPropertyBag.cacheKey + "~/";
		}

		if (mPropertyBag.reference) {
			sUrl += mPropertyBag.reference;
		}

		mParameters = mParameters || {};

		var sClient = getClient();

		if (sClient) {
			mParameters["sap-client"] = sClient;
		}

		var sQueryParameters = encodeURLParameters(mParameters);

		if (sQueryParameters.length > 0) {
			sUrl += "?" + sQueryParameters;
		}

		return sUrl;
	}

	/**
	 * Sending a xhr request and handling the response according to the status code of the response.
	 *
	 * @param {string} sUrl Url of the sent request
	 * @returns {Promise<object>} Promise resolving with the JSON parsed response of the request
	 * @private
	 */
	function sendRequest(sUrl) {
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

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.apply.connectors.LrepConnector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @ui5-restricted sap.ui.fl.write.internal.Connector
	 */
	var LrepConnector = merge({}, BaseConnector,  /** @lends sap.ui.fl.apply.internal.connectors.LrepConnector */ {

		/**
		 * Loads the data from the back end and triggers a second request for modules in case the back end responses with
		 * a flag that such modules are present.
		 *
		 * @param {map} mPropertyBag further properties
		 * @param {string} mPropertyBag.flexReference flexibility reference
		 * @param {string} [mPropertyBag.appVersion] version of the application
		 * @param {string} [mPropertyBag.url] configured url for the connector
		 * @param {string} [mPropertyBag.cacheKey] cache buster token
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function (mPropertyBag) {
			var sDataUrl = getUrlWithQueryParameters(mPropertyBag, URLS.DATA);
			return sendRequest(sDataUrl).then(function (oResponse) {
				// TODO(when the cacheKey calculation implementation happens): see that the etag / cacheKey is handled accordingly

				if (!oResponse.loadModules) {
					return oResponse;
				}

				var sModulesUrl = getUrlWithQueryParameters(mPropertyBag, URLS.MODULES);
				return sendRequest(sModulesUrl).then(function () {
					return oResponse;
				});
			});
		}
	});

	return LrepConnector;
}, true);
