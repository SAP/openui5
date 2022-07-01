/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/core/Core"
], function(
	sinon,
	Layer,
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
		QUnit.test("isTrialSystem with ushellContainer available and returning true", function(assert) {
			sandbox.stub(Utils, "getUshellContainer").returns({
				getLogonSystem: function() {
					return {
						isTrial: function() {
							return true;
						}
					};
				}
			});

			var aTrialConfiguration = [{
				connector: "LrepConnector",
				url: "/sap/bc/lrep",
				layers: []
			}, {
				connector: "LocalStorageConnector",
				layers: [Layer.CUSTOMER, Layer.PUBLIC, Layer.USER]
			}];

			return new Promise(function(resolve) {
				sap.ui.require(["sap/ui/fl/library"], function() {
					assert.equal(this.oSetConfigurationtub.callCount, 1, "the flexibilityServices was set in the core Configuration");
					assert.deepEqual(this.oSetConfigurationtub.getCall(0).args[0], aTrialConfiguration, "the configuration was set correctly");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});