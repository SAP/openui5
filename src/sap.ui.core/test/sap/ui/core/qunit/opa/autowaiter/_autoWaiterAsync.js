sap.ui.define([
	"jquery.sap.global",
	"unitTests/utils/loggerInterceptor",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/_opaCorePlugin",
	"sap/ui/test/autowaiter/_autoWaiterLogCollector"
], function ($, loggerInterceptor, _autoWaiter, _opaCorePlugin, _autoWaiterLogCollector) {
	"use strict";

	$.sap.unloadResources("sap/ui/test/autowaiter/_autoWaiterAsync.js", false, true, true);
	var oLogger = loggerInterceptor.loadAndIntercept("sap.ui.test.autowaiter._autoWaiterAsync")[0];
	var iPollInterval = 400;
	var iPollTimeout = 15000;

	QUnit.module("AutoWaiterAsync", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.fnCallbackSpy = sinon.spy();
			this.fnHasToWaitStub = sinon.stub(sap.ui.test.autowaiter._autoWaiter, "hasToWait");
			this.autoWaiterAsync = sap.ui.test.autowaiter._autoWaiterAsync;
		},
		afterEach: function () {
			this.clock.restore();
			this.fnHasToWaitStub.restore();
		}
	});

	QUnit.test("Should poll until wait conditions are met", function (assert) {
		this.fnHasToWaitStub.returns(true).onCall(1).returns(false);

		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

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

		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(iPollInterval);
		assert.ok(this.fnHasToWaitStub.calledOnce, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback when the autoWaiter conditions are met");
		assert.ok(!this.fnCallbackSpy.args[0][0], "Should invoke the callback with no arguments");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should timeout if conditions cannot be met in a given timeframe", function (assert) {
		var iTimeoutAttempts = Math.ceil(iPollTimeout / iPollInterval);
		this.fnHasToWaitStub.returns(true);

		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(iTimeoutAttempts * iPollInterval);
		assert.strictEqual(this.fnHasToWaitStub.callCount, iTimeoutAttempts, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback");
		assert.ok(this.fnCallbackSpy.calledWithMatch(/timeout/), "Should invoke the callback with the error message as an argument");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should not fail if no callback was passed", function (assert) {
		this.fnHasToWaitStub.returns(false);
		this.autoWaiterAsync.waitAsync();

		this.clock.tick(iPollInterval);
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.test("Should be able to change the polling times", function (assert) {
		this.fnHasToWaitStub.returns(true);
		var oConfig = {interval: 200, timeout: 1000};

		this.autoWaiterAsync.extendConfig(oConfig);
		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(200);
		assert.ok(this.fnHasToWaitStub.calledOnce, "Should poll for autoWaiter conditions to be met");

		this.clock.tick(1200);
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback");
		assert.ok(this.fnCallbackSpy.calledWithMatch(/timeout/), "Should invoke the callback with an error message containing the correct timeout value");
	});

	QUnit.test("Should not start a second wait", function (assert) {
		this.fnHasToWaitStub.returns(true).onCall(1).returns(false);
		var fnCallbackSpy = sinon.spy();
		var fnCallbackSecondSpy = sinon.spy();
		var autoWaiterAsync = sap.ui.test.autowaiter._autoWaiterAsync;

		autoWaiterAsync.waitAsync(fnCallbackSpy);
		autoWaiterAsync.waitAsync(fnCallbackSecondSpy);

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
		var fnGetAndClearLogStub = sinon.stub(sap.ui.test.autowaiter._autoWaiterLogCollector, "getAndClearLog");
		var fnStartLogSpy = sinon.spy(sap.ui.test.autowaiter._autoWaiterLogCollector, "start");
		var fnStopLogSpy = sinon.spy(sap.ui.test.autowaiter._autoWaiterLogCollector, "stop");
		fnGetAndClearLogStub.returns(sAutoWaiterLog);
		this.fnHasToWaitStub.returns(true);

		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		assert.ok(fnStartLogSpy.calledOnce, "Should start listening for log entries");
		this.clock.tick(iTimeoutAttempts * iPollInterval);
		assert.strictEqual(fnGetAndClearLogStub.callCount, this.fnHasToWaitStub.callCount, "Should clear the log before hasToWait call");

		assert.ok(this.fnCallbackSpy.calledWithMatch(/there is still pending asynchronous work/), 
			"Should invoke the callback with the pending work log");
		assert.ok(fnStopLogSpy.calledOnce, "Should stop listening for log entries on polling stop");

		fnGetAndClearLogStub.restore();
		fnStartLogSpy.restore();
		fnStopLogSpy.restore();
	});

	QUnit.module("AutoWaiterAsync - autoWait timeout waiter", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.fnHasPendingStub = sinon.stub(sap.ui.test.autowaiter._XHRWaiter, "hasPending");
			// ensure setTimeout is called once in waitAsync
			this.fnHasPendingStub.returns(false).onCall(1).returns(true);
		},
		afterEach: function () {
			this.clock.restore();
			this.fnHasPendingStub.restore();
		}
	});

	// the delayed function is wrapped by _timeoutWaiter and when it is executed,
	// _timeoutWaiter stops tracking the corresponding setTimeout function before executing the original delayed function
	// as a result, there are no pending timeouts at the moment when hasToWait is performed
	QUnit.test("Should ignore the waitAsync timeout in autoWaiter check", function (assert) {
		var fnCallbackSpy = sinon.spy();
		var autoWaiterAsync = sap.ui.test.autowaiter._autoWaiterAsync;

		autoWaiterAsync.waitAsync(fnCallbackSpy);

		this.clock.tick(iPollInterval);
		assert.ok(fnCallbackSpy.calledOnce, "Should invoke the callback when the autoWaiter conditions are met");
		assert.ok(!fnCallbackSpy.args[0][0], "Should invoke the callback with no arguments");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	/* timeoutWaiter is not enabled now
	QUnit.module("AutoWaiterAsync - config timeout Waiter");

	QUnit.test("Should be able to change _timeoutWaiter config", function (assert) {
		var fnCallbackSpy = sinon.spy();
		var autoWaiterAsync = sap.ui.test.autowaiter._autoWaiterAsync;
		var aHasPendingTimeoutsResults = [];
		var fnHasPendingTimeouts = sap.ui.test.autowaiter._timeoutWaiter.hasPending;

		sap.ui.test.autowaiter._timeoutWaiter.hasPending = function () {
			var bHasPendingTimeouts = fnHasPendingTimeouts();
			aHasPendingTimeoutsResults.push(bHasPendingTimeouts);
			return bHasPendingTimeouts;
		};

		autoWaiterAsync.extendConfig({timeoutWaiter: {maxDelay: 400}});
		setTimeout(function () {},  401);
		autoWaiterAsync.waitAsync(fnCallbackSpy);

		assert.ok(!aHasPendingTimeoutsResults[0], "Should ignore long running timeout");
		assert.ok(fnCallbackSpy.calledOnce, "Should invoke the callback when the autoWaiter conditions are met");

		sap.ui.test.autowaiter._timeoutWaiter.hasPending = fnHasPendingTimeouts;
	});
	*/
});
