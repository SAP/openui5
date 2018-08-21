/*global QUnit */
sap.ui.define([
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5',
	'./utils/phantomJS'
], function (opaTest, Opa5, phantomJSUtils) {
	"use strict";

	phantomJSUtils.introduceSinonXHR();

	opaTest("Should have a timeout of 90 seconds", function () {
		Opa5.assert.strictEqual(QUnit.config.testTimeout, 90000, "Increased the timeout to 90 sec");
	});

	opaTest("Should timeout with correct messages in usage reporter", function (oOpa) {
		oOpa.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/opaQUnitTest.html");
		oOpa.waitFor({
			success: function () {
				// suppress error on QUnit timeout: "Cannot read property 'failedAssertions' of null"
				Opa5.getWindow().onerror = function () {
					return false;
				};
			}
		});
		oOpa.waitFor({
			check: function () {
				// wait for the tests to finish
				return Opa5.getJQuery()("#qunit-tests").children(".fail").length === 2;
			},
			success: function () {
				var iFrameReportSpy = Opa5.getWindow().oUsageReportSpy;
				var opaTimeoutMessage = iFrameReportSpy.args[0][0].assertions[1].message;
				var qunitTimeoutMessage = iFrameReportSpy.args[1][0].assertions[1].message;
				// use Opa5.assert - the global one will no longer be defined after the QUnit timeout and will cause error when ran 2 times in the OPA test suite
				Opa5.assert.ok(opaTimeoutMessage.match(/Opa timeout after 1 seconds/), "Should include OPA timeout message");
				Opa5.assert.ok(qunitTimeoutMessage.match(/QUnit timeout after 2 seconds/), "Should include QUnit timeout message");
			}
		});
		oOpa.iTeardownMyApp();
	});

});
