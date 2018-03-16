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
	 * For the given scroll position measured from the "beginning" of a container (the right edge in RTL mode)
	 * this method returns the scrollLeft value as understood by the current browser in RTL mode.
	 * This value is specific to the given DOM element, as the computation may involve its dimensions.
	 *
	 * So when oDomRef should be scrolled 2px from the beginning, the number "2" must be given as <code>iNormalizedScrollBegin</code>
	 * and the result of this method (which may be a large or even negative number, depending on the browser) can then be set as
	 * <code>oDomRef.scrollLeft</code> to achieve the desired (cross-browser-consistent) scrolling position.
	 * Low values make the right part of the content visible, high values the left part.
	 *
	 * This method does no scrolling on its own, it only calculates the value to set (so it can also be used for animations).
	 *
	 * Only use this method in RTL mode, as the behavior in LTR mode is undefined and may change!
	 *
	 * @function
	 * @param {int} iNormalizedScrollBegin The distance from the rightmost position to which the element should be scrolled
	 * @param {Element} oDomRef The DOM Element to which scrollLeft will be applied
	 * @return {int} The scroll position that must be set for the DOM element
	 * @private
	 * @author SAP SE
	 * @exports sap/ui/dom/denormalizeScrollBeginRTL
	 */
	var fnDenormalizeScrollBeginRTL = function(iNormalizedScrollBegin, oDomRef) {

		if (oDomRef) {
			if (Device.browser.msie) {
				return iNormalizedScrollBegin;

			} else if (Device.browser.webkit) {
				return oDomRef.scrollWidth - oDomRef.clientWidth - iNormalizedScrollBegin;

			} else if (Device.browser.firefox) {
				return -iNormalizedScrollBegin;

			} else {
				// unrecognized browser; it is hard to return a best guess, as browser strategies are very different, so return the actual value
				return iNormalizedScrollBegin;
			}
		}
	};

	return fnDenormalizeScrollBeginRTL;

});

