/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/util/_FeatureDetection", "sap/ui/thirdparty/jquery"], function(_FeatureDetection, jQuery) {
	"use strict";

	var fnScroll;

	if (_FeatureDetection.initialScrollPositionIsZero()) {
		// actual chrome/safari/ff
		fnScroll = function(oDomRef) {
			return (-oDomRef.scrollLeft);
		};
	} else {
		//legacy chromium
		fnScroll = function(oDomRef) {
			return oDomRef.scrollWidth - oDomRef.scrollLeft - oDomRef.clientWidth;
		};
	}

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
			return fnScroll(oDomRef);
		}
	};

	jQuery.fn.scrollRightRTL = fnScrollRightRTL;

	return jQuery;
});

