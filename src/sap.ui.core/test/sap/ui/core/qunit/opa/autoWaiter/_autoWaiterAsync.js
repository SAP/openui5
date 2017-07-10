sap.ui.define([
	"jquery.sap.global",
	"unitTests/utils/loggerInterceptor",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_XHRCounter",
	"sap/ui/test/_opaCorePlugin"
], function ($, loggerInterceptor, _autoWaiter, _opaCorePlugin) {
	"use strict";

	$.sap.unloadResources("sap/ui/test/autowaiter/_autoWaiterAsync.js", false, true, true);
	var oLogger = loggerInterceptor.loadAndIntercept("sap.ui.test.autowaiter._autoWaiterAsync");
	var iPollInterval = 400;
	var iPollTimeout = 15;

	QUnit.module("AutoWaiterAsync", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.fnCallbackSpy = sinon.spy();
			this.fnHasToWaitStub = sinon.stub(sap.ui.test.autowaiter._autoWaiter, "hasToWait");
			this.autoWaiterAsync = sap.ui.test.autowaiter._autoWaiterAsync;
			this.oLoggerSpy = sinon.spy(oLogger, "debug");
		},
		afterEach: function () {
			this.clock.restore();
			this.oLoggerSpy.restore();
			this.fnHasToWaitStub.restore();
		}
	});

	QUnit.test("Should poll until wait conditions are met", function (assert) {
		this.fnHasToWaitStub.returns(true).onCall(2).returns(false);

		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(iPollInterval);
		assert.ok(this.fnHasToWaitStub.calledTwice, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.notCalled, "Should poll for autoWaiter conditions to be met before invoking the callback");

		this.clock.tick(iPollInterval);
		assert.ok(this.fnHasToWaitStub.calledThrice, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback when the autoWaiter conditions are met");
		assert.ok(!this.fnCallbackSpy.args[0][0], "Should invoke the callback with no arguments");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
		assert.ok(this.oLoggerSpy.calledTwice, "Should log polling state");
		QUnit.assert.contains(this.oLoggerSpy.args[0][0], "Start polling");
		QUnit.assert.contains(this.oLoggerSpy.args[1][0], "Polling finished");
	});

	QUnit.test("Should timeout if conditions cannot be met in a given timeframe", function (assert) {
		var iTimeoutAttempts = Math.ceil(iPollTimeout * 1000 / iPollInterval);
		this.fnHasToWaitStub.returns(true);

		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(iTimeoutAttempts * iPollInterval);
		assert.strictEqual(this.fnHasToWaitStub.callCount, iTimeoutAttempts, "Should poll for autoWaiter conditions to be met");
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback");
		assert.ok(this.fnCallbackSpy.calledWith("Polling stopped because the timeout of 15 seconds has been reached" +
			" but there is still pending asynchronous work"), "Should invoke the callback with the error message as an argument");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
		assert.ok(this.oLoggerSpy.calledTwice, "Should log polling state");
		QUnit.assert.contains(this.oLoggerSpy.args[0][0], "Start polling");
		QUnit.assert.contains(this.oLoggerSpy.args[1][0], "Polling stopped");
	});

	QUnit.test("Should not fail if no callback was passed", function (assert) {
		this.autoWaiterAsync.waitAsync();

		this.clock.tick(iPollInterval);
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
		assert.ok(this.oLoggerSpy.calledTwice, "Should log polling state");
		QUnit.assert.contains(this.oLoggerSpy.args[1][0], "Polling finished");
	});

	QUnit.test("Should be able to change the polling times", function (assert) {
		this.fnHasToWaitStub.returns(true);
		var oConfig = {interval: 200, timeout: 1};

		this.autoWaiterAsync.extendConfig(oConfig);
		this.autoWaiterAsync.waitAsync(this.fnCallbackSpy);

		this.clock.tick(200);
		assert.ok(this.fnHasToWaitStub.calledTwice, "Should poll for autoWaiter conditions to be met");

		this.clock.tick(1200);
		assert.ok(this.fnCallbackSpy.calledOnce, "Should invoke the callback");
		assert.ok(this.fnCallbackSpy.calledWith("Polling stopped because the timeout of 1 seconds has been reached" +
			" but there is still pending asynchronous work"), "Should invoke the callback with an error message containing the correct timeout value");
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
		assert.ok(fnCallbackSecondSpy.calledWith("waitAsync is already running and cannot be called again at this moment"),
			"Should invoke the callback with an error message on second start");
		assert.ok($.isEmptyObject(this.clock.timers), "Should stop polling when autoWaiter conditions are met");
	});

	QUnit.module("AutoWaiterAsync - autoWait timeout counter", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.fnHasPendingRequestsStub = sinon.stub(sap.ui.test.autowaiter._XHRCounter, "hasPendingRequests");
			// ensure setTimeout is called once in waitAsync
			this.fnHasPendingRequestsStub.returns(false).onCall(1).returns(true);
		},
		afterEach: function () {
			this.clock.restore();
			this.fnHasPendingRequestsStub.restore();
		}
	});

	// the delayed function is wrapped by _timeoutCounter and when it is executed,
	// _timeoutCounter stops tracking the corresponding setTimeout function before executing the original delayed function
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

	QUnit.module("AutoWaiterAsync - config timeout counter");

	QUnit.test("Should be able to change _timeoutCounter config", function (assert) {
		var fnCallbackSpy = sinon.spy();
		var autoWaiterAsync = sap.ui.test.autowaiter._autoWaiterAsync;
		var aHasPendingTimeoutsResults = [];
		var fnHasPendingTimeouts = sap.ui.test.autowaiter._timeoutCounter.hasPendingTimeouts;

		sap.ui.test.autowaiter._timeoutCounter.hasPendingTimeouts = function () {
			var bHasPendingTimeouts = fnHasPendingTimeouts();
			aHasPendingTimeoutsResults.push(bHasPendingTimeouts);
			return bHasPendingTimeouts;
		};

		autoWaiterAsync.extendConfig({timeoutCounter: {maxDelay: 1100}});
		setTimeout(function () {},  1101);
		autoWaiterAsync.waitAsync(fnCallbackSpy);

		assert.ok(!aHasPendingTimeoutsResults[0], "Should ignore long running timeout");
		assert.ok(fnCallbackSpy.calledOnce, "Should invoke the callback when the autoWaiter conditions are met");

		sap.ui.test.autowaiter._timeoutCounter.hasPendingTimeouts = fnHasPendingTimeouts;
	});
});