/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/Device", "sap/ui/dom/denormalizeScrollLeftRTL", "sap/ui/thirdparty/jquery"
], function(Device, denormalizeScrollLeftRTL, jQuery) {
	"use strict";

	/**
	 * Sets or returns the scrollLeft value of the first element in the given jQuery collection in right-to-left mode.
	 * Precondition: The element is rendered in RTL mode.
	 *
	 * Reason for this method is that the major browsers use three different values for the same scroll position when in RTL mode.
	 * This method hides those differences and returns/applies the same value that would be returned in LTR mode: The distance in px
	 * how far the given container is scrolled away from the leftmost scroll position.
	 *
	 * Returns "undefined" if no element and no iPos is given.
	 *
	 * @param {int} iPos The desired scroll position
	 * @return {jQuery | int} The jQuery collection if iPos is given, otherwise the scroll position, counted from the leftmost position
	 * @private
	 * @author SAP SE
	 * @function
	 * @exports sap/ui/dom/jquery/scrollLeftRTL
	 */
	var fnScrollLeftRTL = function(iPos) {
		var oDomRef = this.get(0);
		if (oDomRef) {

			if (iPos === undefined) { // GETTER code
				if (Device.browser.msie || Device.browser.edge) {
					return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;

				} else if (Device.browser.firefox || (Device.browser.safari && Device.browser.version >= 10)) {
					// Firefox and Safari 10+ behave the same although Safari is a WebKit browser
					return oDomRef.scrollWidth + oDomRef.scrollLeft - oDomRef.clientWidth;

				} else if (Device.browser.webkit) {
					// WebKit browsers (except Safari 10+, as it's handled above)
					return oDomRef.scrollLeft;

				} else {
					// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
					return oDomRef.scrollLeft;
				}

			} else { // SETTER code
				oDomRef.scrollLeft = denormalizeScrollLeftRTL(iPos, oDomRef);
				return this;
			}
		}
	};

	jQuery.fn.scrollLeftRTL = fnScrollLeftRTL;

	return jQuery;

});

