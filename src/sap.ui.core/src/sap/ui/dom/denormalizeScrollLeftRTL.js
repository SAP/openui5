/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/util/_FeatureDetection"], function(_FeatureDetection) {
	"use strict";

	var fnDenormalize;

	if (_FeatureDetection.initialScrollPositionIsZero()) {
		//actual chrome/safari/ff
		fnDenormalize = function(iNormalizedScrollLeft, oDomRef) {
			return oDomRef.clientWidth + iNormalizedScrollLeft - oDomRef.scrollWidth;
		};
	} else {
		//legacy chrome
		fnDenormalize = function(iNormalizedScrollLeft, oDomRef) {
			return iNormalizedScrollLeft;
		};
	}

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
	 * @since 1.58
	 * @param {int} iNormalizedScrollLeft The distance from the leftmost position to which the element should be scrolled
	 * @param {Element} oDomRef The DOM Element to which scrollLeft will be applied
	 * @return {int} The scroll position that must be set for the DOM element
	 * @public
	 * @alias module:sap/ui/dom/denormalizeScrollLeftRTL
	 */
	var fnDenormalizeScrollLeftRTL = function(iNormalizedScrollLeft, oDomRef) {
		if (oDomRef) {
			return fnDenormalize(iNormalizedScrollLeft, oDomRef);
		}
	};

	return fnDenormalizeScrollLeftRTL;

});
