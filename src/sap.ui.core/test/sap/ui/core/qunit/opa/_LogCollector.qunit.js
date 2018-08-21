/*global QUnit */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"jquery.sap.global"
], function (_LogCollector, _OpaLogger, $) {
	"use strict";

	QUnit.module("Singleton");

	QUnit.test("Should be able to get the singleton", function (assert) {
		var oInstance = _LogCollector.getInstance();
		var oSecondInstanceRetrieval = _LogCollector.getInstance();

		assert.strictEqual(oInstance, oSecondInstanceRetrieval, "Log collector is a singleton");
		assert.ok(oInstance instanceof _LogCollector, "Log collector is actually an instance of LogCollector");
	});

	// There are reused in most of the following tests
	var sLogMessage = "Hello";
	var sLogDetails = "World";
	var sComponent = "sap.ui.test";
	var oInstance = _LogCollector.getInstance();
	var sExpectedLog = sLogMessage + " - " + sLogDetails + " " + sComponent;
	var oLogger = _OpaLogger.getLogger(sComponent);

	function assertContainsLog (assert, sMessage) {
		assert.strictEqual(sMessage, sExpectedLog, "The message '" + sMessage + "' contains the expectedLog '" + sExpectedLog + "'");
	}

	QUnit.module("Reading logs");

	QUnit.test("Should get an empty string if there is no log", function (assert) {
		assert.strictEqual(oInstance.getAndClearLog(), "", "Log was empty");
	});

	QUnit.test("Should be able to collect a single log", function (assert) {
		oLogger.debug(sLogMessage, sLogDetails);

		var sLog = oInstance.getAndClearLog();
		assertContainsLog(assert, sLog);
	});

	QUnit.test("Should clear the log when calling getAndClear", function (assert) {
		// add something to the log
		oLogger.debug(sLogMessage, sLogDetails);

		// Now we expect the added log
		var sFirstResult = oInstance.getAndClearLog();
		assertContainsLog(assert, sFirstResult);

		// The actual act now the log has to be empty
		assert.strictEqual(oInstance.getAndClearLog(), "", "Log was empty");
	});

	QUnit.test("Should read multiple logs", function (assert) {
		oLogger.debug(sLogMessage, sLogDetails);
		oLogger.debug(sLogMessage, sLogDetails);

		var aLogs = oInstance.getAndClearLog().split("\n");
		assert.strictEqual(aLogs.length, 2, "Got 2 logs");
		aLogs.forEach(function (sLog) {
			assertContainsLog(assert, sLog);
		});
	});

	QUnit.test("Should only collect logs with the right component", function (assert) {
		var oIgnoredLogger = _OpaLogger.getLogger("someComponent");
		oIgnoredLogger.error(sLogMessage, sLogDetails);
		oIgnoredLogger.debug(sLogMessage, sLogDetails);
		$.sap.log.debug(sLogMessage, sLogDetails);
		$.sap.log.error(sLogMessage, sLogDetails);
		assert.strictEqual(oInstance.getAndClearLog(), "", "Log should be empty");
	});

	QUnit.test("Should guard against memory leaking", function (assert) {
		var i;

		for (i = 0; i <= 1000; i++) {
			oLogger.debug(sLogMessage, sLogDetails);
		}

		var aLogs = oInstance.getAndClearLog().split("\n");
		assert.strictEqual(aLogs.length, 1, "Got 1 logs");
		assert.strictEqual(aLogs[0], "Opa has received 500 logs without a consumer - " +
		"maybe you loaded Opa.js inside of an IFrame? " +
		"The logs are now cleared to prevent memory leaking -  sap.ui.test._LogCollector");
	});

	QUnit.module("destruction");

	QUnit.test("Should not listen to logs after the log listener is destroyed", function (assert) {
		var oLogCollector = new _LogCollector();
		oLogger.debug(sLogMessage, sLogDetails);
		oLogCollector.destroy();
		assert.strictEqual(oLogCollector.getAndClearLog(), "", "Log was empty");
		oLogger.debug(sLogMessage, sLogDetails);
		assert.strictEqual(oLogCollector.getAndClearLog(), "", "Log was empty");
	});

});
