/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/variants/VariantManagement",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	CommandFactory,
	VariantManagement,
	FlexTestAPI,
	RtaQunitUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a VariantManagement control and its designtime metadata are created...", {
		beforeEach: function () {
			this.sVariantManagementReference = "variantManagementReference-1";
			this.oVariantManagement = new VariantManagement(this.sVariantManagementReference, {});
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			return FlexTestAPI.createVariantModel({
				data: {variantManagementReference: {variants: []}},
				appComponent: this.oMockedAppComponent
			}).then(function(oInitializedModel) {
				this.oModel = oInitializedModel;
				sandbox.stub(this.oMockedAppComponent, "getModel").returns(oInitializedModel);
				this.fnUpdateCurrentVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant");
			}.bind(this));
		},
		afterEach: function () {
			this.oMockedAppComponent.destroy();
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getting a switch command for VariantManagement...", function(assert) {
			var oSwitchCommand;
			var oSwitchCommandData = {
				targetVariantReference: "newVariantReference",
				sourceVariantReference: "oldVariantReference"
			};

			return CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData)
				.then(function(oCommand) {
					assert.ok(oCommand, "switch command for VariantManagement exists");
					oSwitchCommand = oCommand;
					return oSwitchCommand.execute();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 1, "then updateCurrentVariant after execute command is called once");
					assert.deepEqual(this.fnUpdateCurrentVariantStub.getCall(0).args[0], {
						variantManagementReference: this.sVariantManagementReference,
						newVariantReference: oSwitchCommandData.targetVariantReference,
						appComponent: this.oMockedAppComponent
					}, "then updateCurrentVariant after execute command is called with the correct parameters");
				}.bind(this))
				.then(function() {
					return oSwitchCommand.undo();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 2, "then updateCurrentVariant after undo command is called once again");
					assert.deepEqual(this.fnUpdateCurrentVariantStub.getCall(1).args[0], {
						variantManagementReference: this.sVariantManagementReference,
						newVariantReference: oSwitchCommandData.sourceVariantReference,
						appComponent: this.oMockedAppComponent
					}, "then updateCurrentVariant after undo command is called with the correct parameters");
				}.bind(this))
				.catch(function (oError) {
					assert.ok(false, 'catch must never be called - Error: ' + oError);
				});
		});

		QUnit.test("when getting a switch command for VariantManagement with equal source and target variantId ...", function(assert) {
			var oSwitchCommand;
			var oSwitchCommandData = {
				targetVariantReference: "variantReference",
				sourceVariantReference: "variantReference"
			};

			return CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData)
				.then(function(oCommand) {
					oSwitchCommand = oCommand;
					return oSwitchCommand.execute();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after execute command is not called");
				}.bind(this))
				.then(function() {
					return oSwitchCommand.undo();
				})
				.then(function() {
					assert.equal(this.fnUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after undo command is not called");
				}.bind(this))
				.catch(function (oError) {
					assert.ok(false, 'catch must never be called - Error: ' + oError);
				});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
