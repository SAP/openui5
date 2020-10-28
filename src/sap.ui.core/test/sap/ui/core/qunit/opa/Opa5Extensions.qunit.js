/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], function (Opa5, opaTest) {
	"use strict";

	var EMPTY_SITE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/emptySiteWithOpaExtensions.html";

	QUnit.module("Extensions", {
		beforeEach: function () {
			this.fnOpaLoadSpy = sinon.spy(Opa5.prototype, "_loadExtensions");
			this.fnOpaUnloadSpy = sinon.spy(Opa5.prototype, "_unloadExtensions");
		},
		afterEach: function () {
			this.fnOpaLoadSpy.restore();
			this.fnOpaUnloadSpy.restore();
			Opa5.resetConfig();
		}
	});

	opaTest("Should load and call assertion from sample extension", function (Given, When, Then) {
		var Extension;
		Opa5.extendConfig({
			extensions: ["test-resources/sap/ui/core/qunit/opa/opaExtensions/SampleOpaExtension"]
		});

		Given.iStartMyAppInAFrame(EMPTY_SITE_URL);
		Then.waitFor({
			success: function () {
				Extension = Opa5.getWindow().sap.ui.require("test-resources/sap/ui/core/qunit/opa/opaExtensions/SampleOpaExtension"); // must be already loaded
				sinon.assert.calledOnce(this.fnOpaLoadSpy);
				Opa5.assert.strictEqual(Then._getExtensions()[0].name, "sap.ui.test.SampleOpaExtension");
				Opa5.assert.strictEqual(Extension.onAfterInitCalls, 1, "Extension onAfterInit called");
				Opa5.assert.myCustomAssertion();
			}.bind(this)
		});

		Then.iTeardownMyApp();
		Then.waitFor({
			success: function() {
				sinon.assert.calledOnce(this.fnOpaUnloadSpy);
				Opa5.assert.strictEqual(Extension.assertionCalls, 1, "Extension assert called");
				Opa5.assert.strictEqual(Extension.onBeforeExitCalls, 1, "Extension onBeforeExit called");
			}.bind(this)
		});
	});

});
