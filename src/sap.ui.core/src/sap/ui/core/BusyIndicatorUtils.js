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
	 * @param {string} sSize either "Medium" or "Big", determines the size of the indicator
	 * @returns {string} the HTML snippet for the busy indicator
	 */
	BusyIndicatorUtils.getHTML = function (sSize) {
		//default size is medium
		var sSizeClass = "sapUiLocalBusyIndicatorSizeMedium";
		if (sSize == "Big") {
			sSizeClass = "sapUiLocalBusyIndicatorSizeBig";
		}
		var sTemplate = 
		'<div class="sapUiLocalBusyIndicator ' + sSizeClass + '" aria-role="progressbar" aria-valuemin="0" aria-valuemax="100" role="progressbar" alt="" tabindex="0">' + 
			'<div class="sapUiLocalBusyIndicatorAnimation sapUiLocalBusyIndicatorAnimStandard">' +
				'<div></div>' +
				'<div></div>' +
				'<div></div>' +
			'</div>' +
		'</div>';
		return sTemplate;
	};

	/**
	 * Adds the BusyIndicator HTML to the given control.
	 * @param {sap.ui.core.Control} oControl the control instance to which the busy indicator is added
	 * @param {string} sSize either "Medium" or "Big", determines the size of the indicator
	 * @returns {object} a jQuery object for the busy indicator
	 */
	BusyIndicatorUtils.addHTML = function (oControl, sSize) {
		var $control = oControl.$();
		var sBusyIndicatorId = oControl.getId() + "-busyIndicator";
		
		var $html = jQuery(BusyIndicatorUtils.getHTML(sSize));
		$html.attr("id", sBusyIndicatorId);
		
		$control.append($html);
		$control.addClass('sapUiLocalBusy');
		
		var $animation = $html.children(".sapUiLocalBusyIndicatorAnimation");
		var iWidth = $animation[0].offsetWidth;
		
		if ($control[0].offsetWidth < iWidth) {
			//this class is initially used to determine the pixel-size of 3rem
			$animation.removeClass("sapUiLocalBusyIndicatorAnimStandard");
			$animation.addClass("sapUiLocalBusyIndicatorAnimSmall");
		}
		
		//Set the actual DOM Element to 'aria-busy'
		$control.attr('aria-busy', true);
		
		return $html;
	};
	
	/**
	 * Pragmatic IE9 support, looks a bit different than the keyframes anymation.
	 * TODO: Is this needed? When will IE9 go out of support.
	 */
	BusyIndicatorUtils.animateIE9 = {
		/**
		 * Starts the Animation for the given busy indicator (jQuery instance)
		 */
		start: function ($BusyIndicator) {
			
			if ($BusyIndicator && Device.browser.msie &&  Device.browser.version <= 9) {

				var fnAnimate = function ($div, iDelay) {
					var fnScale = function (iTo) {
						$div.animate({  textIndent: iTo }, {
							step: function (now) { 
								jQuery(this).css("-ms-transform","scale(" + now + "," + now + ")");
								jQuery(this).css("opacity",now);
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
