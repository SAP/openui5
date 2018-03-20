/*!
 * ${copyright}
 */
/*global console, sinon, QUnit */
sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";
	/*eslint-disable no-console*/

	QUnit.module("sap.base.Log", {
		beforeEach: function() {
			sinon.spy(console, "error");
			sinon.spy(console, "warn");
			sinon.spy(console, "info");
			sinon.spy(console, "debug");
			sinon.spy(console, "trace");
			Log.setLevel(5);
		},
		afterEach: function() {
			console.error.restore();
			console.warn.restore();
			console.info.restore();
			console.debug.restore();
			console.trace.restore();
		}
	});

	function tests(sName, oLogger) {
		/* as there could be other calls to console.xxx we need to reset the counter in each test */

		QUnit.test(sName + ": getLogEntries", function(assert) {
			Log.error("error");
			assert.ok(window.Array.isArray(Log.getLog()), "Log entries array returned");
			assert.ok(Log.getLog().length >= 1, "at least 1 log entry in array");
		});

		QUnit.test(sName + ": log error", function(assert) {
			console.error.callCount = 0;
			Log.error('error');
			assert.equal(console.error.callCount , 1, "error logged");
		});

		QUnit.test(sName + ": log warning", function(assert) {
			console.warn.callCount = 0;
			Log.warning('warning');
			assert.equal(console.warn.callCount, 1, "warning logged!");
		});

		QUnit.test(sName + ": log information", function(assert) {
			console.info.callCount = 0;
			Log.info('info');
			assert.equal(console.info.callCount, 1, "info logged!");
		});

		QUnit.test(sName + ": log debug", function(assert) {
			console.debug.callCount = 0;
			Log.debug('debug');
			assert.equal(console.debug.callCount, 1, "debug logged!");
		});

		QUnit.test(sName + ": log trace", function(assert) {
			console.trace.callCount = 0;
			Log.trace('trace');
			assert.equal(console.trace.callCount, 1, "trace logged!");
		});

		QUnit.test(sName + ": log fatal", function(assert) {
			console.error.callCount = 0;
			Log.fatal('fatal');
			assert.equal(console.error.callCount, 1, "fatal logged!");
		});

		QUnit.test(sName + ": setLevel", function(assert) {
			console.error.callCount = 0;
			console.warn.callCount = 0;
			Log.setLevel(1);
			Log.error("test");
			assert.equal(console.error.callCount, 1, "error logged!");
			Log.warning("test");
			assert.equal(console.warn.callCount, 0, "warning not logged!");
			Log.setLevel(2);
			Log.warning("test");
			assert.equal(console.warn.callCount, 1, "warning logged!");
		});

		QUnit.test(sName + ": setLevel multiple components", function(assert) {
			console.warn.callCount = 0;
			console.error.callCount = 0;
			Log.setLevel(1);
			Log.setLevel(2, "comp");
			Log.error("test");
			assert.equal(console.error.callCount, 1, "error logged!");
			Log.error("test", "details", "comp");
			assert.equal(console.error.callCount, 2, "error for comp logged!");
			Log.warning("test");
			assert.equal(console.warn.callCount, 0, "warning not logged!");
			Log.warning("test", "details", "comp");
			assert.equal(console.warn.callCount, 1, "warning for comp logged!");
			Log.setLevel(2);
			Log.warning("test");
			assert.equal(console.warn.callCount, 2, "warning logged!");
		});

		QUnit.test(sName + ": getLevel", function(assert) {
			assert.equal(Log.getLevel(), 5, "Log level is set to 5");
			Log.setLevel(2);
			assert.equal(Log.getLevel(), 2, "Log level is set to 2");
		});

		QUnit.test(sName + ": isLoggable", function(assert) {
			assert.ok(Log.isLoggable(4), "Level 4 loggable - Log level is 5");
			Log.setLevel(2);
			assert.notOk(Log.isLoggable(4), "Level 4 not loggable - Log level is 2");
			Log.setLevel(6);
			assert.ok(Log.isLoggable(), "Default(Debug) Level loggable");
		});

	}

	tests("Log", Log);

	tests("getLogger", Log.getLogger());

	QUnit.test("getLogger: component suffix", function(assert) {
		var oLogger = Log.getLogger("component");
		assert.ok(oLogger, "Logger created");
		oLogger.debug("debug logged");
		assert.ok(console.debug.lastCall.args[0].endsWith("-  component"), "component prefix logged");
	});

	QUnit.test("Log: logSupportInfo", function(assert) {
		var fnSupportInfo = sinon.spy(function() {return "support Info";});
		console.error.callCount = 0;
		console.warn.callCount = 0;
		Log.setLevel(1);
		Log.logSupportInfo(true);
		Log.error("test", null, null, fnSupportInfo);
		assert.equal(console.error.callCount, 1, "error logged!");
		assert.equal(fnSupportInfo.callCount, 1, "supportInfo added!");
		Log.warning("test", fnSupportInfo);
		assert.equal(console.warn.callCount, 0, "warning not logged!");
		assert.equal(fnSupportInfo.callCount, 1, "no additional supportInfo added!");
		Log.setLevel(2);
		Log.warning("test", "details", fnSupportInfo);
		assert.equal(console.warn.callCount, 1, "warning logged!");
		assert.equal(fnSupportInfo.callCount, 2, "supportInfo added!");
	});

	QUnit.test("Log: Listener", function(assert) {
		var fnListener = sinon.spy(),
			fnAttachListener = sinon.spy(),
			fnDetachListener = sinon.spy(),
			oListener = {
				onLogEntry: fnListener,
				onAttachToLog: fnAttachListener,
				onDetachFromLog: fnDetachListener
			};

		Log.addLogListener(oListener);
		Log.error("test");
		assert.equal(fnListener.callCount, 1, "listener called");
		assert.equal(fnAttachListener.callCount, 1, "attached to log");
		assert.equal(fnDetachListener.callCount, 0, "not yet detached from log");
		Log.warning("test");
		assert.equal(fnListener.callCount, 2, "listener called again");
		Log.removeLogListener(oListener);
		Log.warning("test");
		assert.equal(console.warn.callCount, 2, "listener not called: listener removed");
		assert.equal(fnAttachListener.callCount, 1, "attached to log");
		assert.equal(fnDetachListener.callCount, 1, "detached from log");
	});

	/*eslint-enable no-console*/
});