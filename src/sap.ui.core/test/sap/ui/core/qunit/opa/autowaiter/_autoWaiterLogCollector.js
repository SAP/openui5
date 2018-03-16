sap.ui.define([
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_autoWaiterLogCollector"
], function (_OpaLogger, _autoWaiterLogCollector) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._testComponent#hasPending");

	QUnit.module("AutoWaiterLogCollector");

	QUnit.test("Should listen to log entries", function (assert) {
		oLogger.debug("someLog");
		assert.ok(!_autoWaiterLogCollector.getAndClearLog(), "Should not collect logs before start");
		_autoWaiterLogCollector.start();
		oLogger.debug("someLog");
		assert.strictEqual(_autoWaiterLogCollector.getAndClearLog(), "someLog", "Should collect log entries on start");
		_autoWaiterLogCollector.stop();
	});

	QUnit.test("Should collect only filtered logs", function (assert) {
		var oOtherPrefixLogger = _OpaLogger.getLogger("someComponent");
		var oOtherSuffixLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._testComponent#someSuffix");
		_autoWaiterLogCollector.start();
		oLogger.debug("autoWaiterValidatorHasPendingLog");
		oLogger.debug("autoWaiterValidatorHasPendingLog2");
		oOtherPrefixLogger.debug("someLog2");
		oOtherSuffixLogger.debug("someLog3");
		assert.strictEqual(_autoWaiterLogCollector.getAndClearLog(), "autoWaiterValidatorHasPendingLog\nautoWaiterValidatorHasPendingLog2",
			"Should collect specific log entries");
		_autoWaiterLogCollector.stop();
	});

	QUnit.test("Should clear log", function (assert) {
		_autoWaiterLogCollector.start();
		oLogger.debug("autoWaiterValidatorHasPendingLog");
		assert.strictEqual(_autoWaiterLogCollector.getAndClearLog(), "autoWaiterValidatorHasPendingLog");
		assert.ok(!_autoWaiterLogCollector.getAndClearLog(), "Should clear collected logs");
		_autoWaiterLogCollector.stop();
	});

	QUnit.test("Should stop listening to log entries", function (assert) {
		_autoWaiterLogCollector.start();
		oLogger.debug("autoWaiterValidatorHasPendingLog");
		assert.strictEqual(_autoWaiterLogCollector.getAndClearLog(), "autoWaiterValidatorHasPendingLog");
		_autoWaiterLogCollector.stop();
		oLogger.debug("autoWaiterValidatorHasPendingLog");
		assert.ok(!_autoWaiterLogCollector.getAndClearLog(), "Should stop collecting logs");
	});
});
