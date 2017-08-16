sap.ui.define([
	"jquery.sap.global",
	"unitTests/utils/loggerInterceptor"
], function ($, loggerInterceptor) {
	"use strict";

	$.sap.unloadResources("sap/ui/test/autowaiter/_promiseWaiter.js", false, true, true);
	var aLoggers = loggerInterceptor.loadAndIntercept("sap.ui.test.autowaiter._promiseWaiter");
	var oDebugSpy = sinon.spy(aLoggers[0], "debug");
	var promiseWaiter = sap.ui.test.autowaiter._promiseWaiter;

	QUnit.module("PromiseWaiter", {
		afterEach: function () {
			oDebugSpy.reset();
		}
	});

	["resolve", "reject"].forEach(function (sPromiseFunction) {
		QUnit.test("Should hook into the Promise." + sPromiseFunction + " function", function (assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]().then(fnDone, fnDone);
			assert.ok(promiseWaiter.hasPending(), "Has pending promise");
			sinon.assert.calledWithMatch(oDebugSpy, "There are 1 pending promises");
		});
	});

	QUnit.test("Should ignore long runners for resolve", function (assert) {
		var oPromiseAfter2Sec = new Promise(function (fnResolve) {
			setTimeout(fnResolve, 2000);
		});

		Promise.resolve(oPromiseAfter2Sec);

		assert.ok(promiseWaiter.hasPending(), "Has pending promise");
		sinon.assert.calledWithMatch(oDebugSpy, "There are 1 pending promises");
		setTimeout(function () {
			assert.ok(!promiseWaiter.hasPending(), "Has no pending promise");
		}, 1400);

		return oPromiseAfter2Sec;
	});

	["all", "race"].forEach(function (sPromiseFunction) {
		QUnit.test("Should hook into the Promise." + sPromiseFunction + " function", function (assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]([Promise.resolve(), Promise.reject(), new Promise(function (fnResolve) { fnResolve(); })]).then(fnDone, fnDone);
			assert.ok(promiseWaiter.hasPending(), "Has pending promise");
			// Promise might be wrapped twice or there are still pending ones
			sinon.assert.calledWithMatch(oDebugSpy, /There are [3-6] pending promises/);
		});

		QUnit.test("Should ignore long runners for " + sPromiseFunction, function (assert) {
			var oPromiseAfter2Sec = new Promise(function (fnResolve) {
				setTimeout(fnResolve, 2000);
			});

			Promise[sPromiseFunction]([oPromiseAfter2Sec, oPromiseAfter2Sec]);

			assert.ok(promiseWaiter.hasPending(), "Has pending promise");
			sinon.assert.calledWithMatch(oDebugSpy, "There are 3 pending promises");
			setTimeout(function () {
				assert.ok(!promiseWaiter.hasPending(), "Has no pending promise");
			}, 1400);

			return oPromiseAfter2Sec;
		});

	});

	QUnit.test("Should have configurable max promise delay", function (assert) {
		promiseWaiter.extendConfig({maxDelay: 400});
		var oPromise = new Promise(function (fnResolve) {
			setTimeout(fnResolve, 900);
		});

		Promise.resolve(oPromise);
		assert.ok(promiseWaiter.hasPending(), "Has pending promise");
		setTimeout(function () {
			assert.ok(!promiseWaiter.hasPending(), "Has no pending promise");
		}, 900);

		return oPromise;
	});
});
