/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	function isElementCoveredInPoint(iX, iY, oElem, oAllowedCoveringElem) {
		const oElementFromPoint = document.elementFromPoint(iX, iY);
		if (!oElementFromPoint) {
			return true;
		}

		return oElementFromPoint !== oElem &&
			!oElem.contains(oElementFromPoint) &&
			!oElementFromPoint.contains(oElem) &&
			(!oAllowedCoveringElem || !oAllowedCoveringElem.contains(oElementFromPoint));
	}

	/**
	 * Returns if the element is covered by another element.
	 *
	 * @param {HTMLElement} oElem Element to check
	 * @param {HTMLElement|undefined} oAllowedCoveringElem Element that is
	 * not considered as an obstacle
	 * @returns {boolean} If the element is covered by another element
	 * @alias module:sap/ui/dom/isElementCovered
	 * @private
	 * @ui5-restricted sap.m.Popover
	 */
	function isElementCovered(oElem, oAllowedCoveringElem) {
		if (!oElem) {
			return false;
		}

		var oBoundingRect = oElem.getBoundingClientRect(),
			// adjust coordinates to get more accurate results
			iLeft = oBoundingRect.left + 1,
			iRight = oBoundingRect.right - 1,
			iTop = oBoundingRect.top + 1,
			iBottom = oBoundingRect.bottom - 1;

		return isElementCoveredInPoint(iLeft, iTop, oElem, oAllowedCoveringElem) &&
			isElementCoveredInPoint(iRight, iTop, oElem, oAllowedCoveringElem) &&
			isElementCoveredInPoint(iLeft, iBottom, oElem, oAllowedCoveringElem) &&
			isElementCoveredInPoint(iRight, iBottom, oElem, oAllowedCoveringElem);
	}

	return isElementCovered;
});