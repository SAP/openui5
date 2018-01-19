/*!
* ${copyright}
*/

sap.ui.define(function () {
	"use strict";

	/**
	 * Slider utilities.
	 * @namespace
	 */
	var SliderUtilities = {};

	SliderUtilities.CONSTANTS = {
		CHARACTER_WIDTH_PX: 8,
		F2_KEYCODE: 113,
		RANGE_MOVEMENT_THRESHOLD : 32, // Defines threshold for entire range movement (px)
		HANDLE_CLASS: "sapMSliderHandle",
		RANGE_SLIDER_NAME: "sap.m.RangeSlider",
		TOOLTIP_CLASS: "sapMSliderTooltip",
		SLIDER_SIDE_PADDING: 17,
		TOOLTIP_SIDE_PADDING: 8,
		TOOLTIP_CONTAINER_HEIGHT: 32,
		HANDLE_HALF_WIDTH: 16,
		TOOLTIP_BORDER: 1,
		FOLLOW_OF_TOLERANCE: 24,
		TICKMARKS: {
			MAX_POSSIBLE: 100,
			MIN_SIZE: {
				SMALL: 8,
				WITH_LABEL: 80
			}
		}
	};

	/**
	 * Calculate percentage.
	 *
	 * @param {float} fValue
	 * @param {float} fMin Min property of the Slider/RangeSlider.
	 * @param {float} fMax Max property of the Slider/RangeSlider.
	 * @private
	 * @return {float} percent
	 */
	SliderUtilities.getPercentOfValue = function (fValue, fMin, fMax) {
		return ((fValue - fMin) / (fMax - fMin)) * 100;
	};

	/**
	 * Gets a first scrollable parent of a DOM node.
	 *
	 * @param {HTMLElement} oDomRef A HTML element
	 * @private
	 * @return {HTMLElement}
	 */
	SliderUtilities.getElementScrollableParent = function (oDomRef) {
		if (!oDomRef) {
			return document.body;
		}

		if (oDomRef.scrollHeight >= oDomRef.clientHeight) {
			return oDomRef;
		}

		return this.getElementScrollableParent(oDomRef.parentNode);
	};

	/**
	 * Determines if an Element is visible in a scrollable container.
	 *
	 * @param {HTMLElement} oElement A Element to be checked
	 * @param {HTMLElement} oContainer A container.
	 * @private
	 * @return {boolean}
	 */
	SliderUtilities.isScrolledIntoView = function (oElement, oContainer) {
		if (!(oElement || oElement.getBoundingClientRect) || !(oContainer || oContainer.getBoundingClientRect)) {
			return false;
		}

		var oContainerRect = oContainer.getBoundingClientRect(),
			oContainerTop = oContainerRect.top,
			oElementTop = oElement.getBoundingClientRect().top,
			bElementOverflowsTop = (oContainerTop - this.CONSTANTS.FOLLOW_OF_TOLERANCE) > oElementTop,
			bElementOverflowsBottom = (oContainerTop + oContainerRect.height - this.CONSTANTS.FOLLOW_OF_TOLERANCE) < oElementTop;

		if (bElementOverflowsTop || bElementOverflowsBottom) {
			return false;
		}

		return true;
	};

	return SliderUtilities;
});
