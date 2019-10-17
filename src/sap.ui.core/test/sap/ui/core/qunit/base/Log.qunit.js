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
			Log.setLogEntriesLimit(Infinity);
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
			assert.ok(window.Array.isArray(Log.getLogEntries()), "Log entries array returned");
			assert.ok(Log.getLogEntries().length >= 1, "at least 1 log entry in array");
		});

		QUnit.test(sName + ": log error", function(assert) {
			console.error.callCount = 0;
			Log.error('error');
			assert.equal(console.error.callCount , 1, "error logged");
		});

		QUnit.test(sName + ": log error (with Error as details)", function(assert) {
			console.error.callCount = 0;
			try {
				throw new Error("Error occured!");
			} catch (ex) {
				Log.error('error', ex);
			}
			assert.equal(console.error.callCount , 1, "error logged");
			assert.equal(console.error.args[0][1], "\n", "New line logged");
			assert.ok(console.error.args[0][2] instanceof Error, "Error object logged");
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
		Log.setLevel(Log.Level.ERROR);
		Log.logSupportInfo(true);
		Log.error("test", null, null, fnSupportInfo);
		assert.equal(console.error.callCount, 1, "error logged!");
		assert.equal(fnSupportInfo.callCount, 1, "supportInfo added!");
		Log.warning("test", fnSupportInfo);
		assert.equal(console.warn.callCount, 0, "warning not logged!");
		assert.equal(fnSupportInfo.callCount, 1, "no additional supportInfo added!");
		Log.setLevel(Log.Level.WARNING);
		Log.warning("test", "details", fnSupportInfo);
		assert.equal(console.warn.callCount, 1, "warning logged!");
		assert.equal(fnSupportInfo.callCount, 2, "supportInfo added!");

		var onLogEntry = sinon.spy();
		var oListener = {onLogEntry: onLogEntry};
		Log.addLogListener(oListener);
		Log.logSupportInfo(false);

		onLogEntry.resetHistory();
		Log.error("message", fnSupportInfo);
		assert.ok(onLogEntry.calledWith(sinon.match({message:"message", details:"", component:""})),
			"when support info is suppressed, fnsupport info must not be logged as 'details'");

		onLogEntry.resetHistory();
		Log.error("message", "details", fnSupportInfo);
		assert.ok(onLogEntry.calledWith(sinon.match({message:"message", details:"details", component:""})),
			"when support info is suppressed, fnsupport info must not be logged as 'component'");

		onLogEntry.resetHistory();
		Log.error("message", "details", "component", fnSupportInfo);
		assert.ok(onLogEntry.calledWith(sinon.match({message:"message", details:"details", component:"component"})),
			"when support info is suppressed, fnsupport info must not be logged");

		Log.removeLogListener(oListener);
	});

	QUnit.test("Log: Listener", function(assert) {
		var fnListener = sinon.spy(),
			fnAttachListener = sinon.spy(),
			fnDiscardLogEntriesListener = sinon.spy(),
			fnDetachListener = sinon.spy(),
			oListener = {
				onLogEntry: fnListener,
				onDiscardLogEntries: fnDiscardLogEntriesListener,
				onAttachToLog: fnAttachListener,
				onDetachFromLog: fnDetachListener
			};

		Log.addLogListener(oListener);
		Log.error("test");
		assert.equal(fnListener.callCount, 1, "onLogEntry: Listener called");
		assert.equal(fnAttachListener.callCount, 1, "attached to log");
		assert.equal(fnDetachListener.callCount, 0, "not yet detached from log");
		Log.warning("test");
		assert.equal(fnListener.callCount, 2, "onLogEntry: Listener called again");

		var iCurrentLogEntries = Log.getLogEntries().length;
		Log.setLogEntriesLimit(iCurrentLogEntries);
		assert.equal(fnDiscardLogEntriesListener.callCount, 1, "onDiscardLogEntries: Listener called");
		var iDiscardedLogEntriesCount = iCurrentLogEntries - Math.floor(iCurrentLogEntries * 0.7);
		assert.equal(fnDiscardLogEntriesListener.getCall(0).args[0].length, iDiscardedLogEntriesCount, "onDiscardLogEntries: Listener called with correct amount of log entries");

		Log.removeLogListener(oListener);
		Log.warning("test");
		assert.equal(console.warn.callCount, 2, "onLogEntry: Listener not called, listener removed");
		assert.equal(fnAttachListener.callCount, 1, "attached to log");
		assert.equal(fnDetachListener.callCount, 1, "detached from log");
	});

	QUnit.test("Stored log entries limit - new limit is higher as before", function(assert) {
		// Check current message count
		var iCurrentLogEntriesCount = Log.getLogEntries().length;
		var oOldestLogEntryBeforeLimit = Log.getLogEntries()[0];

		// Set new limit
		var iNewLogEntriesLimit = iCurrentLogEntriesCount + 10;
		Log.setLogEntriesLimit(iNewLogEntriesLimit);

		// Fill up to the limit
		var iFillUpTo = iNewLogEntriesLimit;
		for (var i = iCurrentLogEntriesCount; i < iFillUpTo; i++) {
			Log.error("test " + i);
		}
		assert.equal(iNewLogEntriesLimit, Log.getLogEntries().length, "limit reached but no entries are discarded yet");

		// Exceed limit
		Log.error("test limit");
		assert.equal(Math.floor(Log.getLogEntriesLimit() * 0.7) + 1, Log.getLogEntries().length, "limit should not be exceeded");

		var sNewestLogMessage = Log.getLogEntries()[Log.getLogEntries().length - 1].message;
		assert.equal(sNewestLogMessage, "test limit", "last message should be stored");

		var oOldestLogEntryAfterLimit = Log.getLogEntries()[0];
		assert.notEqual(oOldestLogEntryBeforeLimit, oOldestLogEntryAfterLimit, "oldest messages should be discarded");
	});

	QUnit.test("Stored log entries limit - new limit is lower as before", function(assert) {
		// Fill up
		for (var i = 1; i <= 6; i++) {
			Log.error("test " + i);
		}

		// Set new limit
		var iNewLogEntriesLimit = 5;
		Log.setLogEntriesLimit(iNewLogEntriesLimit);

		assert.equal(Math.floor(iNewLogEntriesLimit * 0.7), Log.getLogEntries().length, "limit should not be exceeded");

		var sNewestLogMessage = Log.getLogEntries()[Log.getLogEntries().length - 1].message;
		assert.equal(sNewestLogMessage, "test 6", "last message should be stored");
		var sOldestLogMessage = Log.getLogEntries()[0].message;
		assert.equal(sOldestLogMessage, "test 4", "oldest messages should be discarded");
	});

	QUnit.test("Stored log entries limit - limit is 0 (store no log entries)", function(assert) {
		Log.error("test before");
		Log.setLogEntriesLimit(0);
		assert.equal(Log.getLogEntries().length, 0, "stored logs were discarded after changing the limit");
		Log.error("test after");
		assert.equal(Log.getLogEntries().length, 0, "no logs are stored anymore");
	});

	QUnit.test("Stored log entries limit - set and get LogEntriesLimit", function(assert) {
		Log.setLogEntriesLimit(100);
		assert.equal(Log.getLogEntriesLimit(), 100, "Log entries limit should be positive");

		Log.setLogEntriesLimit(0);
		assert.equal(Log.getLogEntriesLimit(), 0, "Log entries limit should be 0");

		assert.throws(function() {
			Log.setLogEntriesLimit(-1);
		}, "Negative log entries limit is not possible.");
	});

	/*eslint-enable no-console*/
});