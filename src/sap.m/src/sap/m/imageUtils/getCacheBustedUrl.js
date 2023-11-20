/*!
 * ${copyright}
 */

/**
 * This module provides a function that adds a cache-busting query parameter to a URL.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/base/Log"], function (Log) {
	"use strict";

	/**
	 * Adds a cache-busting query parameter to a URL and returns the new URL.
	 * If the URL is invalid, the original URL is returned.
	 *
	 * @param {Object} oConfig - The configuration object.
	 * @param {string} oConfig.sUrl - The URL to modify.
	 * @param {string} oConfig.sParamName - The name of the cache-busting query parameter to add.
	 * @param {string} oConfig.sParamValue - The value of the cache-busting query parameter to add.
	 * @returns {string} The new URL with the added cache-busting query parameter or the original URL if the modification failed.
	 *
	 * @since 1.115
	 * @private
	 */
	var getCacheBustedUrl = function (oConfig) {
		var sUrl = oConfig.sUrl,
			sParamName = oConfig.sParamName,
			sParamValue = oConfig.sParamValue;

		if (!sUrl || !sParamName) {
			return sUrl;
		}

		try {
			// This is a workaround in order the URL constructor to work with relative URLs.
			var oAnchor = document.createElement("a");
			oAnchor.href = sUrl;

			var oUrl = new URL(oAnchor.href);
			oUrl.searchParams.set(sParamName, sParamValue);

			oAnchor = null;
			return oUrl.toString();

		} catch (error) {
			Log.error("The URL '" + sUrl + "' is invalid.", error, "sap.m.imageUtils.getCacheBustedUrl");
			Log.info("The URL '" + sUrl + "' will not be cache-busted.", null, "sap.m.imageUtils.getCacheBustedUrl");

			return sUrl;
		}
	};

	return getCacheBustedUrl;
});