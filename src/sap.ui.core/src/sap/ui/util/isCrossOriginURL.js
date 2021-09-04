/*!
 * ${copyright}
 */
/*global URL */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Checks whether the given URL is cross-origin, compared to the origin of
	 * the current page (<code>window.location</code>).
	 *
	 * <b>Note</b>: for opaque origins ('null'), the check is quite conservative
	 * and always reports a cross-origin URL, although the real origins might be
	 * the same. The serialized representation of origins does not allow a more
	 * accurate check.
	 *
	 * @see https://html.spec.whatwg.org/multipage/origin.html#origin
	 *
	 * @param {sap.ui.core.URI} sHref The URL to check
	 * @returns {boolean} Whether the URL is a cross-origin URL
	 * @private
	 * @ui5-restricted sap.ui.model.odata.v2.ODataModel,sap.ushell
	 * @alias module:sap/ui/util/isCrossOriginURL
	 * @since 1.84
	 */
	function isCrossOriginURL(sHref) {
		var oURL = new URL(sHref, document.baseURI);

		return (
			oURL.origin === 'null'
			|| window.location.origin === 'null'
			|| oURL.origin !== window.location.origin
		);
	}

	return isCrossOriginURL;
});
