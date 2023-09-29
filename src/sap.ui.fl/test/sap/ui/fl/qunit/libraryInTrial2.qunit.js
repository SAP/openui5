/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/config",
	"sap/ui/fl/Utils"
], function(
	sinon,
	config,
	Utils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.library", {
		beforeEach() {
			this.oSetConfigurationtub = sandbox.stub(config, "setFlexibilityServices");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("isTrialSystem with ushellContainer available and returning false", function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns({
				getLogonSystem() {
					return {
						isTrial() {
							return false;
						}
					};
				}
			});

			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/fl/library"], function() {
					assert.equal(this.oSetConfigurationtub.callCount, 0, "the flexibilityServices was NOT set in the core Configuration");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});