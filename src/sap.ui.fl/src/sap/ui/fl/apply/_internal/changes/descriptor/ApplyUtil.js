
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/URI"
], function(
	URI
) {
	"use strict";


	var ApplyUtil = {

		/**
		 * Computes correct bundleName based on the sap.app/id and the given bundleUrl
		 * @param {string} sId app id
		 * @param {string} sBundleUrl bundle url
		 * @returns {string} correct bundle name separated by dots without file ending for properties files
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		formatBundleName: function (sId, sBundleUrl) {
			if (sBundleUrl.startsWith("/")) {
				throw Error("Absolute paths are not supported");
			}
			var sNormalizedUrl = new URI(sId + "/" + sBundleUrl).normalize().path();
			return sNormalizedUrl.replace(/\//g, ".").replace("..", ".").replace(/.properties$/g, "");
		}

	};

	return ApplyUtil;
});