/*!
 * ${copyright}
 */

// Provides utility class sap.ui.core.BusyIndicatorUtils
sap.ui.define(['jquery.sap.global'], //require of sap/ui/core/library not possible due to cyclic dependencies
	function(jQuery) {
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
	 * @param {String} sSize either "Large" or "Medium". Other sizes will be mapped to "Medium"
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
		oContainer.setAttribute("role", "progressbar");
		oContainer.setAttribute("aria-valuemin", "0");
		oContainer.setAttribute("aria-valuemax", "100");
		oContainer.setAttribute("alt", "");
		oContainer.setAttribute("tabIndex", "0");

		// set title for screen reader
		var oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
		var sTitle = oResBundle.getText("BUSY_TEXT");
		oContainer.setAttribute("title", sTitle);

		// determine automation size class
		var oAnimation = document.createElement("div");
		oAnimation.className = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimStandard";
		oAnimation.appendChild(document.createElement("div"));
		oAnimation.appendChild(document.createElement("div"));
		oAnimation.appendChild(document.createElement("div"));

		oContainer.appendChild(oAnimation);

		return oContainer;
	};

	/**
	 * Adds the BusyIndicator to the given control.
	 *
	 * @param {jQuery} $control a jQuery DOM instance to which the busy
	 *                     indicator is added
	 * @param {string} sBusyIndicatorId the actual DOM ID which will be used for
	 *                     the busy indicator content
	 * @param {sap.ui.core.BusyIndicatorSize} sSize either "Auto", "Large", "Medium" or "Small", determines the size of the
	 *                     indicator, default is "Medium"
	 * @returns {object} a jQuery object for the busy indicator
	 */
	BusyIndicatorUtils.addHTML = function ($control, sBusyIndicatorId, sSize) {
		var oElement = BusyIndicatorUtils.getElement(sSize),
			sSizeClass = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimStandard",
			oAnimation = oElement.children[0];

		oElement.id = sBusyIndicatorId;

		var oDomRef = $control.get(0);
		oDomRef.appendChild(oElement);
		oDomRef.className += " sapUiLocalBusy";

		// handle animation size
		if (sSize === sap.ui.core.BusyIndicatorSize.Small) {
			sSizeClass = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimSmall";
		} else if (sSize === sap.ui.core.BusyIndicatorSize.Auto) {
			//set standard animation for width calculation
			oAnimation.className = sSizeClass;
			var iWidth = oAnimation.offsetWidth;

			// We can only determine the actual animation after the browser has
			// calculated the size of the indicator we need to know the pixel-size of
			// 3rem, under which the indicator will animate differently
			if ($control[0].offsetWidth < iWidth) {
				sSizeClass = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimSmall";
			}
		}
		oAnimation.className = sSizeClass;

		//Set the actual DOM Element to 'aria-busy'
		$control.attr('aria-busy', true);

		return jQuery(oElement);
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
