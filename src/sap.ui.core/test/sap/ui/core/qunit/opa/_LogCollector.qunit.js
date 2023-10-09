/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger"
], function (Log, _LogCollector, _OpaLogger) {
	"use strict";

	QUnit.module("_LogCollector - singleton");

	QUnit.test("Should be able to get the singleton per component matcher", function (assert) {
		[undefined, "custom"].forEach(function (sComponent) {
			var oInstance = _LogCollector.getInstance();
			var oSecondInstanceRetrieval = _LogCollector.getInstance();
			assert.strictEqual(oInstance, oSecondInstanceRetrieval, "Log collector is a singleton");
			assert.ok(oInstance instanceof _LogCollector, "Log collector is actually an instance of LogCollector");
		});
	});

	[{component: "sap.ui.test"}, {component: "sap.ui.test.myComponent", match: "myComp"}].forEach(function (mTestData) {
		var sModuleName = mTestData.match ? " custom component matcher" : " default OPA components";
		var sLogMessage = "Hello";
		var sLogDetails = "World";
		var sExpectedLog = sLogMessage + " - " + sLogDetails + " " + mTestData.component;
		var oLogger = _OpaLogger.getLogger(mTestData.component);
		var oInstance = _LogCollector.getInstance(mTestData.match);

		function assertContainsLog (assert, sMessage) {
			assert.strictEqual(sMessage, sExpectedLog, "The message '" + sMessage + "' contains the expectedLog '" + sExpectedLog + "'");
		}

		QUnit.module("_LogCollector - log collection - " + sModuleName, {
			beforeEach: function () {
				oInstance.start();
			},
			afterEach: function () {
				oInstance.destroy();
			}
		});

		QUnit.test("Should get an empty string if there is no log", function (assert) {
			assert.strictEqual(oInstance.getAndClearLog(), "", "Log was empty");
		});

		QUnit.test("Should collect a single log", function (assert) {
			oLogger.debug(sLogMessage, sLogDetails);

			var sLog = oInstance.getAndClearLog();
			assertContainsLog(assert, sLog);
		});

		QUnit.test("Should collect and join multiple logs", function (assert) {
			oLogger.debug(sLogMessage, sLogDetails);
			oLogger.debug(sLogMessage, sLogDetails);

			var aLogs = oInstance.getAndClearLog().split("\n");
			assert.strictEqual(aLogs.length, 2, "Should collect all logs");
			aLogs.forEach(function (sLog) {
				assertContainsLog(assert, sLog);
			});
		});

		QUnit.test("Should clear the log when calling getAndClearLog", function (assert) {
			oLogger.debug(sLogMessage, sLogDetails);

			var sFirstResult = oInstance.getAndClearLog();
			assertContainsLog(assert, sFirstResult);

			assert.strictEqual(oInstance.getAndClearLog(), "", "Should get empty log on second call to getAndClearLog");
		});

		QUnit.test("Should only collect logs with the right component", function (assert) {
			var oIgnoredLogger = _OpaLogger.getLogger("someComponent");
			oIgnoredLogger.error(sLogMessage, sLogDetails);
			oIgnoredLogger.debug(sLogMessage, sLogDetails);
			Log.debug(sLogMessage, sLogDetails);
			Log.error(sLogMessage, sLogDetails);
			assert.strictEqual(oInstance.getAndClearLog(), "", "Log should be empty");
		});

		/**
		 * @deprecated since 1.58
		 */
		QUnit.test("Should only collect logs with the right component (legacy APIs)", function (assert) {
			const done = assert.async();
			sap.ui.require([
				"jquery.sap.global"
			], function($) {
				var oIgnoredLogger = _OpaLogger.getLogger("someComponent");
				oIgnoredLogger.error(sLogMessage, sLogDetails);
				oIgnoredLogger.debug(sLogMessage, sLogDetails);
				$.sap.log.debug(sLogMessage, sLogDetails);
				$.sap.log.error(sLogMessage, sLogDetails);
				assert.strictEqual(oInstance.getAndClearLog(), "", "Log should be empty");
				done();
			}, function(err) {
				assert.notOk(err, "loading jquery.sap.global. failed");
				done();
			});
		});

		QUnit.test("Should guard against memory leaking", function (assert) {
			var i;

			for (i = 0; i <= 1000; i++) {
				oLogger.debug(sLogMessage, sLogDetails);
			}

			var aLogs = oInstance.getAndClearLog().split("\n");
			if (mTestData.match) {
				assert.strictEqual(aLogs.length, 1001, "Should collect all logs");
			} else {
				assert.strictEqual(aLogs.length, 1, "Should collect only the last log");
				assert.strictEqual(aLogs[0], "Opa has received 500 logs without a consumer - " +
				"maybe you loaded Opa.js inside of an IFrame? " +
				"The logs are now cleared to prevent memory leaking -  sap.ui.test._LogCollector");
			}
		});

		QUnit.module("LogCollector - destruction - " + sModuleName);

		QUnit.test("Should not listen to logs before start", function (assert) {
			oLogger.debug(sLogMessage, sLogDetails);
			assert.strictEqual(oInstance.getAndClearLog(), "", "Should not collect logs before start");
		});

		QUnit.test("Should clear collected logs when the log listener is destroyed", function (assert) {
			oInstance.start();
			oLogger.debug(sLogMessage, sLogDetails);
			oInstance.destroy();
			assert.strictEqual(oInstance.getAndClearLog(), "", "Should clear collected logs on destroy");
		});

		QUnit.test("Should not listen to logs after the log listener is destroyed", function (assert) {
			oInstance.start();
			oLogger.debug(sLogMessage, sLogDetails);
			oInstance.destroy();
			assert.strictEqual(oInstance.getAndClearLog(), "", "Should clear collected logs on destroy");
			oLogger.debug(sLogMessage, sLogDetails);
			assert.strictEqual(oInstance.getAndClearLog(), "", "Should not collect logs after destroy");
		});

		QUnit.test("Should not clear collected logs when the log listener is stopped", function (assert) {
			oInstance.start();
			oLogger.debug(sLogMessage, sLogDetails);
			oInstance.stop();
			var sLog = oInstance.getAndClearLog();
			assertContainsLog(assert, sLog);
		});
	});

});
