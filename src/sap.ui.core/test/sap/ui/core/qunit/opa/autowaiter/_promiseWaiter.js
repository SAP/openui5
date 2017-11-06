sap.ui.define([
	"jquery.sap.global",
	"unitTests/utils/loggerInterceptor",
	"sap/ui/test/Opa5"
], function ($, loggerInterceptor, Opa5) {
	"use strict";

	$.sap.unloadResources("sap/ui/test/autowaiter/_promiseWaiter.js", false, true, true);
	var aLoggers = loggerInterceptor.loadAndIntercept("sap.ui.test.autowaiter._promiseWaiter");
	var oTraceSpy = sinon.spy(aLoggers[0], "trace");
	var oDebugSpy = sinon.spy(aLoggers[1], "debug");
	var promiseWaiter = sap.ui.test.autowaiter._promiseWaiter;

	QUnit.module("PromiseWaiter", {
		afterEach: function () {
			oDebugSpy.reset();
			oTraceSpy.reset();
		}
	});

	["resolve", "reject"].forEach(function (sPromiseFunction) {
		QUnit.test("Should hook into the Promise." + sPromiseFunction + " function", function (assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]().then(function () {
				sinon.assert.calledWithMatch(oTraceSpy, "Promise complete:\nPromise: Function: " + sPromiseFunction);
				fnDone();
			}, fnDone);
			assert.ok(promiseWaiter.hasPending(), "Has pending promise");
			sinon.assert.calledWithMatch(oDebugSpy, "There are 1 pending promises");
			sinon.assert.calledWithMatch(oTraceSpy, "New pending promise:\nPromise: Function: " + sPromiseFunction);
		});

		QUnit.test("Should log args and execution stack trace", function callingFunction(assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction](["test", function fnPromiseArg () {}, {a: 2, b: "foo"}]).then(fnDone, fnDone);
			assert.ok(promiseWaiter.hasPending(), "Has pending promise");
			sinon.assert.calledWithMatch(oDebugSpy, "There are 1 pending promises");
			sinon.assert.calledWithMatch(oDebugSpy, "\nPromise: Function: " + sPromiseFunction + " Args: ['test', '");
			sinon.assert.calledWithMatch(oDebugSpy, "function fnPromiseArg");
			sinon.assert.calledWithMatch(oDebugSpy, "', {\"a\":2,\"b\":\"foo\"}] Stack: ");
			sinon.assert.calledWithMatch(oDebugSpy, new Error().stack ? "callingFunction" : "No stack trace available");
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
			sinon.assert.calledWithMatch(oTraceSpy, "Long-running promise is ignored:\nPromise: Function: resolve Args:");
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
			sinon.assert.calledWithMatch(oDebugSpy, "Promise: Function: " + sPromiseFunction);
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
				sinon.assert.calledWithMatch(oTraceSpy, "Long-running promise is ignored:\nPromise: Function: " + sPromiseFunction);
			}, 1400);

			return oPromiseAfter2Sec;
		});

		QUnit.test("Should log args and execution stack trace", function callingFunction(assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]([new Promise(function (fnResolve) { fnResolve(); }), Promise.resolve({foo: "bar", foo2: [1]})]).then(fnDone, fnDone);
			assert.ok(promiseWaiter.hasPending(), "Has pending promise");
			sinon.assert.calledWithMatch(oDebugSpy, /There are [2-4] pending promises/);
			sinon.assert.calledWithMatch(oDebugSpy, "Args: {\"foo\":\"bar\",\"foo2\":[1]} Stack: ");
			sinon.assert.calledWithMatch(oDebugSpy, new Error().stack ? "callingFunction" : "No stack trace available");
		});
	});

	QUnit.test("Should have configurable max promise delay", function (assert) {
		promiseWaiter.extendConfig({timeoutWaiter: {maxDelay: 10}});
		var fnDone = assert.async();
		var oPromise = new Promise(function (fnResolve) {
			setTimeout(fnResolve, 20);
		});

		Promise.resolve(oPromise);
		setTimeout(function () {
			assert.ok(!promiseWaiter.hasPending(), "Has no pending promise");
			sinon.assert.calledWithMatch(oTraceSpy, "Long-running promise is ignored:\nPromise: Function: resolve Args:");
			fnDone();
		}, 30);
	});
});
