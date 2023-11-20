/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/rta/command/CommandFactory",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	VariantManagement,
	CommandFactory,
	FlexTestAPI,
	RtaQunitUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a VariantManagement control and its designtime metadata are created...", {
		beforeEach() {
			this.sVariantManagementReference = "variantManagementReference-1";
			this.oVariantManagement = new VariantManagement(this.sVariantManagementReference, {});
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			return FlexTestAPI.createVariantModel({
				data: {"variantManagementReference-1": {variants: []}},
				appComponent: this.oMockedAppComponent
			}).then(function(oInitializedModel) {
				this.oModel = oInitializedModel;
				sandbox.stub(this.oMockedAppComponent, "getModel").returns(oInitializedModel);
				this.oUpdateCurrentVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			}.bind(this));
		},
		afterEach() {
			this.oMockedAppComponent.destroy();
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting a switch command for VariantManagement...", function(assert) {
			var oSwitchCommand;
			var oSwitchCommandData = {
				targetVariantReference: "newVariantReference",
				sourceVariantReference: "oldVariantReference"
			};

			return CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData)
			.then(function(oCommand) {
				assert.notOk(oCommand.getRelevantForSave(), "then the relevantForSave property is set to false");
				assert.ok(oCommand, "switch command for VariantManagement exists");
				oSwitchCommand = oCommand;
				return oSwitchCommand.execute();
			})
			.then(function() {
				assert.equal(this.oUpdateCurrentVariantStub.callCount, 1, "then updateCurrentVariant after execute command is called once");
				assert.deepEqual(this.oUpdateCurrentVariantStub.getCall(0).args[0], {
					variantManagementReference: this.sVariantManagementReference,
					newVariantReference: oSwitchCommandData.targetVariantReference,
					appComponent: this.oMockedAppComponent
				}, "then updateCurrentVariant after execute command is called with the correct parameters");
			}.bind(this))
			.then(function() {
				return oSwitchCommand.undo();
			})
			.then(function() {
				assert.equal(this.oUpdateCurrentVariantStub.callCount, 2, "then updateCurrentVariant after undo command is called once again");
				assert.deepEqual(this.oUpdateCurrentVariantStub.getCall(1).args[0], {
					variantManagementReference: this.sVariantManagementReference,
					newVariantReference: oSwitchCommandData.sourceVariantReference,
					appComponent: this.oMockedAppComponent
				}, "then updateCurrentVariant after undo command is called with the correct parameters");
			}.bind(this))
			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});

		QUnit.test("when getting a switch command for VariantManagement and discardVariantContent is true", function(assert) {
			var oSwitchCommand;
			var oSwitchCommandData = {
				targetVariantReference: "newVariantReference",
				sourceVariantReference: "oldVariantReference",
				discardVariantContent: true
			};

			var aDirtyChanges = [
				RtaQunitUtils.createUIChange({
					fileName: "change1",
					reference: "Dummy",
					variantReference: "oldVariantReference",
					fileType: "change"
				}),
				RtaQunitUtils.createUIChange({
					fileName: "change2",
					reference: "Dummy",
					variantReference: "oldVariantReference",
					fileType: "ctrl_variant_management_change"
				})
			];

			var oAddAndApplyChangesStub = sandbox.stub(this.oModel, "addAndApplyChangesOnVariant").resolves();
			sandbox.stub(this.oModel, "eraseDirtyChangesOnVariant").resolves(aDirtyChanges);

			return CommandFactory.getCommandFor(this.oVariantManagement, "switch", oSwitchCommandData)
			.then(function(oCommand) {
				assert.ok(oCommand, "switch command for VariantManagement exists");
				oSwitchCommand = oCommand;
				return oSwitchCommand.execute();
			})
			.then(function() {
				assert.deepEqual(oSwitchCommand._aSourceVariantDirtyChanges, aDirtyChanges, "then the dirty changes are retrieved correctly");
				assert.equal(this.oUpdateCurrentVariantStub.callCount, 1, "then updateCurrentVariant after execute command is called once");
				assert.deepEqual(this.oUpdateCurrentVariantStub.getCall(0).args[0], {
					variantManagementReference: this.sVariantManagementReference,
					newVariantReference: oSwitchCommandData.targetVariantReference,
					appComponent: this.oMockedAppComponent
				}, "then updateCurrentVariant after execute command is called with the correct parameters");
			}.bind(this))
			.then(function() {
				return oSwitchCommand.undo();
			})
			.then(function() {
				assert.deepEqual(oAddAndApplyChangesStub.getCall(0).args[0], aDirtyChanges, "then the changes are applied again");
				assert.deepEqual(oSwitchCommand._aSourceVariantDirtyChanges, null, "then the dirty changes are cleared on the command");
				assert.equal(this.oUpdateCurrentVariantStub.callCount, 2, "then updateCurrentVariant after undo command is called once again");
				assert.deepEqual(this.oUpdateCurrentVariantStub.getCall(1).args[0], {
					variantManagementReference: this.sVariantManagementReference,
					newVariantReference: oSwitchCommandData.sourceVariantReference,
					appComponent: this.oMockedAppComponent
				}, "then updateCurrentVariant after undo command is called with the correct parameters");
				assert.ok(this.oUpdateCurrentVariantStub.calledBefore(oAddAndApplyChangesStub), "then the variant is updated before the dirty changes are applied");
			}.bind(this));
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
				assert.equal(this.oUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after execute command is not called");
			}.bind(this))
			.then(function() {
				return oSwitchCommand.undo();
			})
			.then(function() {
				assert.equal(this.oUpdateCurrentVariantStub.callCount, 0, "then updateCurrentVariant after undo command is not called");
			}.bind(this))
			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
