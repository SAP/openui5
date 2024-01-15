/*global QUnit, sinon */
QUnit.config.testTimeout = 4000;
QUnit.config.autostart = false;

/**
 * This file is tested by an OPA test (iFrame.js),
 * it seems to be the only way to test what appears when OPA test produce QUnit errors.
 * The checks will be done my crawling the QUnit dom and check if the texts are correct.
 */

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/test/Opa5",
	"sap/ui/test/Opa",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/base/Log",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage-istanbul"
], async function (Core, Opa5, Opa, _OpaLogger, opaTest, PropertyStrictEquals, _timeoutWaiter, Log) {
	"use strict";

	await Core.ready();

	QUnit.module("Timeouts");

	opaTest("Should hit a QUnit timeout", function (oOpa) {
		oOpa.waitFor({
			check: function () {
				return false;
			}
		});
	});

	opaTest("Should add a global assertion to the 2nd test not the first one that timed out", function (oOpa) {
		oOpa.waitFor({
			success: function () {
				// global assert on purpose so QUnit does not know which test fired the assertion
				QUnit.assert.ok(true, "Ok from test 2");
			}
		});
	});

	opaTest("Should add a log message from the 3rd test it must not appear in test 4", function (oOpa) {
		oOpa.waitFor({
			check: function () {
				Log.debug("Log message that should not appear in the error", "", "sap.ui.test.MyTest");
				return true;
			},
			success: function () {
				// global assert on purpose so QUnit does not know which test fired the assertion
				QUnit.assert.ok(true, "Ok from test 3");
			}
		});
	});

	opaTest("Should log that we were searching for a control with a global id " +
			"but it was not found when QUnit times out", function (oOpa) {
		oOpa.waitFor({
			id: "myGlobalId"
		});
	});

	opaTest("Should log that we were searching for a control with a global id " +
			"but it was not found when Opa times out", function (oOpa) {
		oOpa.waitFor({
			timeout: 1, // seconds
			pollingInterval: 50, //ms
			id: "myGlobalId"
		});
	});

	opaTest("Should log the error message when Opa times out", function (oOpa) {
		oOpa.waitFor({
			timeout: 1, // seconds
			pollingInterval: 50, //ms
			id: "myGlobalId",
			errorMessage: "bad luck no button was found"
		});
	});

	opaTest("Should log that the queue was stopped manually", function (oOpa) {
		oOpa.waitFor({
			check: function () {
				Opa.stopQueue();
				return false;
			}
		});
	});

	QUnit.module("Exceptions", {
		beforeEach: function () {
			this.fnOriginal = window.onerror;
			window.onerror = function() {};
		},
		afterEach: function () {
			window.onerror = this.fnOriginal;
		}
	});

	opaTest("Should show an error thrown by a check", function (oOpa) {
		oOpa.waitFor({
			check: function () {
				throw new Error("Doh! An exception in 'check'.");
			}
		});
	});

	opaTest("Should show an error thrown by a matcher", function (oOpa) {
		oOpa.waitFor({
			matchers: function () {
				throw new Error("Doh! An exception in 'matchers'.");
			}
		});
	});

	opaTest("Should show an error thrown by actions", function (oOpa) {
		oOpa.waitFor({
			actions: function () {
				throw new Error("Doh! An exception in 'actions'.");
			}
		});
	});

	opaTest("Should show an error thrown by a success", function (oOpa) {
		oOpa.waitFor({
			success: function () {
				throw new Error("Doh! An exception in 'success'.");
			}
		});
	});

	opaTest("Should show an error thrown together with actions", function (oOpa) {
		oOpa.waitFor({
			actions: function () {},
			success: function () {
				throw new Error("Doh! An exception in 'success'.");
			}
		});
	});

	QUnit.module("IFrame");

	opaTest("Should start an IFrame and log something there", function (oOpa) {
		oOpa.iStartMyAppInAFrame("./miniUI5Site.html");

		oOpa.waitFor({
			viewName: "myView",
			id: "myButton",
			timeout: 1,
			matchers: new PropertyStrictEquals({
				name: "text",
				value: "this text is not the text of the button"
			})
		});
	});

	opaTest("Should enable autoWait for XHR when not searching for a control", function (oOpa) {
		var oFakeXHR,
			bLoaded = false;
		Opa5.extendConfig({
			autoWait: true
		});

		oOpa.waitFor({
			success: function () {
				Opa5.getWindow().sap.ui.require(["sap/ui/thirdparty/sinon"], function (sinon) {
					oFakeXHR = sinon.useFakeXMLHttpRequest();
					Opa5.getJQuery().ajax({url: "/foo"});
					bLoaded = true;
				});
			}
		});

		oOpa.waitFor({
			timeout: 2,
			check: function () {
				return bLoaded;
			},
			success: function () {
				QUnit.assert.ok(false, "Should not happen");
			},
			error: function () {
				Opa5.resetConfig();
				oFakeXHR.restore();
			}
		});
	});

	opaTest("Should enable autoWait when searching for a control", function (oOpa) {
		var oTimeoutWaiterStub;

		Opa5.extendConfig({
			autoWait: true
		});

		oOpa.waitFor({
			success: function () {
				// prevent timeout detection from interfering (IE11 testrunner)
				var oIFrameTimeoutWaiter = Opa5.getWindow().sap.ui.require("sap/ui/test/autowaiter/_timeoutWaiter");
				oTimeoutWaiterStub = sinon.stub(oIFrameTimeoutWaiter, "hasPending");
				oTimeoutWaiterStub.returns(false);
			}
		});

		oOpa.waitFor({
			viewName: "myView",
			id: "myButton",
			success: function (oButton) {
				oButton.setBusy(true);
			}
		});

		oOpa.waitFor({
			timeout: 2,
			viewName: "myView",
			id: "myButton",
			success: function () {
				QUnit.assert.ok(false, "Should not happen");
			},
			error: function () {
				oTimeoutWaiterStub.restore();
			}
		});
	});

	QUnit.start();

});
