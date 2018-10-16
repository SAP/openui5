/* global QUnit, assert, sinon */
sap.ui.define([
	"jquery.sap.global",
	"unitTests/utils/loggerInterceptor"
], function ($, loggerInterceptor) {
	"use strict";

	$.sap.unloadResources("sap/ui/test/_timeoutCounter.js", false, true, true);
	var oLogger = loggerInterceptor.loadAndIntercept("sap.ui.test._timeoutCounter");
	var oDebugSpy = sinon.spy(oLogger, "debug");
	var timeoutCounter = sap.ui.test._timeoutCounter;

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

		QUnit.module("timeoutCounter - no " + sFunctionUnderTest, {
			afterEach: function () {
				oDebugSpy.reset();
			}
		});

		QUnit.test("Should make sure there is no pending timeout before starting these tests", function (assert) {
			var fnDone = assert.async();

			function noTimeout () {
				var bHasTimeout = timeoutCounter.hasPendingTimeouts();
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
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
			sinon.assert.notCalled(oDebugSpy);
		});

		QUnit.test("Should return that there are no pending Timeouts if a timeout has finished", function (assert) {
			var fnDone = assert.async();
			fnSetFunction(function () {
				assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
				sinon.assert.notCalled(oDebugSpy);
				fnDone();
			});
		});

		QUnit.test("Should ignore long runners", function (assert) {
			var iID = setTimeout(function () {}, 1001);

			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
			sinon.assert.notCalled(oDebugSpy);
			// do not interfere with other tests
			clearTimeout(iID);
		});

		QUnit.module("timeoutCounter - single " + sFunctionUnderTest, {
			afterEach: function () {
				oDebugSpy.reset();
			}
		});

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

			assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
		});


		QUnit.module("timeoutCounter - multiple " + sFunctionUnderTest, {
			afterEach: function () {
				oDebugSpy.reset();
			}
		});

		QUnit.test("Should handle a 2 timeouts", function (assert) {
			var fnFirstTimeoutDone = assert.async();
			var fnSecondTimeoutDone = assert.async();

			fnSetFunction(function () {
				assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
				assertLog(1);
				oDebugSpy.reset();
				fnFirstTimeoutDone();
			});

			fnSetFunction(function () {
				assert.ok(!timeoutCounter.hasPendingTimeouts(), "There was no timeout");
				sinon.assert.notCalled(oDebugSpy);
				fnSecondTimeoutDone();
			}, 20);

			assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
			assertLog(2);
			oDebugSpy.reset();
		});

		QUnit.test("Should handle a timeout that adds a timeout", function (assert) {
			var fnDone = assert.async();

			fnSetFunction(function () {
				assert.ok(!timeoutCounter.hasPendingTimeouts(), "There was no timeout");
				fnSetFunction(function () {
					assert.ok(!timeoutCounter.hasPendingTimeouts(), "There was no timeout");
					fnDone();
				});
				assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
			});

			assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
		});

		QUnit.module("timeoutCounter - clear " + sFunctionUnderTest, {
			afterEach: function () {
				oDebugSpy.reset();
			}
		});

		QUnit.test("Should clear a timeout", function (assert) {
			var iId = fnSetFunction(function () {
			});
			fnClearFunction(iId);
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
			sinon.assert.notCalled(oDebugSpy);
		});


		QUnit.test("Should clear 1 of 2 timeouts", function (assert) {
			var fnDone = assert.async();
			fnSetFunction(function () {
				assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
				sinon.assert.notCalled(fnSecondTimeoutSpy);
				fnDone();
			},20);
			var fnSecondTimeoutSpy = sinon.spy();
			var iId = fnSetFunction(fnSecondTimeoutSpy);
			fnClearFunction(iId);
			assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
			assertLog(1);
		});

		QUnit.module("timeoutCounter - infinite timeout loops", {
			afterEach: function () {
				oDebugSpy.reset();
			}
		});
	});

	QUnit.test("Should detect a infinite timeout loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(setTimeout(addTimeout, 30));
		}

		setTimeout(function () {
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			sinon.assert.notCalled(oDebugSpy);
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
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			sinon.assert.notCalled(oDebugSpy);
			aTimeouts.forEach(function (iID) {
				clearTimeout(iID);
			});
			fnDone();
		}, 600);
		addTimeout();
	});

	QUnit.module("timeout Microtasks", {
		afterEach: function () {
			oDebugSpy.reset();
		}
	});

	["resolve", "reject"].forEach(function (sPromiseFunction) {
		QUnit.test("Should hook into the Promise." + sPromiseFunction + " function", function (assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]().then(fnDone, fnDone);
			assert.ok(timeoutCounter.hasPendingTimeouts(), "Has pending microtask");
			sinon.assert.calledWith(oDebugSpy, "There are 1 pending microtasks");
		});
	});

	QUnit.test("Should ignore long runners for resolve", function () {
		var oPromiseAfter2Sec = new Promise(function (fnResolve) {
			setTimeout(fnResolve, 2000);
		});

		Promise.resolve(oPromiseAfter2Sec);

		assert.ok(timeoutCounter.hasPendingTimeouts(), "Has pending microtask");
		sinon.assert.calledWith(oDebugSpy, sinon.match(/There are [1-9] pending microtasks/));
		setTimeout(function () {
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "Has no pending microtask");
		}, 1400);

		return oPromiseAfter2Sec;
	});

	["all", "race"].forEach(function (sPromiseFunction) {
		QUnit.test("Should hook into the Promise." + sPromiseFunction + " function", function (assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]([Promise.resolve(), Promise.reject(), new Promise(function (fnResolve) { fnResolve(); })]).then(fnDone, fnDone);
			assert.ok(timeoutCounter.hasPendingTimeouts(), "Has pending microtask");
			// Promise might be wrapped twice or there are still pending ones
			sinon.assert.calledWith(oDebugSpy, sinon.match(/There are [1-9] pending microtasks/));
		});

		QUnit.test("Should ignore long runners for " + sPromiseFunction, function () {
			var oPromiseAfter2Sec = new Promise(function (fnResolve) {
				setTimeout(fnResolve, 2000);
			});

			Promise[sPromiseFunction]([oPromiseAfter2Sec, oPromiseAfter2Sec]);

			assert.ok(timeoutCounter.hasPendingTimeouts(), "Has pending microtask");
			sinon.assert.calledWith(oDebugSpy, sinon.match(/There are [1-9] pending microtasks/));
			setTimeout(function () {
				assert.ok(!timeoutCounter.hasPendingTimeouts(), "Has no pending microtask");
			}, 1400);

			return oPromiseAfter2Sec;
		});

	});
});