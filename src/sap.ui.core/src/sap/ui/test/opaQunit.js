/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	'sap/base/util/each',
	'sap/ui/core/Core',
	'sap/ui/test/Opa',
	'sap/ui/test/Opa5',
	'sap/ui/test/qunitPause',
	'sap/ui/thirdparty/jquery'
], function(each, Core, Opa, Opa5, QUnitPause, jQuery) {
	"use strict";

	QUnitPause.setupAfterQUnit();

	QUnit.begin(function (oDetails) {
		// add ui5 version in the user agent string bar
		var oQUnitUserAgent = document.getElementById("#qunit-userAgent");
		if (oQUnitUserAgent) {
			oQUnitUserAgent.innerText += "; UI5: " + Core.version;
		}

		Opa._usageReport.begin({uri: window.location.href, totalTests: oDetails.totalTests});
	});

	QUnit.moduleStart(function (oDetails) {
		Opa._usageReport.moduleStart(oDetails);
	});

	QUnit.testStart(function () {
		Opa._usageReport.testStart();
	});

	QUnit.testDone(function (oDetails) {
		Opa._usageReport.testDone(oDetails);

		var bQUnitTimeout = oDetails.assertions.some(function (oAssertion) {
			return !oAssertion.result && oAssertion.message === "Test timed out";
		});

		if (bQUnitTimeout) {
			Opa._stopQueue({qunitTimeout: QUnit.config.testTimeout / 1000});
		}
	});

	QUnit.moduleDone(function (oDetails) {
		Opa._usageReport.moduleDone(oDetails);
	});

	QUnit.done(function (oDetails) {
		Opa._usageReport.done(oDetails);
	});

	/* When you require this file, it will also introduce global variables: opaTest, opaSkip and opaTodo.
	 * It will also alter some settings of QUnit.config - testTimout will be increased to 90 if you do not specify your own.
	 * QUnit.reorder will be set to false, because OPA tests are often depending on each other.
	 */

	// Export to global namespace to be backwards compatible
	window.opaSkip = opaSkip;
	window.opaTest = opaTest;
	// QUnit.todo introduced in v2
	window.opaTodo = QUnit.todo ? opaTodo : opaTest;

	/**
	 * QUnit test adapter for OPA: add a test to be executed by QUnit
	 * Has the same signature as QUnit.test (QUnit version is also considered)
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
	 * @public
	 * @alias module:sap/ui/test/opaQunit
	 * @function
	 * @static
	 * @param {string} testName name of the QUnit test.
	 * @param {int} [expected] only supported in QUnit v1.x: denotes how many assertions are expected to be made in the test.
	 * @param {function} callback the test function. Expects 3 arguments, in order:
	 * {@link sap.ui.test.Opa.config}.arrangements, {@link sap.ui.test.Opa.config}.actions, {@link sap.ui.test.Opa.config}.assertions.
	 * These arguments will be prefilled by OPA
	 * @param {boolean} [async=false] available only in QUnit v1.x. Indicates whether the test is asynchronous. False by default.
	 */
	function opaTest() {
		callQUnit("test", arguments, function (assert, fnDone) {
			Opa._usageReport.opaEmpty();
			resetOPA();
			fnDone();
		}, function (assert, fnDone, oOptions) {
			Opa._usageReport.opaEmpty(oOptions);

			// add the error message to QUnit test results
			// will cause exception in case of QUnit timeout since the last test has already finished
			// ("Cannot read property 'failedAssertions' of null")
			assert.ok(false, oOptions.errorMessage);

			resetOPA();

			if (!QUnitPause.shouldPauseOnAssert()) {
				QUnitPause.emitPause();
			}

			var oPauseDeferred = jQuery.Deferred();
			QUnitPause.onResume(function () {
				// let OPA finish before QUnit starts executing the next test
				// call fnDone only if QUnit did not timeout
				if (!oOptions.qunitTimeout) {
					setTimeout(fnDone, 0);
				}
				oPauseDeferred.resolve();
			});

			return oPauseDeferred.promise();
		});
	}

	/**
	 * QUnit test adapter for OPA: add a test to be executed by QUnit
	 * The test is expected to have at least one failing assertion during its run, or to timeout with either OPA or QUnit timeout
	 * Has the same signature as QUnit.todo (QUnit version is also considered)
	 *
	 * @public
	 * @function
	 * @static
	 * @param {string} testName name of the QUnit test.
	 * @param {int} [expected] only supported in QUnit v1.x: denotes how many assertions are expected to be made in the test.
	 * @param {function} callback the test function. Expects 3 arguments, in order:
	 * {@link sap.ui.test.Opa.config}.arrangements, {@link sap.ui.test.Opa.config}.actions, {@link sap.ui.test.Opa.config}.assertions.
	 * These arguments will be prefilled by OPA
	 * @param {boolean} [async=false] available only in QUnit v1.x. Indicates whether the test is asynchronous. False by default.
	 */
	function opaTodo() {
		callQUnit("todo", arguments, function (assert, fnDone) {
			resetOPA();
			fnDone();
		}, function (assert, fnDone, oOptions) {
			if (oOptions.qunitTimeout) {
				resetOPA();
			} else {
				// to pass the test, add error in case of OPA timeout
				assert.ok(false, oOptions.errorMessage);
				resetOPA();
				// let OPA finish before QUnit starts executing the next test
				// call fnStart only if QUnit did not timeout
				setTimeout(fnDone, 0);
			}
		});
	}

	/**
	 * QUnit test adapter for OPA: add a test to be skipped by QUnit
	 * Has the same signature as QUnit.skip (QUnit version is also considered)
	 *
	 * @public
	 * @function
	 * @static
	 * @param {string} testName name of the QUnit test.
	 * @param {int} [expected] only supported in QUnit v1.x: denotes how many assertions are expected to be made in the test.
	 * @param {function} callback the test function. Expects 3 arguments, in order:
	 * {@link sap.ui.test.Opa.config}.arrangements, {@link sap.ui.test.Opa.config}.actions, {@link sap.ui.test.Opa.config}.assertions.
	 * These arguments will be prefilled by OPA
	 * @param {boolean} [async=false] available only in QUnit v1.x. Indicates whether the test is asynchronous. False by default.
	 */
	function opaSkip(testName, expected, callback, async) {
		configQUnit();
		var fnTestBody = function () {};
		if (isQUnit2()) {
			QUnit.skip(testName, fnTestBody);
		} else {
			QUnit.skip(testName, expected, fnTestBody, async);
		}
	}

	// configure QUnit, modify test callback to include OPA start, and enqueue the test with QUnit
	function callQUnit(sQUnitFn, aArgs, fnDone, fnFail) {
		configQUnit();
		// parse arguments passed to OPA adapter
		var mTestBodyArgs = {
			testName: aArgs[0],
			expected: aArgs.length === 2 ? null : aArgs[1],
			callback: aArgs.length === 2 ? aArgs[1] : aArgs[2],
			async: aArgs[3]
		};

		if (isQUnit2() && typeof mTestBodyArgs.async !== "undefined") {
			throw new Error("Qunit >=2.0 is used, which no longer supports the 'async' parameter for tests.");
		}

		// create and configure the callback to be executed by QUnit at test runtime
		var fnTestBody = createTestBody(mTestBodyArgs, fnDone, fnFail);

		// build arguments for the adapted QUnit function
		var mQUnitFnArgs = [mTestBodyArgs.testName, fnTestBody, mTestBodyArgs.async];

		if (!isQUnit2()) {
			mQUnitFnArgs.splice(1, 0, mTestBodyArgs.expected);
		}

		// call adapted QUnit function
		QUnit[sQUnitFn].apply(this, mQUnitFnArgs);
	}

	// include OPA configuration and queue execution in test callback
	function createTestBody(mConfig, fnDone, fnFail) {
		return function(assert) {
			var fnAsync = assert.async();
			Opa.config.testName = mConfig.testName;
			Opa.assert = assert;
			Opa5.assert = assert;

			if (isQUnit2() && mConfig.expected !== null) {
				assert.expect(mConfig.expected);
			}

			// fill in OPA queue
			// preserve QUnit 'this' in order to access it from waitFor statements
			mConfig.callback.call(this, Opa.config.arrangements, Opa.config.actions, Opa.config.assertions);

			QUnitPause.setupBeforeOpaTest();

			Opa.emptyQueue()
				.done(function () {
					fnDone(assert, fnAsync);
				})
				.fail(function (oOptions) {
					fnFail(assert, fnAsync, oOptions);
				});
		};
	}

	function configQUnit() {
		//Increase QUnit's timeout to 90 seconds to match default OPA timeouts
		// is only done if there is no timeout or the timeout is the default of QUnit
		if (!QUnit.config.testTimeout || QUnit.config.testTimeout === 30000) {
			QUnit.config.testTimeout  = 90000;
		}
		QUnit.config.reorder = false;
		// better chance that screenshots will capture the current failure
		QUnit.config.scrolltop = false;
	}

	function resetOPA() {
		Opa.assert = undefined;
		Opa5.assert = undefined;
	}

	function isQUnit2() {
		return QUnit.test.length === 2;
	}

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
			each(oAssertions, function(sName,fnAssertion) {
				QUnit.assert[sName] = function() {
					var qunitThis = this;
					// call the assertion in the app window
					// assertion is async, push results when ready
					var oAssertionPromise = fnAssertion.apply(oParams.appWindow, arguments)
						.always(function (oResult) {
							if ( typeof qunitThis.pushResult === "function" ) {
								qunitThis.pushResult(oResult);
							} else {
								// fallback for QUnit < 1.22.0
								qunitThis.push(
									oResult.result,
									oResult.actual,
									oResult.expected,
									oResult.message
								);
							}
						});

					// schedule async assertion promise on waitFor flow so test waits till assertion is ready
					Opa.config.assertions._schedulePromiseOnFlow(oAssertionPromise);
				};
			});
		}
	});

	return opaTest;
});
