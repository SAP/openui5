/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/IconPool"
], function (BaseObject, IconPool) {
	"use strict";

	/**
	 * @private
	 */
	var IconFormatter = BaseObject.extend("sap.ui.integration.util.Destinations", {
		constructor: function (oDestinations) {
			BaseObject.call(this);
			this._oDestinations = oDestinations;
		}
	});

	/**
	 * Format relative icon sources to be relative to the provided sap.app/id.
	 *
	 * @private
	 * @param {string} sUrl The URL to format.
	 * @param {string} sAppId The ID in the "sap.app" namespace of the manifest.
	 * @returns {string|Promise} The formatted URL or a Promise which resolves with the formatted url.
	 */
	IconFormatter.prototype.formatSrc = function (sUrl, sAppId) {
		var iIndex = 0;

		if (!sUrl || !sAppId) {
			return sUrl;
		}

		if (sUrl.startsWith("data:")) {
			return sUrl;
		}

		if (this._oDestinations.hasDestination(sUrl)) {
			return this._oDestinations.processString(sUrl);
		}

		// Do not format absolute icon sources.
		if (IconPool.isIconURI(sUrl) || sUrl.startsWith("http://") || sUrl.startsWith("https://") || sUrl.startsWith("//")) {
			return sUrl;
		}

		if (sUrl.startsWith("..")) {
			iIndex = 2;
		} else if (sUrl.startsWith(".")) {
			iIndex = 1;
		}

		return sap.ui.require.toUrl(sAppId.replace(/\./g, "/") + sUrl.slice(iIndex, sUrl.length));
	};

	return IconFormatter;
});
