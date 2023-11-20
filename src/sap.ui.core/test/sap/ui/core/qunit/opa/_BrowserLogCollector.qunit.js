/*global QUnit*/
/*eslint no-console:0*/
sap.ui.define([
	"sap/ui/test/_BrowserLogCollector"
], function (_BrowserLogCollector) {
	"use strict";

	QUnit.module("_BrowserLogCollector - singleton", {
		beforeEach: function () {
			this.oInstance = _BrowserLogCollector.getInstance();
		},
		afterEach: function () {
			this.oInstance.stop();
		}
	});

	QUnit.test("Should get the singleton", function (assert) {
		var oSecondInstanceRetrieval = _BrowserLogCollector.getInstance();

		assert.strictEqual(this.oInstance, oSecondInstanceRetrieval, "Browser log collector should be a singleton");
		assert.ok(this.oInstance instanceof _BrowserLogCollector, "Should be an instance of _BrowserLogCollector");
	});

	QUnit.test("Should collect only selected levels", function (assert) {
		this.oInstance.start();
		console.log("not collected");
		console.error("collected");

		var aLogs = this.oInstance.getAndClearLogs().logs;
		assert.strictEqual(aLogs.length, 1, "Should collect one log");
		assert.strictEqual(aLogs[0].level, "error", "Should collect error log");
		this.oInstance.stop();

		this.oInstance.start("info");
		console.trace("not collected");
		console.error("collected");
		console.log("collected");

		aLogs = this.oInstance.getAndClearLogs().logs;
		assert.strictEqual(aLogs.length, 2, "Should collect two logs");
		assert.strictEqual(aLogs[0].level, "info", "Should collect error log");
		assert.strictEqual(aLogs[1].level, "error", "Should collect basic log");
	});

	QUnit.test("Should collect full message", function (assert) {
		this.oInstance.start("info");
		console.log("one %d two %s", 1, "three");
		console.log("one", "two");
		console.log("one");

		var aLogs = this.oInstance.getAndClearLogs().logs;
		assert.strictEqual(aLogs[0].message, "one", "Should collect single string");
		assert.strictEqual(aLogs[1].message, "one two", "Should collect multiple strings");
		assert.strictEqual(aLogs[2].message, "one 1 two three", "Should collect string with substitutions");
	});

	QUnit.test("Should get and clear logs", function (assert) {
		this.oInstance.start("info");
		console.log("one");

		var aLogs = this.oInstance.getAndClearLogs().logs;
		assert.strictEqual(aLogs.length, 1, "Should get all logs");
		var aLogsSecondGet = this.oInstance.getAndClearLogs();
		assert.ok(!aLogsSecondGet.length, "Should get empty array the second time");
	});

	QUnit.test("Should stop and clear logs", function (assert) {
		this.oInstance.start();
		console.log("one");
		this.oInstance.stop();

		var aLogs = this.oInstance.getAndClearLogs().logs;
		assert.ok(!aLogs.length, "Should clear logs");
	});

	QUnit.test("Should have configurable log limit", function (assert) {
		this.oInstance.start("info", 2);
		console.log("deleted");
		console.log("second");
		console.log("first");

		var aLogs = this.oInstance.getAndClearLogs().logs;
		assert.strictEqual(aLogs.length, 2, "Should have a selected log limit");
		assert.strictEqual(aLogs[0].message, "first", "Should resemble a queue");
		assert.strictEqual(aLogs[1].message, "second");
	});

	QUnit.test("Should call stop before second start", function (assert) {
		this.oInstance.start();
		assert.throws(function () {
			this.oInstance.start();
		}.bind(this), /'start' has already been called/);
	});

	QUnit.test("Should check if log level is known", function (assert) {
		assert.throws(function () {
			this.oInstance.start("x");
		}.bind(this), /log level 'x' is not known/);
	});
});
