/*!
 * ${copyright}
 */
/*global opaTest:true, QUnit */
/**
 * Qunit test adapter for opa.js has the same signature as an asyncTest of qunit
 * @public
 * @returns {asncTest} the async qunit test wrapped by opa
 * @experimental
 */
/////////////////////
//// OPA - One Page Acceptance testing the qUnit adapter
//// Currently this is distributed with UI5 but it does not have dependencies to it.
//// The only dependency is jQuery. As i plan to get this into a separate repository, i did not use the UI5 naming conventions
/////////////////////

// Eslint thinks window.opaTest is unused
/*eslint-disable no-unused-vars */
sap.ui.define(['./Opa'], function (Opa) {
/*eslint-enable no-unused-vars */
	"use strict";
	var opaTest = function (testName, expected, callback, async) {
		var config = Opa.config;
		//Increase qunit's timeout to 90 seconds to match default OPA timeouts
		if (!QUnit.config.testTimeout) {
			QUnit.config.testTimeout  = 90000;
		}

		if (arguments.length === 2) {
			callback = expected;
			expected = null;
		}

		var testBody = function(assert) {
			var fnStart = assert.async();
			config.testName = testName;
			callback.call(this, config.arrangements, config.actions, config.assertions);

			var promise = Opa.emptyQueue();
			promise.done(function() {
				fnStart();
			});

			promise.fail(function (oOptions) {
				QUnit.ok(false, oOptions.errorMessage);
				fnStart();
			});
		};

		return QUnit.test(testName, expected, testBody, async);
	};
	// Export to global namespace to be backwards compatible
	window.opaTest = opaTest;

	return opaTest;
});

