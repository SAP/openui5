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
	 * Mobile browsers fire mouse events after touch events with a delay (~300ms)
	 * Some modern mobile browsers already removed the delay under some condition. Those browsers are:
	 *  1. iOS Safari in iOS 8 (except UIWebView / WKWebView).
	 *  2. Chrome on Android from version 32 (exclude the Samsung stock browser which also uses Chrome kernel)
	 *
	 * @function
	 * @private
	 * @param {Navigator} oNavigator the window navigator object
	 * @name sap.base.events.isMouseEventDelayed
	 * @returns {boolean} True if the mouse event is delayed
	 */
	var isMouseEventDelayed = function(oNavigator) {
		oNavigator = oNavigator || navigator;
		return !!(Device.browser.mobile &&
			!(
				(Device.os.ios && Device.os.version >= 8 && Device.browser.safari && !Device.browser.webview) ||
				(Device.browser.chrome && !/SAMSUNG/.test(oNavigator.userAgent) && Device.browser.version >= 32)
			)
		);
	};

	return isMouseEventDelayed;

});