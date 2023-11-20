/*global QUnit */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_moduleWaiter",
	"sap/ui/test/autowaiter/_XHRWaiter"
], function (_LogCollector, _OpaLogger, _moduleWaiter, _XHRWaiter) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("ModuleWaiter", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
		}
	});

	QUnit.test("Should wait for pending module - async", function (assert) {
		var fnDone = assert.async();
		sap.ui.require(["fixture/pendingModuleAsync"], function () {
			assert.ok(!_moduleWaiter.hasPending());
			delete window.fixture; // cleanup
			fnDone();
		}, function (oError) {
			assert.ok(false, oError);
			fnDone();
		});
		assert.ok(_moduleWaiter.hasPending());
		assert.ok(oLogCollector.getAndClearLog().match("fixture/pendingModule"));
	});

	/**
	 * @deprecated together with sync module loading
	 */
	QUnit.test("Should wait for pending sync module - xhrWaiter", function (assert) {
		sap.ui.requireSync(["fixture/pendingModuleSync"]);
		assert.ok(!_moduleWaiter.hasPending());
		assert.ok(!_XHRWaiter.hasPending());
		assert.ok(oLogCollector.getAndClearLog().match(/Finished:\nXHR: URL:.*fixture\/pendingModuleSync/mg));
		delete window.fixture; // cleanup
	});

	function testPendingScript(async, defer, assert, fnDone) {
		var oScript = document.createElement("script");
		oScript["s" + "rc"] = "test-resources/sap/ui/core/qunit/opa/fixture/pendingScript.js";
		oScript.async = async;
		oScript.defer = defer;
		oScript.addEventListener('load', function () {
			assert.ok(!_moduleWaiter.hasPending());
			fnDone();
		});
		document.head.appendChild(oScript);
		assert.ok(_moduleWaiter.hasPending());
		assert.ok(oLogCollector.getAndClearLog().match("fixture/pendingScript"));
	}

	QUnit.test("Should wait for sync script", function (assert) {
		testPendingScript(false, false, assert, assert.async());
	});

	QUnit.test("Should wait for sync deferred script", function (assert) {
		testPendingScript(false, true, assert, assert.async());
	});

	QUnit.test("Should wait for async script", function (assert) {
		testPendingScript(true, false, assert, assert.async());
	});

	QUnit.test("Should wait for async deferred script", function (assert) {
		testPendingScript(true, true, assert, assert.async());
	});
});
