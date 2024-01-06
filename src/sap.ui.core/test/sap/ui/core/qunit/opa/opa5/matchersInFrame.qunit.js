/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/Matcher"
], function (Opa5, opaTest, Matcher) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	var EMPTY_SITE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/emptySite.html";
	var NO_OPA_URL = "test-resources/sap/ui/core/qunit/opa/fixture/noOPA.html";

	QUnit.module("iFrame - opaPlugin");

	QUnit.test("Should always load opaPlugin of the same OPA version running the test and not from the version running in the app (it might not have OPA available)", function(assert) {
		var done = assert.async();
		// System under Test
		var oOpa5 = new Opa5();
		var oPluginWithoutIFrame = Opa5.getPlugin();

		// Act
		oOpa5.iStartMyAppInAFrame(NO_OPA_URL).done(function() {
			// Act + Assert
			var oOpaPlugin = Opa5.getPlugin();

			assert.ok(oOpaPlugin, "could load Opa Plugin, even if not available in app");
			assert.notDeepEqual(oOpaPlugin, oPluginWithoutIFrame, "Opa Plugin should come from the IFrame now");

		});

		oOpa5.iTeardownMyAppFrame();

		oOpa5.emptyQueue().done(done);
	});

	QUnit.module("iFrame - ControlType", {
		beforeEach: function () {
			this.oOpa5 = new Opa5();
			this.oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL);
		},
		afterEach: function () {
		}
	});

	opaTest("Should wait for lazy stubs", function () {
		var fnVisibleStub = sinon.stub(Opa5.getWindow().sap.ui.require("sap/ui/test/matchers/Visible").prototype, "isMatching");
		fnVisibleStub.returns(true);

		this.oOpa5.waitFor({
			success: function () {
				Opa5.getWindow().sap.ui.require(["sap/m/Button"], function(Button) {
					setTimeout(function() {
						new Button().placeAt("body");
					}, 1000);
				});
			}
		});

		this.oOpa5.waitFor({
			controlType: "sap.m.Button",
			success: function (aButtons) {
				Opa5.assert.strictEqual(aButtons.length, 1, "Did find the button after a while");
				fnVisibleStub.restore();
			}
		});

		this.oOpa5.iTeardownMyAppFrame();
	});

	opaTest("Should get an array of controls that is an instance of array of the executing document", function () {
		this.oOpa5.waitFor({
			success: function () {
				Opa5.getWindow().sap.ui.require(["sap/m/Button"], function(Button) {
					new Button().placeAt("body");
				});
			}
		});

		this.oOpa5.waitFor({
			controlType: "sap.m.Button",
			success: function (aButtons) {
				Opa5.assert.ok(aButtons instanceof Array, "It is an array out the outer document");
			}
		});

		this.oOpa5.iTeardownMyAppFrame();
	});

	opaTest("Should access application context from matchers", function () {
		this.oOpa5.waitFor({
			success: function () {
				var aTestMatcher = new Matcher();
				Opa5.assert.strictEqual(aTestMatcher._getApplicationWindow(), Opa5.getWindow());
				Opa5.assert.notStrictEqual(aTestMatcher._getApplicationWindow(), window);
			}
		});

		this.oOpa5.iTeardownMyAppFrame();
	});

	QUnit.module("iFrame - Regexp ID", {
		beforeEach: function () {
			this.oOpa5 = new Opa5();
		},
		afterEach: function () {
		}
	});

	QUnit.test("Should not call success if a regex does not find controls", function (assert) {
		var fnSuccessSpy = sinon.spy(),
			fnErrorSpy = sinon.spy(),
			fnDone = assert.async();

		this.oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL);

		this.oOpa5.waitFor({
			id: /bar/,
			timeout: 1,
			success: fnSuccessSpy,
			error: fnErrorSpy
		});

		Opa5.emptyQueue().always(function () {
			sinon.assert.notCalled(fnSuccessSpy);
			sinon.assert.calledOnce(fnErrorSpy);

			this.oOpa5.iTeardownMyAppFrame();
			Opa5.emptyQueue().always(fnDone);
		}.bind(this));
	});

});
