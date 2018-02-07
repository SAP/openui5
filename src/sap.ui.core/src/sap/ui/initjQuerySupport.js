/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/Device"], function(jQuery, Device) {

	"use strict";

	var _bInitialized = false;

	return function() {

		if (_bInitialized) {
			return jQuery;
		} else {
			_bInitialized = true;
		}
		/**
		 * Holds information about the browser's capabilities and quirks.
		 * This object is provided and documented by jQuery.
		 * But it is extended by SAPUI5 with detection for features not covered by jQuery. This documentation ONLY covers the detection properties added by UI5.
		 * For the standard detection properties, please refer to the jQuery documentation.
		 *
		 * These properties added by UI5 are only available temporarily until jQuery adds feature detection on their own.
		 *
		 * @name jQuery.support
		 * @namespace
		 * @private
		 */

		if (!jQuery.support) {
			jQuery.support = {};
		}

		jQuery.extend(jQuery.support, {touch: Device.support.touch}); // this is also defined by jquery-mobile-custom.js, but this information is needed earlier

		var aPrefixes = ["Webkit", "ms", "Moz"];
		var oStyle = document.documentElement.style;

		var preserveOrTestCssPropWithPrefixes = function(detectionName, propName) {
			if (jQuery.support[detectionName] === undefined) {

				if (oStyle[propName] !== undefined) { // without vendor prefix
					jQuery.support[detectionName] = true;
					// If one of the flex layout properties is supported without the prefix, set the flexBoxPrefixed to false
					if (propName === "boxFlex" || propName === "flexOrder" || propName === "flexGrow") {
						// Exception for Chrome up to version 28
						// because some versions implemented the non-prefixed properties without the functionality
						if (!Device.browser.chrome || Device.browser.version > 28) {
							jQuery.support.flexBoxPrefixed = false;
						}
					}
					return;

				} else { // try vendor prefixes
					propName = propName.charAt(0).toUpperCase() + propName.slice(1);
					for (var i in aPrefixes) {
						if (oStyle[aPrefixes[i] + propName] !== undefined) {
							jQuery.support[detectionName] = true;
							return;
						}
					}
				}
				jQuery.support[detectionName] = false;
			}
		};

		/**
		 * Whether the current browser supports (2D) CSS transforms
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssTransforms
		 */
		preserveOrTestCssPropWithPrefixes("cssTransforms", "transform");

		/**
		 * Whether the current browser supports 3D CSS transforms
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssTransforms3d
		 */
		preserveOrTestCssPropWithPrefixes("cssTransforms3d", "perspective");

		/**
		 * Whether the current browser supports CSS transitions
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssTransitions
		 */
		preserveOrTestCssPropWithPrefixes("cssTransitions", "transition");

		/**
		 * Whether the current browser supports (named) CSS animations
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssAnimations
		 */
		preserveOrTestCssPropWithPrefixes("cssAnimations", "animationName");

		/**
		 * Whether the current browser supports CSS gradients. Note that ANY support for CSS gradients leads to "true" here, no matter what the syntax is.
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssGradients
		 */
		if (jQuery.support.cssGradients === undefined) {
			var oElem = document.createElement('div'),
			oStyle = oElem.style;
			try {
				oStyle.backgroundImage = "linear-gradient(left top, red, white)";
				oStyle.backgroundImage = "-moz-linear-gradient(left top, red, white)";
				oStyle.backgroundImage = "-webkit-linear-gradient(left top, red, white)";
				oStyle.backgroundImage = "-ms-linear-gradient(left top, red, white)";
				oStyle.backgroundImage = "-webkit-gradient(linear, left top, right bottom, from(red), to(white))";
			} catch (e) {/* no support...*/}
			jQuery.support.cssGradients = (oStyle.backgroundImage && oStyle.backgroundImage.indexOf("gradient") > -1);

			oElem = null; // free for garbage collection
		}

		/**
		 * Whether the current browser supports only prefixed flexible layout properties
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.flexBoxPrefixed
		 */
		jQuery.support.flexBoxPrefixed = true;	// Default to prefixed properties

		/**
		 * Whether the current browser supports the OLD CSS3 Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.flexBoxLayout
		 */
		preserveOrTestCssPropWithPrefixes("flexBoxLayout", "boxFlex");

		/**
		 * Whether the current browser supports the NEW CSS3 Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.newFlexBoxLayout
		 */
		preserveOrTestCssPropWithPrefixes("newFlexBoxLayout", "flexGrow");	// Use a new property that IE10 doesn't support

		/**
		 * Whether the current browser supports the IE10 CSS3 Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.ie10FlexBoxLayout
		 */
		// Just using one of the IE10 properties that's not in the new FlexBox spec
		if (!jQuery.support.newFlexBoxLayout && oStyle.msFlexOrder !== undefined) {
			jQuery.support.ie10FlexBoxLayout = true;
		} else {
			jQuery.support.ie10FlexBoxLayout = false;
		}

		/**
		 * Whether the current browser supports any kind of Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.hasFlexBoxSupport
		 */
		if (jQuery.support.flexBoxLayout || jQuery.support.newFlexBoxLayout || jQuery.support.ie10FlexBoxLayout) {
			jQuery.support.hasFlexBoxSupport = true;
		} else {
			jQuery.support.hasFlexBoxSupport = false;
		}

		return jQuery;
	};

});
