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

	QUnit.module("timeoutCounter - no timeouts");

	QUnit.test("Should return that there are no pending timeouts", function (assert) {
		assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
		sinon.assert.notCalled(oDebugSpy);
	});

	QUnit.test("Should return that there are no pending Timeouts if a timeout has finished", function (assert) {
		var fnDone = assert.async();
		setTimeout(function () {
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

	QUnit.module("timeoutCounter - single timeout");

	QUnit.test("Should respect the this pointer", function (assert) {
		var oThis = {},
			fnDone = assert.async(),
			fnSpy = sinon.spy(function () {
				sinon.assert.calledOn(fnSpy, oThis);
				fnDone();
			});

		setTimeout($.proxy(fnSpy, oThis));
	});

	QUnit.test("Should handle a single timeout", function (assert) {
		var fnDone = assert.async();

		setTimeout(function () {
			assertLog(1);
			fnDone();
		});

		assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
	});


	QUnit.module("timeoutCounter - multiple timeouts", {
		afterEach: function () {
			oDebugSpy.reset();
		}
	});

	QUnit.test("Should handle a 2 timeouts", function (assert) {
		var fnFirstTimeoutDone = assert.async();
		var fnSecondTimeoutDone = assert.async();

		setTimeout(function () {
			assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
			assertLog(1);
			oDebugSpy.reset();
			fnFirstTimeoutDone();
		});

		setTimeout(function () {
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

		setTimeout(function () {
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "There was no timeout");
			setTimeout(function () {
				assert.ok(!timeoutCounter.hasPendingTimeouts(), "There was no timeout");
				fnDone();
			});
			assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
		});

		assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
	});

	QUnit.module("timeoutCounter - clear timeout", {
		afterEach: function () {
			oDebugSpy.reset();
		}
	});

	QUnit.test("Should clear a timeout", function (assert) {
		var iId = setTimeout(function () {
		});
		clearTimeout(iId);
		assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
		sinon.assert.notCalled(oDebugSpy);
	});


	QUnit.test("Should clear 1 of 2 timeouts", function (assert) {
		var fnDone = assert.async();
		setTimeout(function () {
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts");
			sinon.assert.notCalled(fnSecondTimeoutSpy);
			fnDone();
		},20);
		var fnSecondTimeoutSpy = sinon.spy();
		var iId = setTimeout(fnSecondTimeoutSpy);
		clearTimeout(iId);
		assert.ok(timeoutCounter.hasPendingTimeouts(), "There was a timeout");
		assertLog(1);
	});

	QUnit.module("timeoutCounter - infinite timeout loops", {
		afterEach: function () {
			oDebugSpy.reset();
		}
	});

	QUnit.test("Should detect a infinite timeout loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(setTimeout(addTimeout, 20));
		}

		setTimeout(function () {
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			sinon.assert.notCalled(oDebugSpy);
			aTimeouts.forEach(function (iID) {
				clearTimeout(iID);
			});
			fnDone();
		}, 400);
		addTimeout();
	});

	QUnit.test("Should detect a infinite timeout loop with 2 timeouts added per loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(setTimeout(addTimeout, 20));
			aTimeouts.push(setTimeout(addTimeout, 20));
		}

		setTimeout(function () {
			assert.ok(!timeoutCounter.hasPendingTimeouts(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			sinon.assert.notCalled(oDebugSpy);
			aTimeouts.forEach(function (iID) {
				clearTimeout(iID);
			});
			fnDone();
		}, 200);
		addTimeout();
	});
});