/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/qunitPause",
	"sap/ui/test/matchers/PropertyStrictEquals"
], async function (Core, opaTest, Opa5, qunitPause, PropertyStrictEquals) {
	"use strict";

	await Core.ready();

	QUnit.config.hidepassed = false;
	window._testSequence = [];

	qunitPause.onPause(function () {
		window._testSequence.push("onPause");
		setTimeout(function () {
			window._testSequence.push("emitResume");
			qunitPause.emitResume();
		}, 1000); // to cover edge case: QUnit timeout > OPA timeout && QUnit timeout < OPA timeout + pause delay
	});

	QUnit.testStart(function () {
		window._testSequence.push("testStart");
	});

	QUnit.testDone(function () {
		window._testSequence.push("testDone");
	});

	QUnit.done(function () {
		window._testSequence.push("done");
	});

	QUnit.module("QUnitPause - opa timeout", {
		beforeEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.TIMEOUT;
		},
		afterEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.NONE;
		}
	});

	opaTest("Should pause on opa timeout", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("./miniUI5Site.html");
		Then.waitFor({
			viewName: "myView",
			id: "myButton",
			success: function () {
				Opa5.assert.ok(true, "pass 1");
			}
		});
		Then.waitFor({
			viewName: "myView",
			id: "myButton",
			timeout: 1,
			// will cause opa timeout!
			matchers: new PropertyStrictEquals({
				name: "text",
				value: "this text is not the text of the button"
			}),
			success: function () {
				Opa5.assert.ok(false, "should never get here");
			}
		});
	});

	QUnit.module("QUnitPause - assert", {
		beforeEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.ASSERT;
		},
		afterEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.NONE;
		}
	});

	opaTest("Should pause on assert fail", function (Given, When, Then) {
		Then.waitFor({
			viewName: "myView",
			id: "myButton",
			success: function () {
				Opa5.assert.ok(false, "fail 1");
				window._testSequence.push("fail 1");
				Opa5.assert.ok(false, "fail 2");
				window._testSequence.push("fail 2");
			}
		});
		Then.waitFor({
			viewName: "myView",
			id: "myButton",
			success: function () {
				Opa5.assert.ok(false, "fail 3");
				window._testSequence.push("fail 3");
			}
		});
	});

	opaTest("Should pause only once on opa timeout (pause is enabled on both assert & timeout)", function (Given, When, Then) {
		Then.waitFor({
			timeout: 1,
			viewName: "myView",
			id: "myButton-fail",
			success: function () {
				Opa5.assert.ok(false, "should never get here");
			}
		});
	});

	QUnit.module("QUnitPause - qunit timeout", {
		beforeEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.TIMEOUT;
			QUnit.config.testTimeout = 1000;
		},
		afterEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.NONE;
			QUnit.config.testTimeout = 30000;
		}
	});

	opaTest("Should pause on QUnit timeout", function (Given, When, Then) {
		Then.waitFor({
			viewName: "myView",
			id: "myButton",
			success: function () {
				Opa5.assert.ok(true, "pass 2");
			}
		});
		Then.waitFor({
			viewName: "myView",
			id: "myButton",
			// will cause qunit timeout!
			matchers: new PropertyStrictEquals({
				name: "text",
				value: "this text is not the text of the button"
			}),
			success: function () {
				Opa5.assert.ok(false, "should never get here");
			}
		});
	});

	var callPollForQUnitDone = function (iCount, iLimit) {
		qunitPause.pollForQUnitDone(10000, function (mResult) {
			window._testSequence.push("poll: " + mResult.qunitDone);
			if (iCount < iLimit - 1) {
				callPollForQUnitDone(iCount + 1, iLimit);
			}
		});
	};

	QUnit.module("QUnitPause - poll for QUnit to be done", {
		beforeEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.POLL;
			callPollForQUnitDone(0, 3);
		},
		afterEach: function () {
			qunitPause.pauseRule = qunitPause.PAUSE_RULES.NONE;
		}
	});

	opaTest("Should poll for QUnit to be done", function (Given, When, Then) {
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
