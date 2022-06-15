/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Change",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	// needs to be included so that the ElementOverlay prototype is enhanced
	"sap/ui/rta/plugin/ControlVariant"
], function(
	Layer,
	FlLayerUtils,
	Change,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	VariantManagement,
	VariantManagementState,
	FlexTestAPI,
	jQuery,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a variant management control ...", {
		before: function() {
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

			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");
			return FlexTestAPI.createVariantModel({
				data: oData,
				appComponent: this.oMockedAppComponent
			}).then(function(oInitializedModel) {
				this.oModel = oInitializedModel;
				// non-personalization mode
				this.oModel._bDesignTimeMode = true;

				this.oChange1 = new Change({
					fileName: "change44",
					fileType: "change",
					layer: Layer.CUSTOMER,
					selector: {
						id: "abc123"
					},
					reference: "Dummy.Component",
					variantReference: "variantMgmtId1"
				});
				this.oChange2 = new Change({
					fileName: "change45",
					fileType: "change",
					layer: Layer.CUSTOMER,
					selector: {
						id: "abc123"
					},
					reference: "Dummy.Component",
					variantReference: "variantMgmtId1"
				});

				this.oVariant = {
					content: {
						fileName: "variant0",
						content: {
							title: "myNewVariant"
						},
						layer: Layer.CUSTOMER,
						variantReference: "variant00",
						support: {
							user: "Me"
						},
						reference: "Dummy.Component"
					},
					controlChanges: [this.oChange1, this.oChange2]
				};

				this.oModel.oData["variantMgmtId1"].variantsEditable = true;
				this.oModel.oData["variantMgmtId1"].modified = true;

				this.oGetCurrentLayerStub = sinon.stub(FlLayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
				sinon.stub(VariantManagementState, "getControlChangesForVariant").returns([this.oChange1, this.oChange2]);
				sinon.stub(this.oModel, "getVariant").returns(this.oVariant);
				sinon.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([this.oChange1, this.oChange2]);
			}.bind(this));
		},
		after: function() {
			this.oModel.destroy();
			this.oMockedAppComponent.destroy();
			this.oGetCurrentLayerStub.restore();
		},
		beforeEach: function() {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
		},
		afterEach: function() {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling command factory for save variants and undo", function(assert) {
			var oOverlay = new ElementOverlay({element: this.oVariantManagement});
			sandbox.stub(this.oModel.oFlexController, "applyChange");
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			sandbox.stub(oOverlay, "getVariantManagement").returns("idMain1--variantManagementOrdersTable");

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({data: {}});
			var mFlexSettings = {layer: Layer.CUSTOMER};
			var oControlVariantSaveCommand;
			return CommandFactory.getCommandFor(this.oVariantManagement, "save", {
				model: this.oModel
			}, oDesignTimeMetadata, mFlexSettings)
				.then(function(oCommand) {
					oControlVariantSaveCommand = oCommand;
					assert.ok(oControlVariantSaveCommand, "control variant save command exists for element");
					return oControlVariantSaveCommand.execute();
				})
				.then(function() {
					assert.ok(oControlVariantSaveCommand._aDirtyChanges[0].assignedToVariant, "the first change is assigned to variant");
					assert.ok(oControlVariantSaveCommand._aDirtyChanges[1].assignedToVariant, "the second change is assigned to variant");
					assert.notOk(this.oModel.oData["variantMgmtId1"].modified, "the dirty flag is set to false");
					return oControlVariantSaveCommand.undo();
				}.bind(this))
				.then(function() {
					assert.notOk(oControlVariantSaveCommand._aDirtyChanges[0].assignedToVariant, "the first change is not assigned to variant");
					assert.notOk(oControlVariantSaveCommand._aDirtyChanges[1].assignedToVariant, "the second change is not assigned to variant");
					assert.ok(this.oModel.oData["variantMgmtId1"].modified, "the dirty flag is set to true again");
					return oControlVariantSaveCommand.undo();
				}.bind(this))
				.then(function() {
					assert.ok(true, "then by default a Promise.resolve() is returned on undo(), even if no changes exist for the command");
				})
				.catch(function(oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
