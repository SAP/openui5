/**
 * The polyfill snippets are taken from ui5loader-compat
 */
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/syncXHRFix',
	'sap/ui/thirdparty/es6-promise'
], function(Device, syncXHRFix, ES6Promise) {
	'use strict';

	var fnPolyFill = function() {

		// Enable promise polyfill if native promise is not available
		if (!window.Promise) {
			ES6Promise.polyfill();
		}

		if (Device.browser.firefox && window.Proxy) {
			syncXHRFix();
		}
	};

	return fnPolyFill;
});