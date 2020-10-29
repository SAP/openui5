/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/thirdparty/URI'], function(URI) {
	"use strict";

	/**
	 * If the given URL is cross-origin, checks whether its origin is different from
	 * the origin of the current document.
	 *
	 * @param {sap.ui.core.URI} sHref The URL to check
	 * @returns {boolean} Whether the URL is a cross-origin URL
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/util/isCrossOriginURL
	 * @since 1.84
	 */
	function isCrossOrigin(sHref) {
		var oURI = new URI(sHref, document.baseURI),
			sOrigin = window.location.origin || new URI().origin();

		return oURI.origin() !== sOrigin;
	}

	return isCrossOrigin;
});
