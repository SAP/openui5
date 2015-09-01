/*!
 * ${copyright}
 */
/*global opaTest:true, QUnit */

// Eslint thinks window.opaTest is unused
/*eslint-disable no-unused-vars */
sap.ui.define(['./Opa', './Opa5'], function (Opa, Opa5) {
/*eslint-enable no-unused-vars */
	"use strict";

	/**
	 * QUnit test adapter for opa.js has the same signature as a test of QUnit.
	 * Suggested usage:
	 * <code>
	 * sap.ui.require(["sap/ui/test/Opa5", "sap/ui/test/opaQunit"], function (Opa5, opaTest) {
	 *
	 *    Opa5.extendConfig({
	 *        assertions: new Opa5({
	 *            checkIfSomethingIsOk : function () {
	 *                this.waitFor({
	 *                    success: function () {
	 *                        Opa5.assert.ok(true, "Everything is fine");
	 *                    }
	 *                });
	 *            }
	 *        })
	 *    });
	 *
	 *    opaTest("Should test something", function (Given, When, Then) {
	 *       // Implementation of the test
	 *       Then.checkIfSomethingIsOk();
	 *    });
	 *
	 * });
	 * </code>
	 *
	 * When you require this file, it will also introduce a global variable: opaTest.
	 * @public
	 * @alias sap.ui.test.opaQunit
	 * @function
	 * @static
	 * @param {string} testName the name of the created QUnit test.
	 * @param {integer|function} expected Integer - How many qunit assertions are expected by the test. If a function is passed it is interpreted as callback and the expected is skipped.
	 * @param {function} callback - The test function. It will get 3 arguments passed to it.
	 * The first argument will be {@link sap.ui.test.Opa#.config}.arrangements.
	 * The second argument will be {@link sap.ui.test.Opa#.config}.actions.
	 * The third argument will be {@link sap.ui.test.Opa#.config}.assertions.
	 * @returns {QUnit.test} a function to register opaTests
	 */
	var opaTest = function (testName, expected, callback, async) {
		var config = Opa.config;
		//Increase QUnit's timeout to 90 seconds to match default OPA timeouts
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

			// provide current "assert" object to the tests
			Opa.assert = assert;
			Opa5.assert = assert;

			callback.call(this, config.arrangements, config.actions, config.assertions);

			var promise = Opa.emptyQueue();
			promise.done(function() {
				Opa.assert = undefined;
				Opa5.assert = undefined;
				fnStart();
			});

			promise.fail(function (oOptions) {
				QUnit.ok(false, oOptions.errorMessage);
				Opa.assert = undefined;
				Opa5.assert = undefined;
				fnStart();
			});
		};

		return QUnit.test(testName, expected, testBody, async);
	};
	// Export to global namespace to be backwards compatible
	window.opaTest = opaTest;

	return opaTest;
});

