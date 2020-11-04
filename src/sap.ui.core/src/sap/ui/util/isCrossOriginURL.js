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
	function isCrossOriginURL(sHref) {
		// Code can be similfied during IE11 cleanup as URL API can handle URNs without errors:
		// --> new URL("mailto:info.germany@sap.com', document.baseURI).toString()
		var oURI = new URI(sHref),
			oURI = oURI.is("relative") ? oURI.absoluteTo(document.baseURI) : oURI,
			sOrigin = window.location.origin || new URI().origin();

		return oURI.origin() !== sOrigin;
	}

	return isCrossOriginURL;
});
