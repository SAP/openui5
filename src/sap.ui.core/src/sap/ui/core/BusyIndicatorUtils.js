/*!
 * ${copyright}
 */

// Provides utility class sap.ui.core.BusyIndicatorUtils
sap.ui.define(['jquery.sap.global', 'sap/ui/Device'],
	function(jQuery, Device) {
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
	 * @param {string} sSize either "Medium" or "Big", determines the size of the indicator
	 * @returns {DOM.element} the element for the busy indicator
	 */
	BusyIndicatorUtils.getElement = function(sSize) {
		//default size is medium
		var sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
		if (sSize === "Big") {
			sSizeClass = "sapUiLocalBusyIndicatorSizeBig";
		}

		var oContainer = document.createElement("div");
		oContainer.className = "sapUiLocalBusyIndicator " + sSizeClass;
		oContainer.setAttribute("role", "progressbar");
		oContainer.setAttribute("aria-valuemin", "0");
		oContainer.setAttribute("aria-valuemax", "100");
		oContainer.setAttribute("alt", "");
		oContainer.setAttribute("tabIndex", "0");

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
	 * @param {string} sSize either "Medium" or "Big", determines the size of the
	 *                     indicator, default is "Medium"
	 * @returns {object} a jQuery object for the busy indicator
	 */
	BusyIndicatorUtils.addHTML = function ($control, sBusyIndicatorId, sSize) {
		var oElement = BusyIndicatorUtils.getElement(sSize);
		oElement.id = sBusyIndicatorId;

		var oDomRef = $control.get(0);
		oDomRef.appendChild(oElement);
		oDomRef.className += " sapUiLocalBusy";

		var vAnimation = oElement.children[0];
		var iWidth = vAnimation.offsetWidth;

		// with 'offsetWidth' the browser is forced to render the added
		// BusyIndicator and then we add the fade in Class
		oElement.className += " sapUiLocalBusyIndicatorFade";

		// We can only determine the actual animation after the browser has
		// calculated the size of the indicator we need to know the pixel-size of
		// 3rem, under which the indicator will animate differently
		if ($control[0].offsetWidth < iWidth) {
			vAnimation.className = "sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimSmall";
		}

		//Set the actual DOM Element to 'aria-busy'
		$control.attr('aria-busy', true);

		return jQuery(oElement);
	};

	/**
	 * Pragmatic IE9 support, looks a bit different than the keyframes anymation.
	 * TODO: Is this needed? When will IE9 go out of support.
	 */
	BusyIndicatorUtils.animateIE9 = {
		/**
		 * Starts the Animation for the given busy indicator (jQuery instance)
		 *
		 * @param {object} $BusyIndicator is the jQuery object of the busyIndicator
		 */
		start: function ($BusyIndicator) {

			if ($BusyIndicator && Device.browser.msie &&  Device.browser.version <= 9) {

				var fnAnimate = function ($div, iDelay) {
					var fnScale = function (iTo) {
						$div.animate({ opacity: iTo }, {
							step: function (now) {
								$div.css("-ms-transform","scale(" + now + "," + now + ")");
							},
							complete: function () {
								// start again, but the scale factor
								fnScale(iTo == 1 ? 0.3 : 1);
							},
							duration: 700
						}, "linear");
					};
					setTimeout(function(){fnScale(0.3);}, iDelay);
				};

				var aDivsToAnimate = $BusyIndicator.find(".sapUiLocalBusyIndicatorAnimation > div");

				for (var i = 0; i < aDivsToAnimate.length; i++) {
					fnAnimate(jQuery(aDivsToAnimate[i]), i * 300);
				}

			}

		},

		/**
		 * Stops the Animation for the given busy indicator (jQuery instance)
		 *
		 * @param {object} $BusyIndicator is the jQuery object of the BusyIndicator
		 */
		stop: function ($BusyIndicator) {
			if ($BusyIndicator && Device.browser.msie &&  Device.browser.version <= 9) {
				var aDivsToAnimate = $BusyIndicator.find(".sapUiLocalBusyIndicatorAnimation > div");
				for (var i = 0; i < aDivsToAnimate.length; i++) {
					jQuery(aDivsToAnimate[i]).stop();
				}
			}
		}
	};

	return BusyIndicatorUtils;

}, /* bExport= */ true);
