/*global QUnit, sinon */

/*eslint max-nested-callbacks: [2,4]*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/URI",
	"sap/ui/test/_OpaUriParameterParser",
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/Opa",
	"./utils/browser",
	"./utils/sinon",
	"sap/ui/Device"
], function ($, URI, _OpaUriParameterParser, _LogCollector, _OpaLogger, Opa, browser, sinonUtils, Device) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	var oLogCollector = _LogCollector.getInstance();

	// save default execution delay for this specific browser
	var iExecutionDelay = Opa.config.executionDelay;

	QUnit.module("context");

	QUnit.test("Should have the same context", function(assert) {
		// System under Test
		var oOpa = new Opa();
		var oOpa2 = new Opa();

		// Act + Assert
		assert.strictEqual(oOpa.getContext(), oOpa2.getContext(), "Contexts are the same");
	});

	QUnit.module("waitFor", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			Opa.resetConfig();
			this.clock.restore();
		}
	});

	QUnit.test("Should wait for something", function(assert) {
		// Arrange
		var bFirstCheck = false,
			oFirstSuccess = this.spy(),
			bSecondCheck = false,
			oSecondSuccess = this.spy(),
			oDoneSpy = this.spy();

		// System under Test
		var oOpa = new Opa();

		// Act
		oOpa.waitFor({
			check : function () {
				return bFirstCheck;
			},
			success : oFirstSuccess
		});

		this.clock.tick(1000);
		oOpa.waitFor({
			check : function () {
				return bSecondCheck;
			},
			success : oSecondSuccess
		}).done(oDoneSpy);
		Opa.emptyQueue();

		// Assert
		assert.strictEqual(oFirstSuccess.callCount, 0, "First did not succeed yet");
		assert.strictEqual(oSecondSuccess.callCount, 0, "Second did not succeed yet");
		assert.strictEqual(oDoneSpy.callCount, 0, "Did not resolve the deferred yet");

		bSecondCheck = true;
		this.clock.tick(1000);

		assert.strictEqual(oFirstSuccess.callCount, 0, "First did not succeed yet");
		assert.strictEqual(oSecondSuccess.callCount, 0, "Second did not succeed yet");
		assert.strictEqual(oDoneSpy.callCount, 0, "Did not resolve the deferred yet");

		bFirstCheck = true;
		this.clock.tick(1000);

		assert.ok(oFirstSuccess.calledBefore(oSecondSuccess), "Did call the first success first");

		assert.strictEqual(oFirstSuccess.callCount, 1, "First did succeed");
		assert.strictEqual(oSecondSuccess.callCount, 1, "Second did succeed");
		assert.strictEqual(oDoneSpy.callCount, 1, "Did resolve the deferred");
	});

	QUnit.test("Should resolve in first poll if the conditions are met", function(assert) {
		// System under Test
		var oOpa = new Opa();

		// Act
		oOpa.waitFor({
			check : function () {
				return true;
			},
			success : function () {
				assert.ok(true, "Success is called synchronously");
			}
		});

		Opa.emptyQueue();
		this.clock.tick(iExecutionDelay);
	});

	QUnit.test("Should resolve in next poll if the conditions are met and asyncPolling is requested", function(assert) {
		// System under Test
		var oOpa = new Opa();
		oOpa.extendConfig({
			asyncPolling: true
		});

		// Act
		oOpa.waitFor({
			check : function () {
				return true;
			},
			success : function () {
				assert.ok(true, "Success is called synchronously");
			}
		});

		Opa.emptyQueue();
		this.clock.tick(iExecutionDelay + 400);
	});

	QUnit.test("Should wait for additional waitFor's declared in the success handler before continuing the queue", function(assert) {
		// System under Test
		var oOpa = new Opa();
		oOpa.extendConfig({
			pollingInterval : 1
		});

		// Arrange
		var oSuccess11 = this.spy(),
			oSuccess121 = this.spy(),
			fnSuccess12 = function(){
				return oOpa.waitFor({
					success : oSuccess121
				});
			},
			fnSuccessSpy12 = this.spy(fnSuccess12),
			oSuccess13 = this.spy(),
			fnSuccess1 = function(){
				oOpa.waitFor({
					success : oSuccess11
				});
				oOpa.waitFor({
					success : fnSuccessSpy12
				});
				return oOpa.waitFor({
					success : oSuccess13
				});
			},
			fnSuccessSpy1 = this.spy(fnSuccess1),
			oSuccess2 = this.spy(),
			oDoneSpy = this.spy();



		// Act
		oOpa.waitFor({
			success : fnSuccessSpy1
		});

		oOpa.waitFor({
			success : oSuccess2
		}).done(oDoneSpy);

		Opa.emptyQueue();

		//Ensure all timers have been triggered
		this.clock.tick(1000);

		// Assert
		// Ensure Order
		assert.ok(fnSuccessSpy1.calledBefore(oSuccess11), "Success Handler Order: 1 before 1.1");
		assert.ok(oSuccess11.calledBefore(fnSuccessSpy12), "Success Handler Order: 1.1 before 1.2");
		assert.ok(fnSuccessSpy12.calledBefore(oSuccess121), "Success Handler Order: 1.2 before 1.2.1");
		assert.ok(oSuccess121.calledBefore(oSuccess13), "Success Handler Order: 1.2.1 before 1.3");
		assert.ok(oSuccess13.calledBefore(oSuccess2), "Success Handler Order: 1.3 before 2");
		// Ensure called once
		assert.strictEqual(fnSuccessSpy1.callCount, 1, "Ensure Success Handler #1 called once");
		assert.strictEqual(oSuccess11.callCount, 1, "Ensure Success Handler #1.1 called once");
		assert.strictEqual(fnSuccessSpy12.callCount, 1, "Ensure Success Handler #1.2 called once");
		assert.strictEqual(oSuccess121.callCount, 1, "Ensure Success Handler #1.2.1 called once");
		assert.strictEqual(oSuccess13.callCount, 1, "Ensure Success Handler #1.3 called once");
		assert.strictEqual(oSuccess2.callCount, 1, "Ensure Success Handler #2 called once");
		assert.strictEqual(oDoneSpy.callCount, 1, "Resolve the deferred");
	});

	QUnit.test("Should modify the polling interval", function(assert) {
		// Arrange
		var bFirstCheck = false,
			bSecondCheck = false,
			oFirstCheckSpy = this.spy(function () {
				return bFirstCheck;
			}),
			oSecondCheckSpy = this.spy(function () {
				return bSecondCheck;
			}),
			oDoneSpy = this.spy();

		// System under Test
		var oOpa = new Opa();

		// Act
		oOpa.extendConfig({
			pollingInterval : 200
		});

		oOpa.waitFor({
			check : oFirstCheckSpy
		});

		oOpa.waitFor({
			check : oSecondCheckSpy,
			pollingInterval : 100
		});

		Opa.emptyQueue().done(oDoneSpy);

		if (Device.browser.safari) {
			this.clock.tick(200);
		}

		this.clock.tick(800);
		assert.strictEqual(oFirstCheckSpy.callCount, 5, "Did apply the polling of the extendConfig");

		bFirstCheck = true;

		//second wait for should start after this one
		if (!Device.browser.safari) {
			this.clock.tick(200);
		}

		//check for faster polling
		this.clock.tick(1000);
		assert.strictEqual(oSecondCheckSpy.callCount, 10, "Did apply the polling of the waitFor");

		bSecondCheck = true;

		//clean the queue
		this.clock.tick(100);
		assert.strictEqual(oDoneSpy.callCount, 1, "Did clear all waitFors");
	});

	QUnit.test("Should slow down the execution of OPA", function (assert) {
		var oOpa = new Opa(),
			fnFirstSuccessSpy = sinon.spy(),
			fnSecondSuccessSpy = sinon.spy(),
			fnDone = assert.async();

		Opa.extendConfig({
			executionDelay: 5000
		});

		oOpa.waitFor({
			success: fnFirstSuccessSpy
		});

		oOpa.waitFor({
			success: fnSecondSuccessSpy
		});

		Opa.emptyQueue().done(function () {
			fnDone();
		});

		sinon.assert.notCalled(fnFirstSuccessSpy);
		this.clock.tick(2000);
		sinon.assert.notCalled(fnFirstSuccessSpy);
		this.clock.tick(3000);
		sinon.assert.calledOnce(fnFirstSuccessSpy);
		sinon.assert.notCalled(fnSecondSuccessSpy);
		this.clock.tick(5000);
	});

	QUnit.test("Should wait for promise scheduled on flow", function (assert) {
		assert.expect(3);
		// sinon clock interferes with promises: disable it for this test
		// re-enable in beforeEach
		this.clock.restore();
		var oOpa = new Opa();
		var fnDone = assert.async();
		var mResult = {};
		var fnWithJQueryPromise = function () {
			var oDeferred = new $.Deferred();
			setTimeout(function() {
				oDeferred.resolve();
			}, 200);
			return oDeferred.promise().then(function () {
				assert.ok(mResult.initDone, "Should wait for jQuery promise to complete in order with the queue");
				mResult.jQueryDone = true;
			});
		};
		var fnWithNativePromise = function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					resolve();
				}, 200);
			}).then(function () {
				assert.ok(mResult.jQueryDone, "Should wait for native promise to complete after jQueryPromise");
				mResult.nativeDone = true;
			});
		};

		oOpa.waitFor({
			check: function () {
				mResult.initDone = true;
				return true;
			}
		});
		oOpa.iWaitForPromise(fnWithJQueryPromise());
		oOpa.iWaitForPromise(fnWithNativePromise());

		oOpa.emptyQueue().always(function () {
			assert.ok(mResult.jQueryDone && mResult.nativeDone, "Should empty the queue after both promises are done");
			fnDone();
		});
	});

	QUnit.module("Exception Handling", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			this.clock.restore();
		}
	});

	QUnit.test("Should reject the emptyQueue promise if there is an error in the check or success", function(assert) {

		var oError = new Error("OpaError"),
			fnFaultyFunction = function() {
				throw oError;
			},
			oOpa = new Opa(),
			oOpa1 = new Opa(),
			fnSpy = this.spy();

		oOpa.waitFor({check : fnFaultyFunction}).emptyQueue().fail(fnSpy);
		this.clock.tick(100);
		oOpa1.waitFor({success : fnFaultyFunction}).emptyQueue().fail(fnSpy);
		this.clock.tick(100);
		assert.strictEqual(fnSpy.callCount, 2, "Promise rejected in both cases");
		assert.ok(fnSpy.args[0][0].errorMessage.match("^Failure in Opa check function\n"), "Unexpected error message");
		assert.ok(fnSpy.args[1][0].errorMessage.match("^Failure in Opa success function\n"), "Unexpected error message");
	});


	QUnit.test("Should empty the queue if the promise is rejected", function(assert) {

		var oError = new Error("OpaError"),
			fnFaultyFunction = function() {
				throw oError;
			},
			oOpa = new Opa(),
			fnCheck = this.spy( function() {
				return false;
			}),
			fnFail = this.spy();

		oOpa.waitFor({
			check : fnFaultyFunction
		});
		oOpa.waitFor({
			check : fnCheck
		});

		oOpa.emptyQueue().fail(fnFail);
		this.clock.tick(100);
		var errorMessage = fnFail.args[0][0].errorMessage;
		assert.strictEqual(fnFail.callCount, 1, "Called error handler");
		assert.ok(errorMessage.match("^Failure in Opa check function\n"), "Unexpected error message");
		assert.ok(errorMessage.match("Exception thrown by the testcode"), "Unexpected error message");
		assert.ok(errorMessage.match("Error: OpaError"), "Unexpected error message");
		assert.strictEqual(fnCheck.callCount, 0, "Never called check since the previous wait for threw an exception");

	});

	QUnit.test("Should be able to handle a waitFor error and reject the empty queue", function (assert) {
		var oOpa = new Opa(),
			fnSuccess = this.spy(),
			fnEmptyQueueFail = this.spy(),
			fnWaitForFail = this.spy(),
			// enqueue the waitFors first
			oFailingWaitFor = oOpa.waitFor({
				success: function() {
					throw new Error("OpaError");
				}
			});

		oOpa.waitFor({
			success: fnSuccess
		});

		// then attach a handler to one of the waitFors.
		// the handler works ok if it is attached before another waitFor is enqueued, but we need to be able to attach it at any point
		oFailingWaitFor.fail(fnWaitForFail);

		oOpa.emptyQueue().fail(fnEmptyQueueFail);
		this.clock.tick(100);
		assert.strictEqual(fnWaitForFail.callCount, 1, "Should call waitFor error handler");
		assert.strictEqual(fnEmptyQueueFail.callCount, 1, "Should call emptyQueue error handler");
		assert.ok(fnWaitForFail.calledBefore(fnEmptyQueueFail), "Should call waitFor error handler before emptyQueue error handler");

		[fnWaitForFail, fnEmptyQueueFail].forEach(function (fnSpy) {
			var errorMessage = fnSpy.args[0][0].errorMessage;
			assert.ok(errorMessage.match("^Failure in Opa success function\n"), "Unexpected error message");
			assert.ok(errorMessage.match("Exception thrown by the testcode"), "Unexpected error message");
			assert.ok(errorMessage.match("Error: OpaError"), "Unexpected error message");
		});
		assert.strictEqual(fnSuccess.callCount, 0, "Should never call the second success since the previous waitFor threw an exception");
	});

	QUnit.module("StopQueue");

	QUnit.test("Should display a warning if 'stopQueue' is called without calling 'emptyQueue'", function(assert) {
		Opa.stopQueue();
		assert.ok(oLogCollector.getAndClearLog(), "stopQueue was called before emptyQueue, queued tests have never been executed");
	});

	QUnit.test("Should stop the queue inside of success", function (assert) {
		var oOpa = new Opa(),
			fnDone = assert.async(),
			fnShouldNotBeCalled = sinon.spy();

		oOpa.waitFor({
			success: function () {
				Opa.stopQueue();
			}
		});

		oOpa.waitFor({
			check: fnShouldNotBeCalled
		});

		oOpa.emptyQueue().fail(function () {
			// to be after any setTimeout 0 from opa
			setTimeout(function () {
				sinon.assert.notCalled(fnShouldNotBeCalled);
				fnDone();
			});
		});
	});

	QUnit.test("Should stop a Queue while polling", function (assert) {
		var oOpa = new Opa(),
			fnDone = assert.async(),
			fnSuccess = sinon.spy(),
			fnCheck = sinon.spy(function () {
				Opa.stopQueue();
				return true;
			});

		oOpa.waitFor({
			check: fnCheck,
			success: fnSuccess
		});

		oOpa.emptyQueue().fail(function () {
			// to be after any setTimeout 0 from opa
			setTimeout(function () {
				sinon.assert.calledOnce(fnCheck);
				sinon.assert.notCalled(fnSuccess);
				fnDone();
			}, 1);
		});
	});

	QUnit.test("Should stop running tests and fail the promise if 'stopQueue' is called", function (assert) {
		var oOpa = new Opa(),
			fnDone = assert.async(),
			fnShouldNotBeCalled = sinon.spy();

		function callingFunction () {
			Opa.stopQueue();
			// stop during check should prevent success from running
			return true;
		}

		oOpa.waitFor({
			check: function () {
				// use named function for stack validation
				return callingFunction();
			},
			success: fnShouldNotBeCalled
		});

		oOpa.emptyQueue().fail(function () {
			assert.ok(oLogCollector.getAndClearLog());

			oOpa.waitFor({success: fnShouldNotBeCalled});

			Opa.emptyQueue().fail(function () {
				sinon.assert.notCalled(fnShouldNotBeCalled);
				var sLog = oLogCollector.getAndClearLog();
				if (browser.supportsStacktraces()) {
					assert.ok(sLog.match("callingFunction"));
				}
				assert.ok(sLog.match("Queue was stopped manually"));
				fnDone();
			});

			// stop again outside check/success to validate state is deleted correctly
			callingFunction();
		});
	});

	QUnit.test("Should show info about last executed check on QUnit timeout", function callingFunction (assert) {
		var oOpa = new Opa(),
			fnCheckStub = sinon.stub(),
			fnDone = assert.async();

		fnCheckStub.returns(false);

		oOpa.waitFor({
			check: fnCheckStub,
			success: function () {}
		});

		oOpa.emptyQueue().fail(function () {
			var sLog = oLogCollector.getAndClearLog();
			if (browser.supportsStacktraces()) {
				assert.ok(sLog.match("callingFunction"));
			}
			assert.ok(sLog.match("QUnit timeout"));
			fnDone();
		});

		setTimeout(function () {
			// _stopQueue on QUnit timeout is called outside the queue
			// put this in a timeout to ensure the queue is started
			Opa._stopQueue({qunitTimeout: 30000});
		}, 50);
	});

	QUnit.module("Timeouts", {
		afterEach : function () {
			Opa.resetConfig();
		}
	});

	QUnit.test("Should time out if check is returning false", function(assert) {
		// Arrange
		var oErrorSpy = sinon.spy(),
			oWaitForDoneSpy = sinon.spy(),
			oSuccessSpy = sinon.spy(),
			oDoneSpy = sinon.spy(),
			fnDone = assert.async();

		// System under Test
		var oOpa = new Opa();

		// Act
		oOpa.waitFor({
			check : function () {
				return false;
			},
			timeout : 1,
			success : oSuccessSpy,
			error : oErrorSpy
		}).done(oWaitForDoneSpy);

		oOpa.emptyQueue().fail(function () {
			assert.strictEqual(oWaitForDoneSpy.callCount, 0, "Done was not called");
			assert.strictEqual(oDoneSpy.callCount, 0, "Done was not called");
			assert.strictEqual(oSuccessSpy.callCount, 0, "Success was not called");
			assert.strictEqual(oErrorSpy.callCount, 1, "Error spy got invoked");
			assert.ok(oLogCollector.getAndClearLog().match("Opa timeout after 1 seconds"));
			fnDone();
		}).done(oDoneSpy);

	});

	QUnit.test("Should reject the promise if no error handler is defined", function thisIsTheCallingFunction (assert) {
		// System under Test
		var oOpa = new Opa();
		var fnDone = assert.async();

		// Act
		oOpa.waitFor({
			check : function () {
				return false;
			},
			timeout : 1
		});

		oOpa.emptyQueue().fail(function (oOptions) {
			assert.ok(true, 0, "Promise got rejected");
			assert.ok(oOptions, "Options are passed");
			assert.ok(oOptions.errorMessage.match("Opa timeout after 1 seconds"), "Error message is there");

			if (browser.supportsStacktraces()) {
				assert.ok(oOptions.errorMessage.indexOf("thisIsTheCallingFunction") > -1, "Error message contains calling function");
			}

			assert.ok(oLogCollector.getAndClearLog().match("Opa timeout after 1 seconds"));
			fnDone();
		});

	});

	QUnit.test("Reject message stack for additional waitFor declared in the success handler contains original call", function thisIsTheMainTest(assert) {
		// System under Test
		var oOpa = new Opa();
		var fnDone = assert.async();
		oOpa.extendConfig({
			pollingInterval : 1
		});

		function thisIsTheSuccessHandler(){
			oOpa.waitFor({
				check : function () {
					return false;
				},
				timeout : 1
			});

		}

		oOpa.waitFor({
			check : function () {
				return true;
			},
			success : thisIsTheSuccessHandler
		});

		oOpa.emptyQueue().fail(function (oOptions) {
			assert.ok(true, 0, "Promise got rejected");
			assert.ok(oOptions, "Options are passed");
			assert.ok(oOptions.errorMessage, "Error message is there");

			if (browser.supportsStacktraces()) {
				assert.ok(oOptions.errorMessage.indexOf("thisIsTheMainTest") > -1, "Error message contains calling main function");
				assert.ok(oOptions.errorMessage.indexOf("thisIsTheSuccessHandler") > -1, "Error message contains calling internal function");
			}

			fnDone();
		});
	});

	QUnit.module("Validation");

	["error", "success", "check"].forEach(function (sParameter) {
		QUnit.test("Should throw an error if the " + sParameter + " parameter is not a function", function (assert) {
			assert.throws(function () {
				var oWaitFor = {};
				oWaitFor[sParameter] = "foo";
				new Opa().waitFor(oWaitFor);
			},
			new Error("sap.ui.test.Opa#waitFor - the '" + sParameter + "' parameter needs to be a function but "
					+ "'foo' was passed")
			, "threw the error");
		});
	});

	["timeout", "pollingInterval", "_stackDropCount"].forEach(function (sParameter) {
		QUnit.test("Should throw an error if the " + sParameter + " parameter is not numeric", function (assert) {
			assert.throws(function () {
				var oWaitFor = {};
				oWaitFor[sParameter] = "foo";
				new Opa().waitFor(oWaitFor);
			},
			new Error("sap.ui.test.Opa#waitFor - the '" + sParameter + "' parameter needs to be numeric but "
					+ "'foo' was passed")
			, "threw the error");
		});
	});

	QUnit.test("Should throw an error if the errorMessage parameter is not a string", function (assert) {
		assert.throws(function () {
			var oWaitFor = {
				errorMessage : {}
			};
			new Opa().waitFor(oWaitFor);
		},
		new Error("sap.ui.test.Opa#waitFor - the 'errorMessage' parameter needs to be a string but "
				+ "'[object Object]' was passed")
		, "threw the error");
	});

	QUnit.module("waitFor counts");

	QUnit.test("Should calculate how many waitFors have been added in a timeframe", function (assert) {
		var fnTimeoutDone = assert.async(),
			oCounter = Opa._getWaitForCounter();

		assert.strictEqual(oCounter.get(), 0, "initially no waitFors have been added");

		var oOpa = new Opa();
		oOpa.waitFor({});

		assert.strictEqual(oCounter.get(), 1, "first waitFor added");

		setTimeout(function () {
			oOpa.waitFor({});
			assert.strictEqual(oCounter.get(), 2, "waitFors has been added after some time has passed");
			Opa.stopQueue();
			fnTimeoutDone();
		}, 50);
	});

	QUnit.test("Should not return negative numbers", function (assert) {
		var oOpa = new Opa();

		oOpa.waitFor({});
		var oCounter = Opa._getWaitForCounter();

		Opa.stopQueue();

		assert.strictEqual(oCounter.get(), 0, "first waitFor added");

	});

	QUnit.module("Opa Config");

	function assertDefaults (assert) {
		assert.strictEqual(Opa.config.timeout, 15);
		assert.strictEqual(Opa.config.pollingInterval, 400);
		assert.strictEqual(Opa.config._stackDropCount, 0);
		assert.strictEqual(Opa.config.executionDelay, iExecutionDelay);
		assert.ok(Opa.config.arrangements instanceof Opa);
		assert.ok(Opa.config.actions instanceof Opa);
		assert.ok(Opa.config.assertions instanceof Opa);
	}

	QUnit.test("Should have the correct defaults", function (assert) {
		assertDefaults(assert);
	});

	QUnit.test("Should reset the config", function (assert) {
		var oOpa = new Opa();
		Opa.extendConfig({
			arrangements : oOpa,
			actions : oOpa,
			assertions : oOpa,
			timeout : 123,
			pollingInterval : 123,
			_stackDropCount : 123,
			executionDelay: 9000
		});

		Opa.resetConfig();
		assertDefaults(assert);
		assert.notEqual(Opa.config.assertions, oOpa);
		assert.notEqual(Opa.config.actions, oOpa);
		assert.notEqual(Opa.config.assertions, oOpa);
	});

	QUnit.test("Should read an opa config value from URL parameter", function (assert) {
		var fnOrig = URI.prototype.search;
		var oStub = sinonUtils.createStub(URI.prototype, "search", function (query) {
			if ( query === true ) {
				return {
					"opaKey": "value",			// should parse prefixed params
					"opaExecutionDelay": "2000",// should override default value params
					"another": "value",			// should not parse unprefixed params
					"opaOverride": "value"		// should override already set params
				};
			}
			return fnOrig.apply(this, arguments); // should use callThrough with sinon > 3.0
		});
		Opa._uriParams = _OpaUriParameterParser._getOpaParams();
		Opa.extendConfig({});
		assert.strictEqual(Opa.config.key, 'value');
		assert.strictEqual(Opa.config.executionDelay, 2000);
		assert.strictEqual(Opa.config.another, undefined);

		Opa.extendConfig({
			override: 'initialValue'
		});
		assert.strictEqual(Opa.config.override, "value");

		// restore the stub and reload OPA5 so empty app params are loaded
		oStub.restore();
		Opa._uriParams = _OpaUriParameterParser._getOpaParams();
		Opa.resetConfig();
		assert.strictEqual(Opa.config.key, undefined);
		assert.strictEqual(Opa.config.executionDelay, iExecutionDelay);
		assert.strictEqual(Opa.config.override, undefined);
	});

	QUnit.test("Should configure the max log level", function (assert) {
		var fnLogLevelSpy = sinon.spy(_OpaLogger, "setLevel");
		var fnOrig = URI.prototype.search;
		var oStub = sinonUtils.createStub(URI.prototype, "search", function (query) {
			if ( query === true ) {
				return {
					opaLogLevel: "trace"
				};
			}
			return fnOrig.apply(this, arguments); // should use callThrough with sinon > 3.0
		});

		Opa._uriParams = _OpaUriParameterParser._getOpaParams();
		Opa.extendConfig({});
		assert.strictEqual(Opa.config.logLevel, "trace");
		assert.ok(fnLogLevelSpy.calledOnce, "Log level was changed");
		sinon.assert.calledWith(fnLogLevelSpy, "trace");
		oStub.restore();
		fnLogLevelSpy.restore();
	});

	QUnit.module("Opa Empty queue");

	QUnit.test("Should throw an exception if emptyQueue is called twice", function (assert) {
		var oOpa = new Opa();

		oOpa.waitFor({});
		Opa.emptyQueue();
		oOpa.waitFor({});

		assert.throws(
			function() {
				Opa.emptyQueue();
			},
			new Error("Opa is emptying its queue. Calling Opa.emptyQueue() is not supported at this time.")
		);

		// cleanup the OPA queue to avoid side effects on following tests
		Opa.stopQueue();

		// no exception should be thrown now after the queue is stopped
		Opa.emptyQueue();
	});

});
