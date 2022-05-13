/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Helper that adds window features 'noopener noreferrer' when opening an
	 * address to ensure that no opener browsing context is forwarded.
	 * If forwarding of the opener browsing context is needed, the native
	 * <code>window.open</code> API should be used.
	 *
	 * @param {sap.ui.core.URI} sUrl URL of a document that should be loaded in the new window
	 * @param {string} sWindowName Name of the new window
	 * @returns {Window|null} The newly returned window object or <code>null</code>
	 * @private
	 * @ui5-restricted
	 * @alias module:sap/ui/util/openWindow
	 * @since 1.84
	 */
	var fnOpenWindow = function openWindow(sUrl, sWindowName) {
		var sWindowFeatures = "noopener,noreferrer";

		return window.open(sUrl, sWindowName, sWindowFeatures);
	};

	return fnOpenWindow;
});
