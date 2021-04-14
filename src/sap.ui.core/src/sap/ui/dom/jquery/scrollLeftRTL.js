/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/dom/denormalizeScrollLeftRTL", "sap/ui/util/_FeatureDetection", "sap/ui/thirdparty/jquery"
], function(denormalizeScrollLeftRTL, _FeatureDetection, jQuery) {
	"use strict";

	var fnScroll;

	if (_FeatureDetection.initialScrollPositionIsZero()) {
		// actual chrome/safari/ff
		fnScroll = function(oDomRef) {
			return oDomRef.scrollWidth + oDomRef.scrollLeft - oDomRef.clientWidth;
		};
	} else {
		//legacy chromium
		fnScroll = function(oDomRef) {
			return oDomRef.scrollLeft;
		};
	}

	/**
	 * This module provides the {@link jQuery#scrollLeftRTL} API.
	 *
	 * @namespace
	 * @name module:sap/ui/dom/jquery/scrollLeftRTL
	 * @public
	 * @since 1.58
	 */

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
	 * @public
	 * @name jQuery#scrollLeftRTL
	 * @author SAP SE
	 * @since 0.20.0
	 * @function
	 * @requires module:sap/ui/dom/jquery/scrollLeftRTL
	 */
	var fnScrollLeftRTL = function(iPos) {
		var oDomRef = this.get(0);
		if (oDomRef) {
			if (iPos === undefined) { // GETTER code
				return fnScroll(oDomRef);
			} else { // SETTER code
				oDomRef.scrollLeft = denormalizeScrollLeftRTL(iPos, oDomRef);
				return this;
			}
		}
	};

	jQuery.fn.scrollLeftRTL = fnScrollLeftRTL;

	return jQuery;

});

