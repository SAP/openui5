/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/dom/isBehindOtherElement"
], function(isBehindOtherElement) {
	"use strict";

	/*
	 * Returns If the DomRef of the Control is positioned behind another element
	 * <b>Note:</b> Have in mind that this functionality checks whether at least one of the edges of the DOM element of interest is positioned behind another DOM element.
     *
	 * @param {oControl} oControl
	 * @returns {boolean} If the DomRef of the Control is positioned behind another element
	 * @alias module:sap/ui/dom/isBehindOtherElement
	 * @experimental Since 1.110
	 * @public
	 */
	function isBehindOtherElement(oDomRef) {
        if (!oDomRef) {
            return false;
        }

        var boundingRect = oDomRef.getBoundingClientRect(),
            // adjust coordinates to get more accurate results
            left = boundingRect.left + 1,
            right = boundingRect.right - 1,
            top = boundingRect.top + 1,
            bottom = boundingRect.bottom - 1;

        if (document.elementFromPoint(left, top) !== oDomRef && !oDomRef.contains(document.elementFromPoint(left, top))) {
            return true;
        }

        if (document.elementFromPoint(right, top) !== oDomRef && !oDomRef.contains(document.elementFromPoint(right, top))) {
            return true;
        }

        if (document.elementFromPoint(left, bottom) !== oDomRef && !oDomRef.contains(document.elementFromPoint(left, bottom))) {
            return true;
        }

        if (document.elementFromPoint(right, bottom) !== oDomRef && !oDomRef.contains(document.elementFromPoint(right ,bottom))) {
            return true;
        }

        return false;
	}

	return isBehindOtherElement;
});