/**
 * The polyfill snippets are taken from ui5loader-compat
 */
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/XHRProxy',
	'sap/ui/thirdparty/es6-promise'
], function(Device, xhrProxy, ES6Promise) {
	'use strict';

	var fnPolyFill = function() {
		// The native Promise in MS Edge and Apple Safari is not fully compliant with the ES6 spec for promises.
		// MS Edge executes callbacks as tasks, not as micro tasks (see https://connect.microsoft.com/IE/feedback/details/1658365).
		// We therefore enforce the use of the es6-promise polyfill also in MS Edge and Safari, which works properly.
		// @see jQuery.sap.promise
		if (window.Promise !== ES6Promise.Promise && (Device.browser.edge || Device.browser.safari)) {
			window.Promise = undefined; // if not unset, the polyfill assumes that the native Promise is fine
		}

		// Enable promise polyfill if native promise is not available
		if (!window.Promise) {
			ES6Promise.polyfill();
		}

		if (Device.browser.firefox && window.Proxy) {
			xhrProxy();
		}
	};

	return fnPolyFill;
});