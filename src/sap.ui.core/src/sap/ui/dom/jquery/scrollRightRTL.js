/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/Device", "sap/ui/thirdparty/jquery"], function(Device, jQuery) {
	"use strict";

	/**
	 * This module provides the {@link jQuery#scrollRightRTL} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/scrollRightRTL
	 * @public
	 * @since 1.58
	 */

	/**
	 * Returns the MIRRORED scrollLeft value of the first element in the given jQuery collection in right-to-left mode.
	 * Precondition: The element is rendered in RTL mode.
	 *
	 * Reason for this method is that the major browsers return three different values for the same scroll position when in RTL mode.
	 * This method hides those differences and returns the value that would be returned in LTR mode if the UI would be mirrored horizontally:
	 * The distance in px how far the given container is scrolled away from the rightmost scroll position.
	 *
	 * Returns "undefined" if no element is given.
	 *
	 * @return {int} The scroll position, counted from the rightmost position
	 * @public
	 * @name jQuery#scrollRightRTL
	 * @author SAP SE
	 * @since 0.20.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/scrollRightRTL
	 */
	var fnScrollRightRTL = function() {
		var oDomRef = this.get(0);
		if (oDomRef) {

			if (Device.browser.msie) {
				return oDomRef.scrollLeft;

			} else if (Device.browser.firefox || (Device.browser.safari && Device.browser.version >= 10)) {
				// Firefox and Safari 10+ behave the same although Safari is a WebKit browser
				return (-oDomRef.scrollLeft);

			} else if (Device.browser.webkit) {
				// WebKit browsers (except Safari 10+, as it's handled above)
				return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return oDomRef.scrollLeft;
			}
		}
	};

	jQuery.fn.scrollRightRTL = fnScrollRightRTL;

	return jQuery;
});

