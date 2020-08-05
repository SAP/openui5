/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Checks whether the theme has already been applied and if not, waits for the
	 * 'ThemeChanged' event to be fired.
	 *
	 * @example <caption>This module can be used to delay the QUnit test start.
	 * When using the Test Starter, the Promise can be returned from the test module.</caption>
	 *   sap.ui.define([
	 *     ...
	 *     "sap/ui/qunit/utils/waitForThemeApplied"
	 *   ], function(..., waitForThemeApplied) {
	 *     "use strict";
	 *
	 *      QUnit.test( ... );
	 *      ...
	 *
	 *     return waitForThemeApplied();
	 *   });
	 *
	 * @returns {Promise} Promise that resolves when the theme has been applied
	 */
	var waitForThemeApplied = function() {

		if (typeof sap === "undefined" || !sap.ui || typeof sap.ui.getCore !== "function") {
			return Promise.reject(new Error("UI5 Core must be loaded and booted before using the sap/ui/qunit/utils/waitForThemeApplied module"));
		}

		return new Promise(function(resolve /*, reject*/) {
			var oCore = sap.ui.getCore();
			if (oCore.isThemeApplied()) {
				resolve();
			} else {
				var themeChanged = function() {
					resolve();
					oCore.detachThemeChanged(themeChanged);
				};
				oCore.attachThemeChanged(themeChanged);
			}
		});
	};

	return waitForThemeApplied;
});
