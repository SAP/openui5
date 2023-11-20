/*global QUnit */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_fetchWaiter"
], function (_LogCollector, _OpaLogger, _fetchWaiter) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("FetchWaiter", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
		}
	});

	QUnit.test("Should wait for fetch request for not found resource", function (assert) {
		var fnDone = assert.async();
		assert.expect(3);

		window.fetch("testresource.jpg")
			.then(function () {
				setTimeout(function () {
					assert.strictEqual(_fetchWaiter.hasPending(), false, "There are no pending fetch requests");
					fnDone();
				}, 0);
			});
		assert.strictEqual(_fetchWaiter.hasPending(), true, "There are pending fetch requests");
		assert.ok(oLogCollector.getAndClearLog().match("testresource.jpg"), "Log for pending request");
	});

	QUnit.test("Should wait for fetch request for existing resource", function (assert) {
		var fnDone = assert.async();
		assert.expect(3);

		window.fetch(sap.ui.require.toUrl("test-resources/sap/ui/documentation/sdk/products.json"))
			.then(function () {
				setTimeout(function () {
					assert.strictEqual(_fetchWaiter.hasPending(), false, "There are no pending fetch requests");
					fnDone();
				}, 0);
			});
		assert.strictEqual(_fetchWaiter.hasPending(), true, "There are pending fetch requests");
		assert.ok(oLogCollector.getAndClearLog().match("products.json"), "Log for pending request");
	});

	QUnit.test("Should wait for fetch request throwing error", function (assert) {
		var fnDone = assert.async();
		assert.expect(3);

		// CORS issue will throw error
		window.fetch("https://www.sap.com/index.html")
			.catch(function () {
				setTimeout(function () {
					assert.strictEqual(_fetchWaiter.hasPending(), false, "There are no pending fetch requests");
					fnDone();
				}, 0);
			});
		assert.strictEqual(_fetchWaiter.hasPending(), true, "There are pending fetch requests");
		assert.ok(oLogCollector.getAndClearLog().match("index.html"), "Log for pending request");
	});

	QUnit.test("Should wait for fetch request for existing resource with Request object", function (assert) {
		var fnDone = assert.async();
		assert.expect(3);

		window.fetch(new Request(sap.ui.require.toUrl("test-resources/sap/ui/documentation/sdk/products.json")))
			.then(function () {
				setTimeout(function () {
					assert.strictEqual(_fetchWaiter.hasPending(), false, "There are no pending fetch requests");
					fnDone();
				}, 0);
			});
		assert.strictEqual(_fetchWaiter.hasPending(), true, "There are pending fetch requests");
		assert.ok(oLogCollector.getAndClearLog().match("products.json"), "Log for pending request");
	});
});