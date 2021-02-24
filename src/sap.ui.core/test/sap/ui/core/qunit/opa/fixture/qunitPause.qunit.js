/*global QUnit */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (opaTest, Opa5) {
	"use strict";

	QUnit.config.hidepassed = false;
	window._testSequence = [];

	QUnit.testStart(function () {
		window._testSequence.push("testStart");
	});

	QUnit.testDone(function () {
		window._testSequence.push("testDone");
	});

	QUnit.done(function () {
		window._testSequence.push("done");
	});

	var callPollForQUnitDone = function (iCount, iLimit) {
		sap.ui.test.qunitPause.pollForQUnitDone(10000, function (mResult) {
			window._testSequence.push("poll: " + mResult.qunitDone);
			if (iCount < iLimit - 1) {
				callPollForQUnitDone(iCount + 1, iLimit);
			}
		});
	};

	QUnit.module("QUnitPause - poll for QUnit to be done", {
		beforeEach: function () {
			sap.ui.test.qunitPause.pauseRule = sap.ui.test.qunitPause.PAUSE_RULES.POLL;
			callPollForQUnitDone(0, 3);
		},
		afterEach: function () {
			sap.ui.test.qunitPause.pauseRule = sap.ui.test.qunitPause.PAUSE_RULES.NONE;
		}
	});

	opaTest("Should poll for QUnit to be done", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("./miniUI5Site.html");
		Then.waitFor({
			viewName: "myView",
			id: "myButton1",
			success: function () {
				Opa5.assert.ok(true, "pass 2");
			},
			errorMessage: "Should poll"
		});
	});

	QUnit.start();
});
