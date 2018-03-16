/*!
 * ${copyright}
 */

// Provides utility class sap.ui.core.BusyIndicatorUtils
sap.ui.define(['jquery.sap.global', './BlockLayerUtils'], //require of sap/ui/core/library not possible due to cyclic dependencies
	function(jQuery, BlockLayerUtils) {
	"use strict";

	// Static class

	/**
	 * @alias sap.ui.core.BusyIndicatorUtils
	 * @namespace
	 * @public
	 */
	var BusyIndicatorUtils = function() {};

	/**
	 * Returns the HTML content for the busy indicator
	 * styling + animation: LocalBusyIndicator.less
	 *
	 * @param {string} sSize either "Large" or "Medium". Other sizes will be mapped to "Medium"
	 * @returns {DOM.element} the element for the busy indicator
	 */
	BusyIndicatorUtils.getElement = function(sSize) {
		//default size is medium
		var sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";

		if (sSize === "Large") {
			sSizeClass = "sapUiLocalBusyIndicatorSizeBig";
		}

		var oContainer = document.createElement("div");
		oContainer.className = "sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";

		BlockLayerUtils.addAriaAttributes(oContainer);

		addAnimation(oContainer);

		return oContainer;
	};

	function addAnimation(oContainer, sSizeClass) {

		sSizeClass  = sSizeClass || "sapUiLocalBusyIndicatorAnimStandard";

		// set title for screen reader
		var oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core"),
			sTitle = oResBundle.getText("BUSY_TEXT");

		oContainer.setAttribute("title", sTitle);

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
		var sSizeClass = "sapUiLocalBusyIndicatorSizeMedium",
			sAnimationSizeClass;

		switch (sSize) {
			case sap.ui.core.BusyIndicatorSize.Small:
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimSmall";
				break;
			case sap.ui.core.BusyIndicatorSize.Large:
				sSizeClass = "sapUiLocalBusyIndicatorSizeBig";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
				break;
			case sap.ui.core.BusyIndicatorSize.Auto:
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
				break;
			default:
				//default size is medium
				sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
				sAnimationSizeClass = "sapUiLocalBusyIndicatorAnimStandard";
				break;
		}
		var oParentDOM = oBusyBlockState.$parent.get(0),
			oBlockLayerDOM = oBusyBlockState.$blockLayer.get(0);

		oParentDOM.className += " sapUiLocalBusy";
		oBlockLayerDOM.className += " sapUiLocalBusyIndicator " + sSizeClass + " sapUiLocalBusyIndicatorFade";
		addAnimation(oBlockLayerDOM, sAnimationSizeClass);

		if (sSize === sap.ui.core.BusyIndicatorSize.Auto) {
			handleAutoAnimationSize(oBusyBlockState);
		}
		//Set the actual DOM Element to 'aria-busy'
		jQuery(oParentDOM).attr('aria-busy', true);
	};

	/**
	 * Obsolete IE9 support, kept for some more time to avoid issues with custom controls,
	 * start/stop now are 'noop's.
	 */
	BusyIndicatorUtils.animateIE9 = {
		start: function () {},
		stop: function () {}
	};

	return BusyIndicatorUtils;

}, /* bExport= */ true);
