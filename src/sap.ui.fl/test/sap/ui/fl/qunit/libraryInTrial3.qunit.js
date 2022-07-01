/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Utils",
	"sap/ui/core/Core"
], function(
	sinon,
	Utils,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.library", {
		beforeEach: function () {
			this.oSetConfigurationtub = sandbox.stub(oCore.getConfiguration(), "setFlexibilityServices");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isTrialSystem without ushellContainer available", function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			assert.equal(this.oSetConfigurationtub.callCount, 0, "the flexibilityServices was NOT set in the core Configuration");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});