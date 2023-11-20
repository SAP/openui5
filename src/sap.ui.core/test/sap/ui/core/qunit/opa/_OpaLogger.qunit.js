/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_OpaLogger",
	"sap/base/Log"
], function (_OpaLogger, Log) {
	"use strict";

	QUnit.module("OpaLogger", {
		beforeEach: function () {
			this.fnGetLoggerSpy = sinon.spy(Log, "getLogger");
			this.fnSetLevelSpy = sinon.spy(Log, "setLevel");
		},
		afterEach: function () {
			this.fnGetLoggerSpy.restore();
			this.fnSetLevelSpy.restore();
		}
	});

	QUnit.test("Should get logger for component", function (assert) {
		var oOpaLogger = _OpaLogger.getLogger("testComponent");
		assert.ok(this.fnGetLoggerSpy.calledOnce, "Should call original getLogger");
		sinon.assert.calledWith(this.fnGetLoggerSpy, "testComponent", Log.Level.DEBUG);
		assert.strictEqual(oOpaLogger.getLevel(), Log.Level.DEBUG);
	});

	QUnit.test("Should set correct level", function (assert) {
		_OpaLogger.setLevel("trace");
		var oOpaLogger = _OpaLogger.getLogger("testComponent");
		assert.ok(this.fnGetLoggerSpy.calledOnce, "Should call original getLogger");
		sinon.assert.calledWith(this.fnGetLoggerSpy, "testComponent", Log.Level.TRACE);
		assert.strictEqual(oOpaLogger.getLevel(), Log.Level.TRACE);
		_OpaLogger.setLevel("debug");
	});

	QUnit.test("Should change level of existing loggers", function (assert) {
		var oOpaLoggers = [_OpaLogger.getLogger("testComponent1"), _OpaLogger.getLogger("testComponent2")];
		_OpaLogger.setLevel("info");
		sinon.assert.calledWith(this.fnSetLevelSpy, Log.Level.INFO, "testComponent1");
		sinon.assert.calledWith(this.fnSetLevelSpy, Log.Level.INFO, "testComponent2");
		assert.strictEqual(oOpaLoggers[0].getLevel(), Log.Level.INFO);
		assert.strictEqual(oOpaLoggers[0].getLevel(), Log.Level.INFO);
		_OpaLogger.setLevel("debug");
	});

});
