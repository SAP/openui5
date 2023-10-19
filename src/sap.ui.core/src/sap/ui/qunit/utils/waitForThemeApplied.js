/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Theming"
], (
	Core,
	Theming
) => {
	"use strict";

	/**
	 * Checks whether the theme has already been applied and if not, waits for the
	 * 'applied' event to be fired.
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
	const waitForThemeApplied = () => {
		let bCoreIsReady = false;
		Core.ready(() => {
			bCoreIsReady = true;
		});

		if (!bCoreIsReady) {
			return Promise.reject(new Error("UI5 Core must be loaded and booted before using the sap/ui/qunit/utils/waitForThemeApplied module"));
		}

		return new Promise((resolve /*, reject*/) => {
			Theming.attachAppliedOnce(resolve);
		});
	};

	return waitForThemeApplied;
});
