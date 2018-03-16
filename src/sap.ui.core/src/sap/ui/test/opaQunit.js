/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	'jquery.sap.global',
	'./Opa',
	'./Opa5'
], function ($, Opa, Opa5) {
	"use strict";

	QUnit.testDone(function( details ) {
		var bTimedOut = details.assertions.some(function (oAssertion) {
			return !oAssertion.result && oAssertion.message === "Test timed out";
		});
		if (bTimedOut) {
			Opa._stopQueue({qunitTimeout: QUnit.config.testTimeout / 1000});
		}
	});
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
	 * @param {int|function} expected Integer showing how many QUnit assertions are expected by the test. If a function is passed, it is interpreted as callback and the expected is skipped.
	 * @param {function} callback The test function. It will get 3 arguments passed to it.
	 * <ol>
	 *     <li>
	 *         Will be {@link sap.ui.test.Opa.config} .arrangements.
	 *     </li>
	 *     <li>
	 *        Will be {@link sap.ui.test.Opa.config} .actions.
	 *     </li>
	 *     <li>
	 *         Will be {@link sap.ui.test.Opa.config} .assertions.
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
		// better chance that screenshots will capture the current failure
		QUnit.config.scrolltop = false;

		if (arguments.length === 2) {
			callback = expected;
			expected = null;
		}

		if ( QUnit.test.length === 2 && async === true ) {
			throw new Error("Qunit >=2.0 is used, which no longer supports the 'async' parameter for tests.");
		}

		var testBody = function(assert) {
			var fnStart = assert.async();
			config.testName = testName;

			// provide current "assert" object to the tests
			Opa.assert = assert;
			Opa5.assert = assert;

			if ( QUnit.test.length === 2 && expected !== null ) {
				assert.expect(expected);
			}

			callback.call(this, config.arrangements, config.actions, config.assertions);

			var promise = Opa.emptyQueue();
			promise.done(function() {
				Opa.assert = undefined;
				Opa5.assert = undefined;
				fnStart();
			});

			promise.fail(function (oOptions) {
				assert.ok(false, oOptions.errorMessage);
				Opa.assert = undefined;
				Opa5.assert = undefined;
				// let OPA finish before QUnit starts executing the next test
				// call fnStart only if QUnit did not timeout
				if (!oOptions.qunitTimeout) {
					setTimeout(fnStart, 0);
				}
			});
		};

		if ( QUnit.test.length === 2 ) {
			return QUnit.test(testName, testBody);
		} else {
			return QUnit.test(testName, expected, testBody, async);
		}

	};
	// Export to global namespace to be backwards compatible
	window.opaTest = opaTest;

	QUnit.config.urlConfig.push({
		id: "opaExecutionDelay",
		value: {
			400: "fast",
			700: "medium",
			1000: "slow"
		},
		label: "Opa speed",
		tooltip: "Each waitFor will be delayed by a number of milliseconds. If it is not set Opa will execute the tests as fast as possible"
	});

	// synchronously hook QUnit custom async assertions from extension
	Opa5._getEventProvider().attachEvent('onExtensionAfterInit',function(oEvent) {
		var oParams = oEvent.getParameters();
		if (oParams.extension.getAssertions) {
			var oAssertions = oParams.extension.getAssertions();
			$.each(oAssertions,function(sName,fnAssertion) {
				QUnit.assert[sName] = function() {
					var qunitThis = this;
					// call the assertion in the app window
					// assertion is async, push results when ready
					var oAssertionPromise = fnAssertion.bind(oParams.appWindow)(arguments)
						.always(function (oResult) {
							qunitThis.push(
								oResult.result,
								oResult.actual,
								oResult.expected,
								oResult.message
							);
						});

					// schedule async assertion promise on waitFor flow so test waits till assertion is ready
					Opa.config.assertions._schedulePromiseOnFlow(oAssertionPromise);
				};
			});
		}
	});

	return opaTest;
});

