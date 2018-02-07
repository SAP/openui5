/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/Device"], function(Device) {
	"use strict";

	/**
	 * For the given scrollLeft value this method returns the scrollLeft value as understood by the current browser in RTL mode.
	 * This value is specific to the given DOM element, as the computation may involve its dimensions.
	 *
	 * So when oDomRef should be scrolled 2px from the leftmost position, the number "2" must be given as <code>iNormalizedScrollLeft</code>
	 * and the result of this method (which may be a large or even negative number, depending on the browser) can then be set as
	 * <code>oDomRef.scrollLeft</code> to achieve the desired (cross-browser-consistent) scrolling position.
	 *
	 * This method does no scrolling on its own, it only calculates the value to set (so it can also be used for animations).
	 *
	 * @function
	 * @param {int} iNormalizedScrollLeft The distance from the leftmost position to which the element should be scrolled
	 * @param {Element} oDomRef The DOM Element to which scrollLeft will be applied
	 * @return {int} The scroll position that must be set for the DOM element
	 * @private
	 * @author SAP SE
	 * @exports sap/ui/dom/denormalizeScrollLeftRTL
	 */
	var fnDenormalizeScrollLeftRTL = function(iNormalizedScrollLeft, oDomRef) {

		if (oDomRef) {
			if (Device.browser.msie || Device.browser.edge) {
				return oDomRef.scrollWidth - oDomRef.clientWidth - iNormalizedScrollLeft;

			} else if (Device.browser.firefox || (Device.browser.safari && Device.browser.version >= 10)) {
				// Firefox and Safari 10+ behave the same although Safari is a WebKit browser
				return oDomRef.clientWidth + iNormalizedScrollLeft - oDomRef.scrollWidth;

			} else if (Device.browser.webkit) {
				// WebKit browsers (except Safari 10+, as it's handled above)
				return iNormalizedScrollLeft;

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return iNormalizedScrollLeft;
			}
		}
	};

	return fnDenormalizeScrollLeftRTL;

});

