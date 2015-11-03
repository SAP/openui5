/*!
 * ${copyright}
 */
/*global QUnit */

sap.ui.define(['./Opa', './Opa5'], function (Opa, Opa5) {
	"use strict";

	/**
	 * QUnit test adapter for opa.js has the same signature as a test of QUnit.
	 * Suggested usage:
	 * <pre><code>
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
	 * </code></pre>
	 *
	 * When you require this file, it will also introduce a global variable: opaTest.
	 * It will also alter some settings of QUnit.config - testTimout will be increased to 90 if you do not specify your own.
	 * QUnit.reorder will be set to false, because OPA tests are often depending on each other.
	 * @public
	 * @alias sap.ui.test.opaQunit
	 * @function
	 * @static
	 * @param {string} testName The name of the created QUnit test.
	 * @param {integer|function} expected Integer showing how many QUnit assertions are expected by the test. If a function is passed, it is interpreted as callback and the expected is skipped.
	 * @param {function} callback The test function. It will get 3 arguments passed to it.
	 * <ol>
	 *     <li>
	 *         Will be {@link sap.ui.test.Opa#.config} .arrangements.
	 *     </li>
	 *     <li>
	 *        Will be {@link sap.ui.test.Opa#.config} .actions.
	 *     </li>
	 *     <li>
	 *         Will be {@link sap.ui.test.Opa#.config} .assertions.
	 *     </li>
	 * </ol>
	 * @returns {QUnit.test} A function to register opaTests
	 */
	var opaTest = function (testName, expected, callback, async) {
		var config = Opa.config;
		//Increase QUnit's timeout to 90 seconds to match default OPA timeouts
		// is only done if there is no timeout or the timeout is the default of QUnit
		if (!QUnit.config.testTimeout || QUnit.config.testTimeout === 30000) {
			QUnit.config.testTimeout  = 90000;
		}
		QUnit.config.reorder = false;

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

