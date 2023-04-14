/*global QUnit */
sap.ui.define([
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5'
], function (opaTest, Opa5) {
	"use strict";

	function suppressFailedAssertions() {
		// suppress error on QUnit timeout: "Cannot read property 'failedAssertions' of null"
		Opa5.getWindow().onerror = function () {
			return false;
		};
	}

	QUnit.module("OPA Qunit - Configuration");
	opaTest("Should have a timeout of 90 seconds", function () {
		Opa5.assert.strictEqual(QUnit.config.testTimeout, 90000, "Increased the timeout to 90 sec");
	});

	QUnit.module("OPA Qunit - Reporter");

	opaTest("Should timeout with correct messages in usage reporter", function (oOpa) {
		for (var iQUnitVersion = 1; iQUnitVersion <= 2; iQUnitVersion++) {
			oOpa.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/opaReportTest-qunit" + iQUnitVersion + ".html");
			oOpa.waitFor({
				success: suppressFailedAssertions
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
		}
	});

	// tests below rely on order of execution of opaQUnitTest.html tests!

	QUnit.module("OPA Qunit - function adapters");

	opaTest("Should skip tests with opaSkip", function (oOpa) {
		for (var iQUnitVersion = 1; iQUnitVersion <= 2; iQUnitVersion++) {
			oOpa.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/opaQUnitTest-qunit" + iQUnitVersion + ".html");
			oOpa.waitFor({
				success: suppressFailedAssertions
			});
			oOpa.waitFor({
				/*eslint no-loop-func: 0 */
				check: function () {
					return Opa5.getJQuery()("#qunit-tests").children().length;
				},
				success: function () {
					var oFirstTestResult = Opa5.getJQuery()("#qunit-tests").children().first();
					Opa5.assert.ok(oFirstTestResult.hasClass("skipped"), "First test should be skipped");
				}
			});
			oOpa.iTeardownMyApp();
		}
	});

	opaTest("Should properly evaluate state of todo tests with opaTodo", function (oOpa) {
		// Note: "todo" tests are only supported in QUnit 2 and higher
		oOpa.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/opaQUnitTest-qunit2.html");
		oOpa.waitFor({
			success: suppressFailedAssertions
		});
		oOpa.waitFor({
			check: function () {
				return Opa5.getJQuery()("#qunit-testresult").text().match(/tests completed/i);
			},
			success: function () {
				var oTestResults = Opa5.getJQuery()("#qunit-tests").children();
				var oFailedAssertion = oTestResults.eq(1);
				Opa5.assert.ok(oFailedAssertion.hasClass("pass todo"), "TODO(1) should pass");
				Opa5.assert.strictEqual(oFailedAssertion.find(".counts .failed").text(), "1", "TODO(1) should have a failed assertion");
				Opa5.assert.strictEqual(oFailedAssertion.find(".counts .passed").text(), "0", "TODO(1) should have no passed assertions");

				var oOPATimeout = oTestResults.eq(2);
				Opa5.assert.ok(oOPATimeout.hasClass("pass todo"), "TODO(2) should pass");
				Opa5.assert.strictEqual(oOPATimeout.find(".counts .failed").text(), "1", "TODO(2) should have OPA timeout");
				Opa5.assert.strictEqual(oOPATimeout.find(".counts .passed").text(), "1", "TODO(2) should have OPA timeout");
				Opa5.assert.ok(oOPATimeout.find(".fail .test-message").text().match(/^Opa timeout/), "TODO(2) should have OPA timeout error message");

				var oQUnitTimeout = oTestResults.eq(3);
				Opa5.assert.ok(oQUnitTimeout.hasClass("pass todo"), "TODO(3) should pass");
				Opa5.assert.strictEqual(oQUnitTimeout.find(".counts .failed").text(), "1", "TODO(3) should have QUnit timeout");
				Opa5.assert.strictEqual(oQUnitTimeout.find(".counts .passed").text(), "1", "TODO(3) should have QUnit timeout");
				Opa5.assert.ok(oQUnitTimeout.find(".fail .test-message").text().match(/Test timed out/), "TODO(3) should have QUnit timeout error message");

				var oFailedTodo	 = oTestResults.eq(4);
				Opa5.assert.ok(oFailedTodo.hasClass("fail todo"), "TODO(4) should fail");
				Opa5.assert.strictEqual(oFailedTodo.find(".counts").text(), "(1)", "TODO(4) should have QUnit timeout");
				Opa5.assert.ok(!oFailedTodo.find(".fail .test-message").length, "TODO(4) should have only successful assertions");
				Opa5.assert.ok(oFailedTodo.find(".pass .test-message").text().match("Should report test that is already adapted"), "TODO(4) should have only successful assertions");
			}
		});
		oOpa.iTeardownMyApp();
	});
});
