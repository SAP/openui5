/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	var module = {};

	/**
	 * Get URL Param by name
	 * @param {string} sParamName - Parameter name
	 * @return {string|undefined} - Returns value of the specified param or undefined if not found
	 */
	module.getParam = function(sParamName) {
		return module.getParams()[sParamName];
	};

	/**
	 * Get URL parameters object from the url or given url string
	 * @param {string} [sUrl] - Url parameter string notation starting with ? and following key value pair
	 * @returns {object} Object with key value pairs of given parameters
	 */
	module.getParams = function(sUrl) {
		sUrl = (sUrl || sUrl === "") ? sUrl : document.location.search;
		return sUrl
		.replace(/^\?/, "")
		.split("&")
		.reduce(function(mParams, sParam) {
			var aParts = sParam.split("="); // split on key/value
			var sValue = aParts[1];

			switch (sValue) {
				case "true":
					sValue = true;
					break;
				case "false":
					sValue = false;
					break;
				default: break;
			}

			mParams[aParts[0]] = sValue;
			return mParams;
		}, {});
	};

	return module;
}, true);
