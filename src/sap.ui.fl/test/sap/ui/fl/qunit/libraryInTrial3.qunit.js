/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Configuration",
	"sap/ui/fl/RegistrationDelegator",
	"sap/ui/fl/Utils"
], function(
	sinon,
	jQuery,
	Configuration,
	RegistrationDelegator,
	Utils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.library", {
		beforeEach: function () {
			this.oSetConfigurationtub = sandbox.stub(sap.ui.getCore().getConfiguration(), "setFlexibilityServices");
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
		jQuery('#qunit-fixture').hide();
	});
});