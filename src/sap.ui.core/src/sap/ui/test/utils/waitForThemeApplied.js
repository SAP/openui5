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
	 * Returns a rejected promise if the Core is not ready yet.
	 *
	 * <b>Note:</b> No module from <code>sap/ui/test</code> should be used for productive coding!
	 *
	 * @example <caption>This module can be used to delay the QUnit test start.
	 * When using the Test Starter, the Promise can be returned from the test module.</caption>
	 *   sap.ui.define([
	 *     ...
	 *     "sap/ui/test/utils/waitForThemeApplied"
	 *   ], function(..., waitForThemeApplied) {
	 *     "use strict";
	 *
	 *      QUnit.test( ... );
	 *      ...
	 *
	 *     return waitForThemeApplied();
	 *   });
	 *
	 * @alias module:sap/ui/test/utils/waitForThemeApplied
	 * @public
	 * @since 1.127
	 * @returns {Promise<undefined>} Promise that resolves when the theme has been applied
	 */
	const waitForThemeApplied = () => {
		let bCoreIsReady = false;
		Core.ready(() => {
			bCoreIsReady = true;
		});

		if (!bCoreIsReady) {
			return Promise.reject(new Error("UI5 Core must be loaded and booted before using the sap/ui/test/utils/waitForThemeApplied module"));
		}

		return new Promise((resolve /*, reject*/) => {
			Theming.attachAppliedOnce(resolve);
		});
	};

	return waitForThemeApplied;
});
