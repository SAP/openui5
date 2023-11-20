/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/util/_FeatureDetection"], function(_FeatureDetection) {
	"use strict";

	var fnDenormalize;

	if (_FeatureDetection.initialScrollPositionIsZero()) {
		//actual chrome/safari/ff
		fnDenormalize = function(iNormalizedScrollBegin, oDomRef) {
			return -iNormalizedScrollBegin;
		};
	} else {
		//legacy chrome
		fnDenormalize = function(iNormalizedScrollBegin, oDomRef) {
			return oDomRef.scrollWidth - oDomRef.clientWidth - iNormalizedScrollBegin;
		};
	}

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
	 * @since 1.58
	 * @param {int} iNormalizedScrollBegin The distance from the rightmost position to which the element should be scrolled
	 * @param {Element} oDomRef The DOM Element to which scrollLeft will be applied
	 * @return {int} The scroll position that must be set for the DOM element
	 * @public
	 * @alias module:sap/ui/dom/denormalizeScrollBeginRTL
	 */
	var fnDenormalizeScrollBeginRTL = function(iNormalizedScrollBegin, oDomRef) {
		if (oDomRef) {
			return fnDenormalize(iNormalizedScrollBegin, oDomRef);
		}
	};

	return fnDenormalizeScrollBeginRTL;

});

