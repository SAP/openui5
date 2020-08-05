/*global QUnit */
/*eslint max-nested-callbacks: [2,4]*/
sap.ui.define([
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_LogCollector",
	"sap/ui/test/autowaiter/_promiseWaiter"
], function (_OpaLogger, _LogCollector, _promiseWaiter) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("PromiseWaiter", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
		}
	});

	["resolve", "reject"].forEach(function (sPromiseFunction) {
		QUnit.test("Should hook into the Promise." + sPromiseFunction + " function", function (assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]().then(function () {
				assert.ok(!_promiseWaiter.hasPending(), "Has no pending promise");
				fnDone();
			}, fnDone);
			assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
		});

		QUnit.test("Should log args and execution stack trace", function callingFunction(assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction](["test", function fnPromiseArg () {}, {a: 2, b: "foo"}]).then(fnDone, fnDone);
			assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
			var sLog = oLogCollector.getAndClearLog();
			assert.ok(sLog.match("There are 1 pending promises"));
			assert.ok(sLog.match("\nPromise: Function: " + sPromiseFunction + " Args: \\['test', '"));
			assert.ok(sLog.match("function fnPromiseArg"));
			assert.ok(sLog.match("', {\"a\":2,\"b\":\"foo\"}] Stack: "));
			assert.ok(sLog.match(new Error().stack ? "callingFunction" : "No stack trace available"));
		});
	});

	QUnit.test("Should ignore long runners for resolve", function (assert) {
		var oPromiseAfter2Sec = new Promise(function (fnResolve) {
			setTimeout(fnResolve, 2000);
		});

		Promise.resolve(oPromiseAfter2Sec);

		assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
		assert.ok(oLogCollector.getAndClearLog().match("There are 1 pending promises"));
		setTimeout(function () {
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promise");
			assert.ok(oLogCollector.getAndClearLog().match("Long-running promise is ignored:\nPromise: Function: resolve Args:"));
		}, 1400);

		return oPromiseAfter2Sec;
	});

	["all", "race"].forEach(function (sPromiseFunction) {
		QUnit.test("Should hook into the Promise." + sPromiseFunction + " function", function (assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]([Promise.resolve(), Promise.reject(), new Promise(function (fnResolve) { fnResolve(); })]).then(fnDone, fnDone);
			assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
			// Promise might be wrapped twice or there are still pending ones
			var sLog = oLogCollector.getAndClearLog();
			assert.ok(sLog.match(/There are [3-6] pending promises/));
			assert.ok(sLog.match("Promise: Function: " + sPromiseFunction));
		});

		QUnit.test("Should ignore long runners for " + sPromiseFunction, function (assert) {
			var oPromiseAfter2Sec = new Promise(function (fnResolve) {
				setTimeout(fnResolve, 2000);
			});

			Promise[sPromiseFunction]([oPromiseAfter2Sec, oPromiseAfter2Sec]);

			assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
			assert.ok(oLogCollector.getAndClearLog().match("There are 3 pending promises"));
			setTimeout(function () {
				assert.ok(!_promiseWaiter.hasPending(), "Has no pending promise");
				assert.ok(oLogCollector.getAndClearLog().match("Long-running promise is ignored:\nPromise: Function: " + sPromiseFunction));
			}, 1400);

			return oPromiseAfter2Sec;
		});

		QUnit.test("Should log args and execution stack trace", function callingFunction(assert) {
			var fnDone = assert.async();
			Promise[sPromiseFunction]([new Promise(function (fnResolve) { fnResolve(); }), Promise.resolve({foo: "bar", foo2: [1]})]).then(fnDone, fnDone);
			assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
			var sLog = oLogCollector.getAndClearLog();
			assert.ok(sLog.match(/There are [2-4] pending promises/));
			assert.ok(sLog.match("Args: {\"foo\":\"bar\",\"foo2\":\\[1\\]} Stack: "));
			assert.ok(sLog.match(new Error().stack ? "callingFunction" : "No stack trace available"));
		});
	});

	QUnit.test("Should have configurable max promise delay", function (assert) {
		_promiseWaiter.extendConfig({timeoutWaiter: {maxDelay: 10}});
		var fnDone = assert.async();
		var oPromise = new Promise(function (fnResolve) {
			setTimeout(fnResolve, 20);
		});

		Promise.resolve(oPromise);
		assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
		setTimeout(function () {
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promise");
			assert.ok(oLogCollector.getAndClearLog().match("Long-running promise is ignored:\nPromise: Function: resolve Args:"));
			fnDone();
		}, 30);
	});
});
