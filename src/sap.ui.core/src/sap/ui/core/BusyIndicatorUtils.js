/*!
 * ${copyright}
 */

// Provides utility class sap.ui.core.BusyIndicatorUtils
sap.ui.define(['./BlockLayerUtils', 'sap/ui/core/library'],
	function(BlockLayerUtils, coreLibrary) {
	"use strict";

	// Static class

	/**
	 * @alias sap.ui.core.BusyIndicatorUtils
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core, sap.chart
	 */
	var BusyIndicatorUtils = function() {};

	var BusyIndicatorSize = coreLibrary.BusyIndicatorSize;

	/**
	 * Returns the HTML content for the busy indicator
	 * styling + animation: LocalBusyIndicator.less
	 *
	 * @param {string} sSize either "Large", "Medium" or "Section". Other sizes will be mapped to "Medium"
	 * @returns {Element} the element for the busy indicator
	 * @private
	 * @ui5-restricted sap.ui.core, sap.chart
	 */
	BusyIndicatorUtils.getElement = function(sSize) {
		var sSizeClass;

		switch (sSize) {
			case BusyIndicatorSize.Large:
				sSizeClass = "sapUiLocalBusyIndicatorSizeBig sapUiLocalBusyIndicatorShowContainer";
				break;
			case BusyIndicatorSize.Medium:
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				break;
			case BusyIndicatorSize.Section:
				sSizeClass = "sapUiLocalBusyIndicatorSizeSection sapUiLocalBusyIndicatorShowContainer";
				break;
			default:
				//default size is medium
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				break;
		}

		var oContainer = document.createElement("div");
		oContainer.className = "sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";

		BlockLayerUtils.addAriaAttributes(oContainer);

		addAnimation(oContainer);

		return oContainer;
	};

	function addAnimation(oContainer, sSizeClass) {
		sSizeClass  = sSizeClass || "sapUiLocalBusyIndicatorAnimStandard";

		// determine automation size class
		var oAnimation = document.createElement("div");
		oAnimation.className = "sapUiLocalBusyIndicatorAnimation " + sSizeClass;
		oAnimation.appendChild(document.createElement("div"));
		oAnimation.appendChild(document.createElement("div"));
		oAnimation.appendChild(document.createElement("div"));


		oContainer.appendChild(oAnimation);
	}

	function handleAutoAnimationSize(oBusyBlockState, sSize) {
		var oParentDOM = oBusyBlockState.$parent.get(0),
			oBlockLayerDOM = oBusyBlockState.$blockLayer.get(0);

		// get animation container
		var oAnimation = oBlockLayerDOM.children[0],
			iWidth = oAnimation.offsetWidth;

		// We can only determine the actual animation after the browser has
		// calculated the size of the indicator we need to know the pixel-size of
		// 3rem, under which the indicator will animate differently
		if (oParentDOM.offsetWidth < iWidth) {
			oAnimation.className = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimSmall";
		}
	}

	/**
	 * Adds the DOM element for the BusyIndicator animation to the contained DOM element in the given block-state.
	 * @param {object} oBusyBlockState The given block-state on which the DOM gets added for the busy animation
	 * @param {sap.ui.core.BusyIndicatorSize} sSize either "Auto", "Large", "Medium" or "Small", determines the size of the
	 *                     indicator, default is "Medium"
	 * @see sap.ui.core.BusyIndicatorSize
	 */
	BusyIndicatorUtils.addHTML = function (oBusyBlockState, sSize) {
		var sSizeClass, sAnimationSizeClass;

		switch (sSize) {
			case BusyIndicatorSize.Small:
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimSmall";
				break;
			case BusyIndicatorSize.Section:
				sSizeClass = "sapUiLocalBusyIndicatorSizeSection sapUiLocalBusyIndicatorShowContainer";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard ";
				break;
			case BusyIndicatorSize.Large:
				sSizeClass = "sapUiLocalBusyIndicatorSizeBig sapUiLocalBusyIndicatorShowContainer";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
				break;
			case BusyIndicatorSize.Auto:
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
				break;
			default:
				//default size is medium
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
				break;
		}

		if (!oBusyBlockState) {
			return;
		}

		var oParentDOM = oBusyBlockState.$parent.get(0),
			oBlockLayerDOM = oBusyBlockState.$blockLayer.get(0);

		oParentDOM.className += " sapUiLocalBusy";
		oBlockLayerDOM.className += " sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";
		addAnimation(oBlockLayerDOM, sAnimationSizeClass);

		if (sSize === BusyIndicatorSize.Auto) {
			handleAutoAnimationSize(oBusyBlockState);
		}
	};

	return BusyIndicatorUtils;

}, /* bExport= */ true);
