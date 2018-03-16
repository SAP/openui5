/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	return {
		resolutionUrl: function (aUrls, oUrl) {
			var sSeparator = aUrls.indexOf(oUrl) === aUrls.length - 1 ? "" : ", \u00a0";
			return oUrl.text + sSeparator;
		},
		hasResolutionUrls: function (aUrls) {
			if (aUrls && aUrls.length > 0) {
				return true;
			}
			return false;
		}
	};
});