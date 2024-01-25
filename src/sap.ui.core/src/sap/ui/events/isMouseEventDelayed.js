/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/Device"], function(Device) {
	"use strict";

	/**
	 * Whether the current browser fires mouse events after touch events with long delay (~300ms).
	 *
	 * Currently, only UIWebView in iOS still has the long delay between the touch and the mouse events.
	 * Because UIWebView is deprecated and replaced with WKWebView since iOS 12 and we only support the newest
	 * version, this function now always returns <code>false</code>
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/ui/events/isMouseEventDelayed
	 * @param {object} [oNavigator] The custom window.navigator object reserved for unit test
	 * @returns {boolean} True if the mouse event is delayed
	 * @private
	 * @deprecated
	 * @ui5-restricted sap.ui.core
	 */
	var isMouseEventDelayed = function(oNavigator) {
		return false;
	};

	return isMouseEventDelayed;

});