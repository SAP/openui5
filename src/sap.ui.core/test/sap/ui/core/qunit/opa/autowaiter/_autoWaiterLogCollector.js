sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/autowaiter/_autoWaiterLogCollector"
], function ($, _autoWaiterLogCollector) {
	"use strict";

	var oLogger = $.sap.log.getLogger("sap.ui.test.autowaiter._testComponent#hasPending", $.sap.log.Level.DEBUG);

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
		var oOtherPrefixLogger = $.sap.log.getLogger("someComponent", $.sap.log.Level.DEBUG);
		var oOtherSuffixLogger = $.sap.log.getLogger("sap.ui.test.autowaiter._testComponent#someSuffix", $.sap.log.Level.DEBUG);
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
