/*global QUnit */
/*eslint max-nested-callbacks: [2,4]*/
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_promiseWaiter"
], function (_LogCollector, _OpaLogger, _promiseWaiter) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();
	var mResolveValue = {value: "value"};
	var mRejectValue = {error: "value"};

	QUnit.module("PromiseWaiter", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
			_promiseWaiter.extendConfig({
				maxDelay: 1000
			});
		}
	});

	QUnit.test("Should hook into the Promise constructor and remove from pending when 'then' is called", function (assert) {
		var fnDone = assert.async();
		var oPromise = new Promise(function (resolve) {
			setTimeout(function () {
				resolve(mResolveValue);
			}, 50);
		}).then(function (vData) {
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises");
			assert.strictEqual(vData, mResolveValue, "Should resolve with the expected value");
			fnDone();
		}, fnDone);
		assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
		return oPromise;
	});


	QUnit.test("Should hook into the Promise constructor and remove from pending when 'finally' is called", function (assert) {
		var fnDone = assert.async();
		var oPromise = new Promise(function (resolve) {
			setTimeout(function () {
				resolve(mResolveValue);
			}, 50);
		}).finally(function (vData) {
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises");
			assert.ok(!vData, "Should settle with no value");
			fnDone();
		});
		assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
		return oPromise;
	});

	QUnit.test("Should hook into the Promise constructor and remove from pending when 'catch' is called", function (assert) {
		var fnDone = assert.async();
		var oPromise = new Promise(function (resolve, reject) {
			setTimeout(function () {
				reject(mRejectValue);
			}, 50);
		}).catch(function (vData) {
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises");
			assert.strictEqual(vData, mRejectValue, "Should reject with the expected value");
			fnDone();
		});
		assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
		return oPromise;
	});

	QUnit.test("Should log args and execution stack trace", function callingFunction(assert) {
		var fnDone = assert.async();
		var oPromise = new Promise(function (resolve, reject) {
			setTimeout(function () {
				reject(mResolveValue);
			}, 50);
		}).catch(function (vData) {
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises");
			assert.strictEqual(vData, mResolveValue, "Should resolve with the expected value");
			assert.ok(oLogCollector.getAndClearLog().match(new Error().stack ? "callingFunction" : "No stack trace available"));
			fnDone();
		});
		assert.ok(_promiseWaiter.hasPending(), "Has pending promise");
		return oPromise;
	});

	QUnit.test("Should have configurable max promise delay and ignore long-running promises", function (assert) {
		_promiseWaiter.extendConfig({
			maxDelay: 50
		});
		var oPromise = new Promise(function longRunner (fnResolve) {
			setTimeout(function () {
				fnResolve();
			}, 100);
		});
		assert.ok(_promiseWaiter.hasPending(), "Has pending promise");

		setTimeout(function () {
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promise");
			assert.ok(oLogCollector.getAndClearLog().match("Long-running promise is ignored:\nPromise: Args: 'function longRunner"));
		}, 75);

		return oPromise;
	});

	QUnit.test("Should ignore polling promise - start in then", function (assert) {
		var done = assert.async();
		var fnCancel;
		var createPromise = function createPromise(i) {

			if (i == 1) {
				// check for pending just before the discard moment
				setTimeout(function checkPending75() {
					assert.ok(_promiseWaiter.hasPending(), "Parallel flow - Has pending promises");
				},25);
			}

			if (i == 2) {
				// check for pending just after the discard moment
				setTimeout(function checkPending125() {
					assert.ok(!_promiseWaiter.hasPending(), "Parallel flow - Has no pending promises - pollings are ignored");
				},25);
			}

			if (i == 3) {
				// start new parallel promise
				setTimeout(function startParallel() {
					new Promise(function (resolve, reject) {
						fnCancel = function() {
							resolve();
						};
					});
				},25);
			}

			if (i == 4) {
				// and check it is holding the waiter
				setTimeout(function checkPending225() {
					assert.ok(_promiseWaiter.hasPending(), "Parallel flow - Has pending promises - new promise");
				},25);
			}

			if (i == 5) {
				setTimeout(function stopParallel() {
					fnCancel();
				},25);
			}

			if (i < 7) {
				return new Promise(function pollingPromise(resolve) {
						setTimeout(function pollingPromiseTimeout() {
							resolve();
						}, 50);
					}).then(function pollingPromiseThen() {
						return createPromise(i + 1);
					});
			}
			assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises - all are resolved");
			var sLog = oLogCollector.getAndClearLog();
			assert.strictEqual(sLog.match(/Polling promise is ignored:\nPromise: Args: 'function pollingPromise/g).length, 2, "Should see polling promise discard log");
			done();
		};
		var chain = Promise.resolve();
		chain.then(function boostrapPromise() {
			return createPromise(0);
		});
		assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises yet - one will be started in microtask");
	});

	QUnit.test("Should ignore polling promise - start after resolve is called", function (assert) {
		var done = assert.async();
		var createPromise = function (i) {
			assert.ok(true, "Create promise with index: " + i);
			return new Promise(function pollingPromise (resolve) {
				setTimeout(function () {
					resolve();
					if (i == 0) {
						// check for pending just before the discard moment
						setTimeout(function checkPending75() {
							assert.ok(_promiseWaiter.hasPending(), "Parallel flow - Has pending promises");
						},25);
					}

					if (i == 1) {
						// check for pending just after the discard moment
						setTimeout(function checkPending125() {
							assert.ok(!_promiseWaiter.hasPending(), "Parallel flow - Has no pending promises - pollings are ignored");
						},25);
					}

					if (i < 4) {
						createPromise(i + 1);
						return;
					}
					assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises - all are resolved");
					var sLog = oLogCollector.getAndClearLog();
					assert.strictEqual(sLog.match(/Polling promise is ignored:\nPromise: Args: 'function pollingPromise/g).length, 1, "Should see polling promise discard log");
					done();
				}, 50);
			});
		};
		createPromise(0);
		assert.ok(_promiseWaiter.hasPending(), "Has pending promises - one is started");
	});

	QUnit.test("Should ignore polling promise - start before resolve is called", function (assert) {
		var done = assert.async();
		var createPromise = function (i) {
			assert.ok(true, "Create promise with index: " + i);
			return new Promise(function pollingPromise (resolve) {
				setTimeout(function () {
					if (i == 0) {
						// check for pending just before the discard moment
						setTimeout(function checkPending75() {
							assert.ok(_promiseWaiter.hasPending(), "Parallel flow - Has pending promises");
						},25);
					}

					if (i == 1) {
						// check for pending just after the discard moment
						setTimeout(function checkPending125() {
							assert.ok(!_promiseWaiter.hasPending(), "Parallel flow - Has no pending promises - pollings are ignored");
						},25);
					}

					if (i < 4) {
						createPromise(i + 1);
						resolve();
						return;
					}
					resolve();

					assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises - all are resolved");
					var sLog = oLogCollector.getAndClearLog();
					assert.strictEqual(sLog.match(/Polling promise is ignored:\nPromise: Args: 'function pollingPromise/g).length, 1, "Should see polling promise discard log");
					done();
				}, 50);
			});
		};
		createPromise(0);
		assert.ok(_promiseWaiter.hasPending(), "Has pending promises - one is started");
	});

	QUnit.test("Should ignore promises marked with 'ignore' tracking flag", function (assert) {
		var fnDone = assert.async();
		var oPromise = new Promise(function (resolve) {
			setTimeout(function () {
				resolve(mResolveValue);
			}, 50);
		}, "PROMISE_WAITER_IGNORE").then(function (vData) {
			assert.strictEqual(vData, mResolveValue, "Should resolve with the expected value");
			fnDone();
		}, fnDone);
		assert.ok(!_promiseWaiter.hasPending(), "Has no pending promises");
		return oPromise;
	});
});
