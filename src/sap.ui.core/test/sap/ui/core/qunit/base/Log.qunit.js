/*!
 * ${copyright}
 */
/*global console, sinon, QUnit */
sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";
	/*eslint-disable no-console*/

	function tests(sName, oLogger, sMsgPrefix) {
		/* as there could be other calls to console.xxx we need to reset the counter in each test */

		QUnit.module(sName, {
			beforeEach: function() {
				Log.setLogEntriesLimit(Infinity);
				oLogger.setLevel(5);
				this.spy(console, "error");
				this.spy(console, "warn");
				this.spy(console, "info");
				this.spy(console, "debug");
				this.spy(console, "trace");
			}
		});

		Object.entries({
			"fatal" : "error",
			"error" : "error",
			"warning" : "warn",
			"info" : "info",
			"debug" : "debug",
			"trace" : "trace"
		}).forEach(function(aLevels) {

			var sLevel = aLevels[0];
			var sConsoleLevel = aLevels[1];

			QUnit.test(sMsgPrefix + "." + sLevel + "(...)", function(assert) {
				console[sConsoleLevel].resetHistory();
				oLogger[sLevel]("some message text");
				assert.equal(console[sConsoleLevel].callCount , 1, "message should be logged on console with level '" + sConsoleLevel + "'");
			});

			QUnit.test(sMsgPrefix + "." + sLevel + "(..., oError, ...) - with Error as details)", function(assert) {
				console[sConsoleLevel].resetHistory();
				var sDetailsMessage = "some Error message";
				try {
					throw new Error(sDetailsMessage);
				} catch (err) {
					oLogger[sLevel]("some message text", err);
				}
				assert.equal(console[sConsoleLevel].callCount , 1, "message should be logged on console with level '" + sConsoleLevel + "'");
				assert.ok(console[sConsoleLevel].args[0][0].indexOf(sDetailsMessage) >= 0, "message from Error object should be part of console message");
				assert.equal(console[sConsoleLevel].args[0][1], "\n", "New line logged");
				assert.ok(console[sConsoleLevel].args[0][2] instanceof Error, "Error object should have been logged");
				assert.equal(console[sConsoleLevel].args[0][2].message, sDetailsMessage, "Error object should have the expected message");
			});
		});

		QUnit.test("setLevel", function(assert) {
			console.error.resetHistory();
			console.warn.resetHistory();
			oLogger.setLevel(1);
			oLogger.error("test");
			assert.equal(console.error.callCount, 1, "error logged!");
			oLogger.warning("test");
			assert.equal(console.warn.callCount, 0, "warning not logged!");
			oLogger.setLevel(2);
			oLogger.warning("test");
			assert.equal(console.warn.callCount, 1, "warning logged!");
		});

		QUnit.test("setLevel multiple components", function(assert) {
			console.warn.resetHistory();
			console.error.resetHistory();
			oLogger.setLevel(1);
			oLogger.setLevel(2, "comp");
			oLogger.error("test");
			assert.equal(console.error.callCount, 1, "error logged!");
			oLogger.error("test", "details", "comp");
			assert.equal(console.error.callCount, 2, "error for comp logged!");
			oLogger.warning("test");
			assert.equal(console.warn.callCount, 0, "warning not logged!");
			oLogger.warning("test", "details", "comp");
			assert.equal(console.warn.callCount, 1, "warning for comp logged!");
			oLogger.setLevel(2);
			oLogger.warning("test");
			assert.equal(console.warn.callCount, 2, "warning logged!");
		});

		QUnit.test("getLevel", function(assert) {
			assert.equal(oLogger.getLevel(), 5, "Log level is set to 5");
			oLogger.setLevel(2);
			assert.equal(oLogger.getLevel(), 2, "Log level is set to 2");
		});

		QUnit.test("isLoggable", function(assert) {
			assert.ok(oLogger.isLoggable(4), "Level 4 loggable - Log level is 5");
			oLogger.setLevel(2);
			assert.notOk(oLogger.isLoggable(4), "Level 4 not loggable - Log level is 2");
			oLogger.setLevel(6);
			assert.ok(oLogger.isLoggable(), "Default(Debug) Level loggable");
		});

	}

	tests("Static Methods", Log, "Log");

	tests("Logger Instance", Log.getLogger("some.component"), "oLogger");

	QUnit.module("Others", {
		beforeEach: function() {
			this.spy(console, "error");
			this.spy(console, "warn");
			this.spy(console, "info");
			this.spy(console, "debug");
			this.spy(console, "trace");
			Log.setLevel(5);
			Log.setLogEntriesLimit(Infinity);
		}
	});

	QUnit.test("getLogger: component suffix", function(assert) {
		var oLogger = Log.getLogger("component");
		assert.ok(oLogger, "Logger created");
		oLogger.debug("debug logged");
		assert.ok(console.debug.lastCall.args[0].endsWith("-  component"), "component prefix logged");
	});

	QUnit.test("Log: logSupportInfo", function(assert) {
		var fnSupportInfo = this.spy(function() {return "support Info";});
		console.error.resetHistory();
		console.warn.resetHistory();
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

		var onLogEntry = this.spy();
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
		var fnListener = this.spy(),
			fnAttachListener = this.spy(),
			fnDiscardLogEntriesListener = this.spy(),
			fnDetachListener = this.spy(),
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