/*global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], function (Opa5, opaTest) {
	"use strict";

	var OPA_TEST_URL = "test-resources/sap/ui/core/qunit/opa/fixture/qunitPause-qunit1.html?sap-ui-qunittimeout=20000";
	var iTestIndex = 0;

	QUnit.module("QUnitPause - OPA", {
		beforeEach: function () {
			Opa5.extendConfig({
				timeout: 30
			});
		},
		afterEach: function () {
			Opa5.resetConfig();
		}
	});

	function createMatcherForTestMessage (oOptions) {
		var bIncreased = false;
		return function () {
			// increase the test index once per matcher
			if (!bIncreased) {
				iTestIndex++;
				bIncreased = true;
			}
			var $Test = Opa5.getJQuery()("#qunit-tests").children(":nth-child(" + iTestIndex + ")");
			if (oOptions.passed) {
				return $Test.hasClass("pass") && $Test.find(".test-name");
			} else {
				return $Test.hasClass("fail") && $Test.find("li>.test-message");
			}
		};
	}

	opaTest("Should pause on OPA tests", function (oOpa) {
		oOpa.iStartMyAppInAFrame(OPA_TEST_URL);

		oOpa.waitFor({
			matchers: createMatcherForTestMessage({
				passed: false
			}),
			success: function ($Messages) {
				Opa5.assert.ok($Messages.text().match("Opa timeout after 1 seconds"));
			}
		});

		oOpa.waitFor({
			matchers: createMatcherForTestMessage({
				passed: false
			}),
			success: function ($Messages) {
				Opa5.assert.ok($Messages.text().match("fail 1"));
			}
		});

		oOpa.waitFor({
			matchers: createMatcherForTestMessage({
				passed: false
			}),
			success: function ($Messages) {
				Opa5.assert.ok($Messages.text().match("Opa timeout after 1 seconds"));
			}
		});

		oOpa.waitFor({
			matchers: createMatcherForTestMessage({
				passed: false
			}),
			success: function ($Messages) {
				Opa5.assert.ok($Messages.text().match("QUnit timeout"));
			}
		});

		oOpa.waitFor({
			matchers: createMatcherForTestMessage({
				passed: false
			}),
			success: function ($Messages) {
				Opa5.assert.ok($Messages.text().match("Should poll"));
			}
		});

		oOpa.waitFor({
			success: function () {
				Opa5.assert.deepEqual(Opa5.getWindow()._testSequence, [
					// opa timeout
					"testStart", "onPause", "emitResume", "testDone",
					// assert failures
					"testStart", "onPause", "fail 1", "fail 2", "emitResume", "onPause", "fail 3", "emitResume", "testDone",
					// opa timeout + enabled 'fail on assert'
					"testStart", "onPause", "emitResume", "testDone",
					// qunit timeout
					"testStart", "onPause", "emitResume", "testDone",
					// polling
					"testStart", "poll: false", "testDone", "done", "poll: true", "poll: true"
				]);
			}
		});

		oOpa.iTeardownMyApp();
	});

});
