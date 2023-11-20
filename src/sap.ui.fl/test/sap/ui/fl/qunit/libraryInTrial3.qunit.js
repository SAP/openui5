/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/FlexConfiguration",
	"sap/ui/fl/Utils"
], function(
	sinon,
	FlexConfiguration,
	Utils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.library", {
		beforeEach() {
			this.oSetConfigurationtub = sandbox.stub(FlexConfiguration, "setFlexibilityServices");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isTrialSystem without ushellContainer available", function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns(undefined);
			assert.equal(this.oSetConfigurationtub.callCount, 0, "the flexibilityServices was NOT set in the core Configuration");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});