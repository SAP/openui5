sap.ui.define([
	"jquery.sap.global",
	"unitTests/utils/loggerInterceptor"
], function ($, loggerInterceptor) {
	"use strict";

	$.sap.unloadResources("sap/ui/test/autowaiter/_timeoutWaiter.js", false, true, true);
	var oLogger = loggerInterceptor.loadAndIntercept("sap.ui.test.autowaiter._timeoutWaiter");
	var oTraceSpy = sinon.spy(oLogger[0], "trace");
	var oDebugSpy = sinon.spy(oLogger[1], "debug");
	var timeoutWaiter = sap.ui.test.autowaiter._timeoutWaiter;

	function assertLog (iNumberBlocking, iNumberNonBlocking) {
		if (!iNumberNonBlocking) {
			iNumberNonBlocking = 0;
		}
		sinon.assert.calledWith(oDebugSpy, "There are '" + iNumberBlocking + "' open blocking Timeouts. And " + iNumberNonBlocking + " non blocking timeouts")
	}

	["Timeout", "Immediate"].forEach(function (sFunctionUnderTest) {
		var fnSetFunction = window["set" + sFunctionUnderTest];
		var fnClearFunction = window["clear" + sFunctionUnderTest];
		if (!fnSetFunction) {
			$.sap.log.debug("Skipped tests because" + sFunctionUnderTest + " is not defined in this browser");
			return;
		}

		QUnit.module("timeoutWaiter - no " + sFunctionUnderTest, {
			afterEach: function () {
				oDebugSpy.reset();
				oTraceSpy.reset();
			}
		});

		QUnit.test("Should make sure there is no pending timeout before starting these tests", function (assert) {
			var fnDone = assert.async();

			function noTimeout () {
				var bHasTimeout = timeoutWaiter.hasPending();
				if (!bHasTimeout) {
					assert.ok(true, "no timeout present");
					fnDone();
				} else {
					setTimeout(noTimeout, 50);
				}

				return bHasTimeout;
			}

			noTimeout();
		});

		QUnit.test("Should return that there are no pending timeouts", function (assert) {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
			sinon.assert.notCalled(oDebugSpy);
		});

		QUnit.test("Should return that there are no pending Timeouts if a timeout has finished", function (assert) {
			var fnDone = assert.async();
			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
				sinon.assert.notCalled(oDebugSpy);
				fnDone();
			});
		});

		QUnit.test("Should ignore long runners", function (assert) {
			var iID = setTimeout(function () {}, 1001);
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
			sinon.assert.alwaysCalledWithMatch(oTraceSpy, "Long-running timeout is ignored");
			// do not interfere with other tests
			clearTimeout(iID);
		});

		QUnit.test("Should have configurable max timeout delay", function (assert) {
			timeoutWaiter.extendConfig({maxDelay: 3000});
			var iID = setTimeout(function () {}, 1001);
			var iIDIgnored = setTimeout(function () {}, 3001);

			assert.ok(timeoutWaiter.hasPending(), "there is 1 pending timeout");
			clearTimeout(iID);
			clearTimeout(iIDIgnored);
			// reset to default value
			timeoutWaiter.extendConfig({maxDelay: 1000});
		});

		QUnit.module("timeoutWaiter - single " + sFunctionUnderTest);

		QUnit.test("Should respect the this pointer", function (assert) {
			var oThis = {},
				fnDone = assert.async(),
				fnSpy = sinon.spy(function () {
					sinon.assert.calledOn(fnSpy, oThis);
					fnDone();
				});

			fnSetFunction($.proxy(fnSpy, oThis));
		});

		QUnit.test("Should handle a single timeout", function (assert) {
			var fnDone = assert.async();

			fnSetFunction(function () {
				assertLog(1);
				fnDone();
			});

			assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
		});

		QUnit.module("timeoutWaiter - multiple " + sFunctionUnderTest, {
			afterEach: function () {
				oDebugSpy.reset();
			}
		});

		QUnit.test("Should handle a 2 timeouts", function (assert) {
			var fnFirstTimeoutDone = assert.async();
			var fnSecondTimeoutDone = assert.async();

			fnSetFunction(function () {
				assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
				assertLog(1);
				oDebugSpy.reset();
				fnFirstTimeoutDone();
			});

			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "There was no timeout");
				sinon.assert.notCalled(oDebugSpy);
				fnSecondTimeoutDone();
			}, 20);

			assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
			assertLog(2);
			oDebugSpy.reset();
		});

		QUnit.test("Should handle a timeout that adds a timeout", function (assert) {
			var fnDone = assert.async();

			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "There was no timeout");
				fnSetFunction(function () {
					assert.ok(!timeoutWaiter.hasPending(), "There was no timeout");
					fnDone();
				});
				assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
			});

			assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
		});

		QUnit.module("timeoutWaiter - clear " + sFunctionUnderTest, {
			afterEach: function () {
				oDebugSpy.reset();
			}
		});

		QUnit.test("Should clear a timeout", function (assert) {
			var iId = fnSetFunction(function () {
			});
			fnClearFunction(iId);
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
			sinon.assert.notCalled(oDebugSpy);
		});


		QUnit.test("Should clear 1 of 2 timeouts", function (assert) {
			var fnDone = assert.async();
			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
				sinon.assert.notCalled(fnSecondTimeoutSpy);
				fnDone();
			},20);
			var fnSecondTimeoutSpy = sinon.spy();
			var iId = fnSetFunction(fnSecondTimeoutSpy);
			fnClearFunction(iId);
			assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
			assertLog(1);
		});
	});

	QUnit.module("timeoutWaiter - infinite timeout loops", {
		afterEach: function () {
			oDebugSpy.reset();
		}
	});

	QUnit.test("Should detect a infinite timeout loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(setTimeout(addTimeout, 30));
		}

		setTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			sinon.assert.alwaysCalledWithMatch(oTraceSpy, /Deep-nested timeout with ID [0-9]+ is ignored/);
			aTimeouts.forEach(function (iID) {
				clearTimeout(iID);
			});
			fnDone();
		}, 600);
		addTimeout();
	});

	QUnit.test("Should detect a infinite timeout loop with 2 timeouts added per loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(setTimeout(addTimeout, 40));
			aTimeouts.push(setTimeout(addTimeout, 40));
		}

		setTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			sinon.assert.alwaysCalledWithMatch(oTraceSpy, /Deep-nested timeout with ID [0-9]+ is ignored/);
			aTimeouts.forEach(function (iID) {
				clearTimeout(iID);
			});
			fnDone();
		}, 600);
		addTimeout();
	});
});