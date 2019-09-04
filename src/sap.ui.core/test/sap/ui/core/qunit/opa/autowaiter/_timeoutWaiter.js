/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/autowaiter/_timeoutWaiter"
], function ($, timeoutWaiter) {
	"use strict";

	var fnSetTimeout = window["setTimeout"];
	var fnClearTimeout = window["clearTimeout"];

	["Timeout", "Immediate"].forEach(function (sFunctionUnderTest) {
		var fnSetFunction = window["set" + sFunctionUnderTest];
		var fnClearFunction = window["clear" + sFunctionUnderTest];

		if (!fnSetFunction) {
			$.sap.log.debug("Skipped tests because" + sFunctionUnderTest + " is not defined in this browser");
			return;
		}

		QUnit.module("timeoutWaiter - no " + sFunctionUnderTest);

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
		});

		QUnit.test("Should return that there are no pending Timeouts if a timeout has finished", function (assert) {
			var fnDone = assert.async();
			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
				fnDone();
			}, 100);
		});

		QUnit.test("Should ignore long runners", function (assert) {
			var iID = fnSetFunction(function () {}, 1001);
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
			fnClearFunction(iID);
		});

		QUnit.test("Should have configurable max timeout delay", function (assert) {
			timeoutWaiter.extendConfig({timeoutWaiter: {maxDelay: 3000}});
			var iID = fnSetFunction(function () {}, 1001);
			var iIDIgnored = fnSetFunction(function () {}, 3001);

			assert.ok(timeoutWaiter.hasPending(), "there is 1 pending timeout");
			fnClearFunction(iID);
			fnClearFunction(iIDIgnored);
			// reset to default value
			timeoutWaiter.extendConfig({timeoutWaiter: {maxDelay: 1000}});
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
				fnDone();
			});

			assert.ok(timeoutWaiter.hasPending(), "There was a timeout");
		});

		QUnit.module("timeoutWaiter - multiple " + sFunctionUnderTest);

		QUnit.test("Should handle 2 timeouts", function (assert) {
			var fnFirstTimeoutDone = assert.async();
			var fnSecondTimeoutDone = assert.async();

			fnSetFunction(function () {
				assert.ok(timeoutWaiter.hasPending(), "First timeout has compled");
				fnFirstTimeoutDone();
			});

			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "Both timeouts have completed");
				fnSecondTimeoutDone();
			}, 20);

			assert.ok(timeoutWaiter.hasPending(), "Both timeouts are scheduled");
		});

		QUnit.test("Should handle a timeout that adds a timeout", function (assert) {
			var fnDone = assert.async();

			fnSetFunction(function () {
				assert.ok(!timeoutWaiter.hasPending(), "First timeout has completed");
				fnSetFunction(function () {
					assert.ok(!timeoutWaiter.hasPending(), "Second timeout has completed");
					fnDone();
				});
				assert.ok(timeoutWaiter.hasPending(), "Second timeout is scheduled");
			});
			assert.ok(timeoutWaiter.hasPending(), "First timeout is scheduled");
		});

		QUnit.module("timeoutWaiter - clear " + sFunctionUnderTest);

		QUnit.test("Should clear a timeout", function (assert) {
			var iId = fnSetFunction(function () {});
			fnClearFunction(iId);
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts");
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
		});
	});

	QUnit.module("timeoutWaiter - infinite timeout loops");

	QUnit.test("Should detect a infinite timeout loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(fnSetTimeout(addTimeout, 30));
		}

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 600);
		addTimeout();
	});

	QUnit.test("Should detect a infinite timeout loop with 2 timeouts added per loop", function (assert) {
		var fnDone = assert.async();
		var aTimeouts = [];

		function addTimeout () {
			aTimeouts.push(fnSetTimeout(addTimeout, 40));
			aTimeouts.push(fnSetTimeout(addTimeout, 40));
		}

		fnSetTimeout(function () {
			assert.ok(!timeoutWaiter.hasPending(), "there are no pending timeouts - spawned " + aTimeouts.length + " timeouts");
			aTimeouts.forEach(function (iID) {
				fnClearTimeout(iID);
			});
			fnDone();
		}, 600);
		addTimeout();
	});
});
