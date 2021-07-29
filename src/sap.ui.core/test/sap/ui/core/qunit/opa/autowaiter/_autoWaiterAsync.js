/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_autoWaiterAsync",
	"sap/ui/test/_LogCollector"
], function ($, _autoWaiter, _XHRWaiter, _timeoutWaiter, _autoWaiterAsync, _LogCollector) {
	"use strict";

	var iPollInterval = 400;
	var iPollTimeout = 15000;

	QUnit.module("AutoWaiterAsync", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.fnCallbackSpy = sinon.spy();
			this.fnHasToWaitStub = sinon.stub(_autoWaiter, "hasToWait");
		},
		afterEach: function () {
			this.clock.restore();
			this.fnHasToWaitStub.restore();
		}
	});

	QUnit.test("Should poll until wait conditions are met", function (assert) {
		this.fnHasToWaitStub.returns(true).onCall(1).returns(false);

		_autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(iPollInterval);
		assert.ok(this.fnHasToWaitStub.calledOnce, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.notCalled, "Should poll for autoWaiter conditions to be met before invoking the callback");

		this.clock.tick(iPollInterval);
		assert.ok(this.fnHasToWaitStub.calledTwice, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback when the autoWaiter conditions are met");
		assert.ok(!this.fnCallbackSpy.args[0][0], "Should invoke the callback with no arguments");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should end immediately if condition is already met", function (assert) {
		this.fnHasToWaitStub.returns(false);

		_autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(iPollInterval);
		assert.ok(this.fnHasToWaitStub.calledOnce, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback when the autoWaiter conditions are met");
		assert.ok(!this.fnCallbackSpy.args[0][0], "Should invoke the callback with no arguments");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should timeout if conditions cannot be met in a given timeframe", function (assert) {
		var iTimeoutAttempts = Math.ceil(iPollTimeout / iPollInterval);
		this.fnHasToWaitStub.returns(true);

		_autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(iTimeoutAttempts * iPollInterval);
		assert.strictEqual(this.fnHasToWaitStub.callCount, iTimeoutAttempts, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback");
		assert.ok(this.fnCallbackSpy.calledWithMatch(/timeout/), "Should invoke the callback with the error message as an argument");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should not fail if no callback was passed", function (assert) {
		this.fnHasToWaitStub.returns(false);
		_autoWaiterAsync.waitAsync();

		this.clock.tick(iPollInterval);
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should be able to change the polling times", function (assert) {
		this.fnHasToWaitStub.returns(true);
		var oConfig = {interval: 200, timeout: 1000};

		_autoWaiterAsync.extendConfig(oConfig);
		_autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(200);
		assert.ok(this.fnHasToWaitStub.calledOnce, "Should poll for autoWaiter conditions to be met");

		this.clock.tick(1200);
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback");
		assert.ok(this.fnCallbackSpy.calledWithMatch(/timeout/), "Should invoke the callback with an error message containing the correct timeout value");
	});

	QUnit.test("Should validate the polling times", function (assert) {
		assert.throws(function () {
			_autoWaiterAsync.extendConfig({
				interval: "random"
			});
		}, /needs to be a positive numeric/);

		assert.throws(function () {
			_autoWaiterAsync.extendConfig({
				timeout: 0
			});
		}, /needs to be a positive numeric/);
	});

	QUnit.test("Should accept unknown config", function (assert) {
		var fnConfigSpy = sinon.spy(_autoWaiter, "extendConfig");
		_autoWaiterAsync.extendConfig({
			interval: 200,
			timeoutWaiter: {
				maxDelay: 3000
			}
		});
		assert.ok(fnConfigSpy.calledOnce);
		assert.ok(fnConfigSpy.calledWithMatch({
			timeoutWaiter: {
				maxDelay: 3000
			}
		}));
		fnConfigSpy.restore();
	});

	QUnit.test("Should not start a second wait", function (assert) {
		this.fnHasToWaitStub.returns(true).onCall(1).returns(false);
		var fnCallbackSpy = sinon.spy();
		var fnCallbackSecondSpy = sinon.spy();

		_autoWaiterAsync.waitAsync(fnCallbackSpy);
		_autoWaiterAsync.waitAsync(fnCallbackSecondSpy);

		this.clock.tick(iPollInterval);
		assert.ok(fnCallbackSpy.calledOnce, "Should invoke the callback for the successful waiter");
		assert.ok(!fnCallbackSpy.args[0][0], "Should invoke the callback with no arguments when the first wait completes");
		assert.ok(fnCallbackSpy.calledOnce, "Should invoke the callback for the waiter that is not started");
		assert.ok(fnCallbackSecondSpy.calledWithMatch(/waitAsync is already running/),
			"Should invoke the callback with an error message on second start");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should log autoWaiter pending work on timeout", function (assert) {
		var iTimeoutAttempts = Math.ceil(iPollTimeout / iPollInterval);
		var sAutoWaiterLog = "autoWaiterLogCollector#getAndClearLog";
		var fnGetAndClearLogStub = sinon.stub(_LogCollector.prototype, "getAndClearLog");
		var fnStartLogSpy = sinon.spy(_LogCollector.prototype, "start");
		var fnDestroyLogSpy = sinon.spy(_LogCollector.prototype, "destroy");
		fnGetAndClearLogStub.returns(sAutoWaiterLog);
		this.fnHasToWaitStub.returns(true);

		_autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		assert.ok(fnStartLogSpy.calledOnce, "Should start listening for log entries");
		this.clock.tick(iTimeoutAttempts * iPollInterval);
		assert.strictEqual(fnGetAndClearLogStub.callCount, this.fnHasToWaitStub.callCount, "Should clear the log before hasToWait call");

		assert.ok(this.fnCallbackSpy.calledWithMatch(/there is still pending asynchronous work/),
			"Should invoke the callback with the pending work log");
		assert.ok(fnDestroyLogSpy.calledOnce, "Should stop listening for log entries on polling stop");

		fnGetAndClearLogStub.restore();
		fnStartLogSpy.restore();
		fnDestroyLogSpy.restore();
	});
});
