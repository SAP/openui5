/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Change",
	"sap/ui/core/Manifest",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/thirdparty/sinon-4",
	// needs to be included so that the ElementOverlay prototype is enhanced
	"sap/ui/rta/plugin/ControlVariant"
], function(
	Layer,
	FlUtils,
	FlLayerUtils,
	Change,
	Manifest,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	VariantManagement,
	VariantModel,
	VariantManagementState,
	FlexTestAPI,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

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

			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};

			this.oManifest = new Manifest(oManifestObj);

			this.oMockedAppComponent = {
				getLocalId: function() {},
				getModel: function() {
					return this.oModel;
				}.bind(this),
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function() {
					return this.oManifest;
				}.bind(this)
			};

			this.oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(this.oMockedAppComponent);
			this.oGetComponentClassNameStub = sinon.stub(FlUtils, "getComponentClassName").returns("Dummy.Component");

			this.oModel = new VariantModel(oData, undefined, this.oMockedAppComponent);
			// non-personalization mode
			this.oModel._bDesignTimeMode = true;

			var oChange1 = new Change({
				fileName: "change44",
				layer: Layer.CUSTOMER,
				selector: {
					id: "abc123"
				},
				reference: "Dummy.Component",
				variantReference: "variantMgmtId1"
			});
			var oChange2 = new Change({
				fileName: "change45",
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
				controlChanges: [oChange1, oChange2]
			};

			this.oModel.oData["variantMgmtId1"].variantsEditable = true;
			this.oModel.oData["variantMgmtId1"].modified = true;

			this.oGetCurrentLayerStub = sinon.stub(FlLayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
			sinon.stub(VariantManagementState, "getControlChangesForVariant").returns([oChange1, oChange2]);
			sinon.stub(this.oModel, "getVariant").returns(this.oVariant);
			sinon.stub(VariantManagementState, "addVariantToVariantManagement").returns(1);
			sinon.stub(VariantManagementState, "removeVariantFromVariantManagement").returns(1);
			sinon.stub(VariantManagementState, "addChangeToVariant").returns(true);
			sinon.stub(VariantManagementState, "getContent").returns({});
		},
		after: function() {
			this.oManifest.destroy();
			this.oModel.destroy();
			this.oGetAppComponentForControlStub.restore();
			this.oGetComponentClassNameStub.restore();
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
		QUnit.test("when calling command factory for saveAs variants and undo", function(assert) {
			var oOverlay = new ElementOverlay({element: this.oVariantManagement});
			var fnCreateDefaultFileNameSpy = sandbox.spy(FlUtils, "createDefaultFileName");
			sandbox.stub(this.oModel.oFlexController, "applyChange");
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			sandbox.stub(oOverlay, "getVariantManagement").returns("idMain1--variantManagementOrdersTable");
			var fnCreateSaveAsDialog = this.oVariantManagement._createSaveAsDialog;
			sandbox.stub(this.oVariantManagement, "_createSaveAsDialog").callsFake(function() {
				fnCreateSaveAsDialog.call(this.oVariantManagement);
				this.oVariantManagement.oSaveAsDialog.attachEventOnce("afterOpen", function() {
					this.oVariantManagement._handleVariantSaveAs("myNewVariant");
				}.bind(this));
			}.bind(this));

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({data: {}});
			var mFlexSettings = {layer: Layer.CUSTOMER};
			var oControlVariantSaveAsCommand;
			var oSaveAsVariant;
			var aPreparedChanges;
			var aDirtyChanges;
			var iDirtyChangesCount;
			return CommandFactory.getCommandFor(this.oVariantManagement, "saveAs", {
				sourceVariantReference: this.oVariant.content.variantReference,
				model: this.oModel
			}, oDesignTimeMetadata, mFlexSettings)
				.then(function(oCommand) {
					oControlVariantSaveAsCommand = oCommand;
					assert.ok(oControlVariantSaveAsCommand, "control variant saveAs command exists for element");
					return oControlVariantSaveAsCommand.execute();
				})
				.then(function() {
					oSaveAsVariant = oControlVariantSaveAsCommand.getVariantChange();
					assert.equal(oSaveAsVariant.getDefinition().support.generator, sap.ui.rta.GENERATOR_NAME, "the generator was correctly set");
					aPreparedChanges = oControlVariantSaveAsCommand.getPreparedChange();
					assert.equal(aPreparedChanges.length, 3, "then the prepared changes are available");
					assert.strictEqual(fnCreateDefaultFileNameSpy.callCount, 3, "then sap.ui.fl.Utils.createDefaultFileName() called thrice; once for variant duplicate and twice for the copied changes");
					assert.strictEqual(fnCreateDefaultFileNameSpy.returnValues[0], oSaveAsVariant.getId(), "then the saveAs variant has the correct ID");
					assert.equal(oSaveAsVariant.getVariantReference(), this.oVariant.content.variantReference, "then variant reference is correctly set");
					assert.equal(oSaveAsVariant.getTitle(), "myNewVariant", "then variant reference correctly set");
					assert.equal(oSaveAsVariant.getControlChanges().length, 2, "then 2 changes duplicated");
					assert.equal(oSaveAsVariant.getControlChanges()[0].getDefinition().support.sourceChangeFileName, this.oVariant.controlChanges[0].getDefinition().fileName, "then changes duplicated with source filenames in Change.support.sourceChangeFileName");
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 3, "then there are three dirty changes in the flex persistence");
					assert.notOk(this.oModel.oData["variantMgmtId1"].modified, "the diry flag is set to false");
					return oControlVariantSaveAsCommand.undo();
				}.bind(this))
				.then(function() {
					oSaveAsVariant = oControlVariantSaveAsCommand.getVariantChange();
					aPreparedChanges = oControlVariantSaveAsCommand.getPreparedChange();
					assert.notOk(aPreparedChanges, "then no prepared changes are available after undo");
					aDirtyChanges = FlexTestAPI.getDirtyChanges({selector: this.oMockedAppComponent});
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 2, "then there are two dirty changes in the flex persistence");
					assert.strictEqual(aDirtyChanges[0].getId(), "change44", "the first change is the first dirty control change");
					assert.strictEqual(aDirtyChanges[1].getId(), "change45", "the second change is the second dirty control change");
					assert.notOk(oSaveAsVariant, "then saveAs variant from command unset");
					assert.notOk(oControlVariantSaveAsCommand._oVariantChange, "then _oVariantChange property was unset for the command");
					assert.ok(this.oModel.oData["variantMgmtId1"].modified, "the diry flag is set to true again");
					return oControlVariantSaveAsCommand.undo();
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
