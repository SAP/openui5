/* global QUnit */

sap.ui.define(["jquery.sap.global"], function(jQuery) {
	"use strict";

	var iListenedMessages;
	var oLastEntry;
	QUnit.module("Test", {
		beforeEach : function() {
			iListenedMessages = 0;
			oLastEntry = null;
		}
	});

	QUnit.test("GetLog", function (assert) {
		var aLog = jQuery.sap.log.getLogEntries();
		assert.notStrictEqual(aLog, null, "jQuery.sap.log.getLogEntries() may not be null");
	});

	QUnit.test("Configuration", function(assert) {
		assert.strictEqual(jQuery.sap.log.getLevel(), jQuery.sap.log.Level.WARNING, "configuration is evaluated");
	});

	QUnit.test("Debug", function (assert) {
		// set log level and count messages
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
		var aLog1 = jQuery.sap.log.getLogEntries();
		var iLogCount1 = aLog1.length;

		// log one message
		var myLogMessage = "This is a debug message";
		var myDetails = "These are the details";
		var myComponent = "jquery.sap.logger.jsunit";
		jQuery.sap.log.debug(myLogMessage, myDetails, myComponent);
		var aLog2 = jQuery.sap.log.getLogEntries();
		var iLogCount2 = aLog2.length;
		var oMyLogEntry = aLog2[aLog2.length - 1];

		// compare results
		assert.strictEqual(iLogCount2, iLogCount1 + 1, "number of log entries should have been inceased by one");
		assert.strictEqual(oMyLogEntry.message, myLogMessage, "log message is wrong");
		assert.strictEqual(oMyLogEntry.details, myDetails, "log details are wrong");
		assert.strictEqual(oMyLogEntry.component, myComponent, "log component is wrong");
		assert.strictEqual(oMyLogEntry.level, jQuery.sap.log.Level.DEBUG, "log level is wrong");
	});

	QUnit.test("ChangeLogLevel", function (assert) {
		assert.expect(2);
		var iLevel = jQuery.sap.log.getLevel();

		// set log level and count messages
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
		var aLog1 = jQuery.sap.log.getLogEntries();
		var iLogCount1 = aLog1.length;

		// change log level
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.ALL);
		var aLog2 = jQuery.sap.log.getLogEntries();
		var iLogCount2 = aLog2.length;
		var oMyLogEntry = aLog2[aLog2.length - 1];

		// check results
		assert.equal(iLogCount1 + 1, iLogCount2, "number of log entries should have increased by one");
		assert.equal(oMyLogEntry.message, "Changing log level to ALL",  "log message is wrong");

		// reset
		jQuery.sap.log.setLevel(iLevel);
	});

	QUnit.test("ChangeLogLevelEffects", function (assert) {
		// set log level and count messages
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
		var aLog1 = jQuery.sap.log.getLogEntries();
		var iLogCount1 = aLog1.length;

		// log two messages
		var myLogMessageDebug = "This is a debug message";
		var myLogMessageWarning = "This is a warning message";
		jQuery.sap.log.debug(myLogMessageDebug);
		jQuery.sap.log.debug(myLogMessageWarning);
		var aLog2 = jQuery.sap.log.getLogEntries();
		var iLogCount2 = aLog2.length;
		var oMyLogEntryDebug = aLog2[aLog2.length - 2];
		var oMyLogEntryWarning = aLog2[aLog2.length - 1];

		// compare results
		assert.strictEqual(iLogCount2, iLogCount1 + 2, "number of log entries should have inceased by two");
		assert.strictEqual(oMyLogEntryDebug.message, myLogMessageDebug, "log message is wrong");
		assert.strictEqual(oMyLogEntryWarning.message, myLogMessageWarning, "log message is wrong");

		// change log level
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.WARNING);
		jQuery.sap.log.debug(myLogMessageDebug);
		jQuery.sap.log.warning(myLogMessageWarning);
		var aLog3 = jQuery.sap.log.getLogEntries();
		var iLogCount3 = aLog3.length;
		var oMyLogEntryWarningOld = aLog3[aLog3.length - 2]; // -2 is the level switching message
		var oMyLogEntryWarningNew = aLog3[aLog3.length - 1];

		// compare results
		assert.strictEqual(iLogCount3, iLogCount2 + 1, "number of log entries should have inceased by one"); // warning message + level switching message
		assert.strictEqual(oMyLogEntryWarningOld.message, myLogMessageWarning, "log message is wrong");
		assert.strictEqual(oMyLogEntryWarningNew.message, myLogMessageWarning, "log message is wrong");
	});

	var oLogListener = {};
	oLogListener.onLogEntry = function(oLogEntry) {
		iListenedMessages++;
		oLastEntry = oLogEntry;
	};

	QUnit.test("LogListener", function (assert) {
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
		assert.strictEqual(iListenedMessages, 0, "listened messages should initially be empty");
		assert.strictEqual(oLastEntry, null, "listened messages should initially be empty");

		jQuery.sap.log.addLogListener(oLogListener);
		assert.strictEqual(iListenedMessages, 0, "listened messages should initially be empty");
		assert.strictEqual(oLastEntry, null, "listened messages should initially be empty");

		var myLogMessageDebug = "This is a debug message";
		jQuery.sap.log.debug(myLogMessageDebug);
		assert.strictEqual(iListenedMessages, 1, "listened messages should be 1");
		assert.notStrictEqual(oLastEntry, null, "listened message should there");
		assert.strictEqual(oLastEntry.message, myLogMessageDebug, "listened message should have the correct text");

		jQuery.sap.log.removeLogListener(oLogListener);

		jQuery.sap.log.debug(myLogMessageDebug);
		assert.strictEqual(iListenedMessages, 1, "listened messages should still be 1");
	});

	QUnit.test("MethodChaining", function (assert){
		var log = jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
		assert.strictEqual(log, jQuery.sap.log, "The log instance should always be returned");
		log = log.error("Error message");
		assert.strictEqual(log, jQuery.sap.log, "The log instance should always be returned");
		log = log.warning("Warning message");
		assert.strictEqual(log, jQuery.sap.log, "The log instance should always be returned");
		log = log.info("Info message");
		assert.strictEqual(log, jQuery.sap.log, "The log instance should always be returned");
		log = log.debug("Debug message");
		assert.strictEqual(log, jQuery.sap.log, "The log instance should always be returned");
		log = log.trace("Trace message");
		assert.strictEqual(log, jQuery.sap.log, "The log instance should always be returned");
	});

	QUnit.module("ComponentLoggers");

	QUnit.test("Basic Methods", function (assert) {
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.ALL);
		var mylog = jQuery.sap.log.getLogger("mylog");
		jQuery.each(["fatal", "error", "warning", "info", "debug", "trace"], function(i,v) {
			var aLogBefore = jQuery.sap.log.getLogEntries().slice();
			mylog[v](v + " message");
			var aLogAfter = jQuery.sap.log.getLogEntries().slice();
			assert.strictEqual(aLogAfter.length, aLogBefore.length + 1, "number of log entries should have increased by one");
			assert.strictEqual(aLogAfter[aLogAfter.length - 1].message, v + " message", "check message of last log entry");
			assert.strictEqual(aLogAfter[aLogAfter.length - 1].component, "mylog", "check component of last log entry");
		});
	});

	QUnit.test("Individual Log Levels", function (assert) {
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.ALL);
		jQuery.sap.log.setLevel(jQuery.sap.log.Level.WARNING, "mylog");
		var mylog = jQuery.sap.log.getLogger("mylog");
		var aLogBefore = jQuery.sap.log.getLogEntries().slice();
		jQuery.each(["fatal", "error", "warning", "info", "debug", "trace"], function(i,v) {
			jQuery.sap.log[v](v + " message1");
			jQuery.sap.log[v](v + " message2", null, "mylog");
			mylog[v](v + " message3");
		});
		var aLogAfter = jQuery.sap.log.getLogEntries().slice();
		assert.strictEqual(aLogAfter.length - aLogBefore.length, 12, "check number of newly created log entries");
		assert.strictEqual(aLogAfter[aLogAfter.length - 1].message, "trace message1", "check message of last log entry");
		assert.strictEqual(aLogAfter[aLogAfter.length - 4].message, "warning message3", "check message of log entry");
		assert.strictEqual(aLogAfter[aLogAfter.length - 5].message, "warning message2", "check message of log entry");
		assert.strictEqual(aLogAfter[aLogAfter.length - 6].message, "warning message1", "check message of log entry");
		assert.strictEqual(aLogAfter[aLogAfter.length - 7].message, "error message3", "check message of log entry");
		assert.strictEqual(aLogAfter[aLogAfter.length - 8].message, "error message2", "check message of log entry");
		assert.strictEqual(aLogAfter[aLogAfter.length - 9].message, "error message1", "check message of log entry");

	});

	QUnit.test("Method Chaining", function (assert){
		var mylog0, mylog;
		mylog = mylog0 = jQuery.sap.log.getLogger("mylog");
		mylog = mylog.error("Error message");
		assert.strictEqual(mylog, mylog0, "The log instance should always be returned");
		mylog = mylog.warning("Warning message");
		assert.strictEqual(mylog, mylog0, "The log instance should always be returned");
		mylog = mylog.info("Info message");
		assert.strictEqual(mylog, mylog0, "The log instance should always be returned");
		mylog = mylog.debug("Debug message");
		assert.strictEqual(mylog, mylog0, "The log instance should always be returned");
		mylog = mylog.trace("Trace message");
		assert.strictEqual(mylog, mylog0, "The log instance should always be returned");
	});
});