/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/base/Log"
], function(Log) {
	"use strict";

	/*
	 * Returns If the DomRef of the Control is positioned behind another element
	 * <b>Note:</b> Have in mind that this functionality checks whether at least one of the edges of the DOM element of interest is positioned behind another DOM element.
     * The element of interest should be in the visible viewport of the document.
     *
	 * @param {oControl} oControl
	 * @returns {boolean} If the DomRef of the Control is positioned behind another element. If the DomRef is null or it is outside the visible viewport, returns "false".
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

        if (left < 0 || right < 0 || top < 0 || bottom < 0) {
            Log.warning("isBehindOtherElement :: Element with id " + oDomRef.id +
                " is outside the visible viewport, cannot determine whether it is behind another DOM element", this);

            return false;
        }

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