/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/rta/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Change,
	Layer,
	FlVariant,
	VariantManagement,
	ContextSharingAPI,
	Utils,
	CommandFactory,
	rtaLibrary,
	sinon,
	FlexTestAPI,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

	QUnit.module("FlVariant Save as", {
		beforeEach: function() {
			var oData = {
				variantMgmtId1: {
					defaultVariant: "variantMgmtId1",
					variants: [
						{
							author: "SAP",
							key: "variantMgmtId1",
							layer: Layer.VENDOR,
							readOnly: true,
							title: "Standard"
						}
					]
				}
			};

			return FlexTestAPI.createVariantModel({
				data: oData,
				appComponent: oMockedAppComponent
			}).then(function(oInitializedModel) {
				this.oModel = oInitializedModel;
				this.oHandleSaveStub = sandbox.stub(this.oModel, "_handleSave");
				this.oVariantManagement = new VariantManagement("variantMgmtId1");
				sandbox.spy(this.oVariantManagement, "detachCancel");
				sandbox.spy(this.oVariantManagement, "detachSave");
				sandbox.stub(oMockedAppComponent, "getModel").returns(this.oModel);
				sandbox.stub(ContextSharingAPI, "createComponent").returns("myContextSharing");
				sandbox.stub(Utils, "getRtaStyleClassName").returns("myRtaStyleClass");
				this.oOpenDialogStub = sandbox.stub(this.oVariantManagement, "openSaveAsDialogForKeyUser");
				// non-personalization mode
				this.oModel._bDesignTimeMode = true;
			}.bind(this));
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("execute and undo", function(assert) {
			var oSaveAsCommand;
			var mFlexSettings = {layer: Layer.CUSTOMER};
			var oSourceVariantReference = "mySourceReference";
			this.oOpenDialogStub.callsFake(function(sStyleClass, oContextSharing) {
				assert.strictEqual(sStyleClass, "myRtaStyleClass", "the style class was passed");
				assert.strictEqual(oContextSharing, "myContextSharing", "the context sharing component was passed");
				this.oVariantManagement.fireSave({
					name: "newName",
					overwrite: false,
					key: "newKey"
				});
			}.bind(this));
			var aChanges = [
				new FlVariant("foo", {flexObjectMetadata: {reference: "myReference"}}),
				new Change({
					fileName: "change1",
					reference: "Dummy.Component",
					variantReference: "variantMgmtId1",
					fileType: "change"
				}),
				new Change({
					fileName: "change2",
					reference: "Dummy.Component",
					variantReference: "variantMgmtId1",
					fileType: "ctrl_variant_management_change"
				})
			];
			this.oHandleSaveStub.resolves(aChanges);
			sandbox.stub(this.oModel, "getVariant").returns({
				controlChanges: [new Change({
					fileName: "change0",
					reference: "Dummy.Component",
					variantReference: "variantMgmtId1",
					fileType: "change"
				})]
			});
			var oCheckStub = sandbox.stub(this.oModel, "checkDirtyStateForControlModels");
			var oRemoveStub = sandbox.stub(this.oModel, "removeVariant").resolves();
			var oCheckUpdateStub = sandbox.stub(this.oModel, "checkUpdate");
			var oDeleteChangeStub = sandbox.stub(this.oModel.oFlexController, "deleteChange");
			var oAddChangeStub = sandbox.stub(this.oModel.oFlexController, "addPreparedChange");
			var oApplyChangeStub = sandbox.stub(this.oModel.oFlexController, "applyChange");

			return CommandFactory.getCommandFor(this.oVariantManagement, "saveAs", {
				sourceVariantReference: oSourceVariantReference,
				model: this.oModel
			}, null, mFlexSettings)

			.then(function(oCommand) {
				oSaveAsCommand = oCommand;

				assert.strictEqual(oSaveAsCommand.getSourceDefaultVariant(), "variantMgmtId1", "the source default variant is set");
				assert.deepEqual(oSaveAsCommand.getNewVariantParameters(), {
					name: "newName",
					overwrite: false,
					key: "newKey",
					id: "variantMgmtId1-vm"
				}, "the parameters were saved in the command");
				assert.strictEqual(this.oVariantManagement.detachSave.callCount, 1, "the save event was detached");
				assert.strictEqual(this.oVariantManagement.detachCancel.callCount, 1, "the cancel event was detached");

				return oSaveAsCommand.execute();
			}.bind(this)).then(function() {
				var mExpectedParams = {
					id: "variantMgmtId1-vm",
					key: "newKey",
					name: "newName",
					overwrite: false,
					layer: Layer.CUSTOMER,
					generator: rtaLibrary.GENERATOR_NAME,
					newVariantReference: undefined
				};
				assert.strictEqual(this.oHandleSaveStub.callCount, 1, "the model was called");
				assert.strictEqual(this.oHandleSaveStub.firstCall.args[0].getId(), "variantMgmtId1", "the VM Control is the first argument");
				assert.deepEqual(this.oHandleSaveStub.firstCall.args[1], mExpectedParams, "the property bag was enhanced");
				assert.strictEqual(oCheckStub.callCount, 1, "the check dirty state function was called");
				assert.deepEqual(oCheckStub.firstCall.args[0], ["variantMgmtId1"], "the variant management id was passed");

				return oSaveAsCommand.undo();
			}.bind(this)).then(function() {
				assert.strictEqual(oDeleteChangeStub.callCount, 1, "one change got deleted");

				var mExpectedProperties = {
					variant: aChanges[0],
					sourceVariantReference: "mySourceReference",
					variantManagementReference: "variantMgmtId1",
					component: oMockedAppComponent
				};
				assert.strictEqual(oRemoveStub.callCount, 1, "removeVariant was called");
				assert.deepEqual(oRemoveStub.firstCall.args[0], mExpectedProperties, "the correct properties were passed-1");
				assert.deepEqual(oRemoveStub.firstCall.args[1], true, "the correct properties were passed-2");
				assert.strictEqual(oAddChangeStub.callCount, 1, "one change was added back");
				assert.strictEqual(oApplyChangeStub.callCount, 1, "one change was applied again");
				assert.strictEqual(oCheckUpdateStub.callCount, 1, "the check update function was called");
				assert.strictEqual(oCheckUpdateStub.firstCall.args[0], true, "the correct properties were passed");
			});
		});

		QUnit.test("cancel", function(assert) {
			this.oOpenDialogStub.callsFake(function() {
				this.oVariantManagement._fireCancel({});
			}.bind(this));

			return CommandFactory.getCommandFor(this.oVariantManagement, "saveAs", {
				sourceVariantReference: "mySourceReference",
				model: this.oModel
			})

			.then(function(oCommand) {
				assert.notOk(oCommand, "no command was created");
				assert.strictEqual(this.oVariantManagement.detachSave.callCount, 1, "the save event was detached");
				assert.strictEqual(this.oVariantManagement.detachCancel.callCount, 1, "the cancel event was detached");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oMockedAppComponent._restoreGetAppComponentStub();
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});