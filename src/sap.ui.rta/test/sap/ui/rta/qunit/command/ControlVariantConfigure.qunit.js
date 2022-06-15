/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/library",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/variants/VariantManagement",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Layer,
	flUtils,
	CommandFactory,
	rtaLibrary,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	VariantManagement,
	FlexTestAPI,
	VariantManagementState,
	jQuery,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function checkGeneratorInChanges(aChanges, assert) {
		aChanges.forEach(function(oChange) {
			assert.equal(oChange.getDefinition().support.generator, rtaLibrary.GENERATOR_NAME, "the generator was correctly set");
		});
	}
	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Dummy");

	QUnit.module("Given a variant management control ...", {
		before: function() {
			sinon.stub(VariantManagementState, "getContent").returns({});

			this.oData = {
				variantMgmtId1: {
					defaultVariant: "variant0",
					variants: [
						{
							author: "SAP",
							key: "variantMgmtId1",
							layer: Layer.VENDOR,
							visible: true,
							title: "Standard"
						}, {
							author: "Me",
							key: "variant0",
							layer: Layer.CUSTOMER,
							visible: true,
							title: "variant A"
						}
					]
				}
			};

			this.oVariant = {
				content: {
					fileName: "variant0",
					content: {
						title: "variant A"
					},
					layer: Layer.CUSTOMER,
					variantReference: "variant00",
					reference: "Dummy.Component"
				},
				controlChanges: []
			};

			return FlexTestAPI.createVariantModel({
				data: this.oData,
				appComponent: oMockedAppComponent
			}).then(function(oInitializedModel) {
				this.oModel = oInitializedModel;
			}.bind(this));
		},
		after: function() {
			this.oModel.destroy();
		},
		beforeEach: function() {
			sandbox.stub(oMockedAppComponent, "getModel").returns(this.oModel);
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			this.oVariantManagement.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);

			var oDummyOverlay = {
				getVariantManagement: function() {
					return "idMain1--variantManagementOrdersTable";
				}
			};

			sandbox.stub(OverlayRegistry, "getOverlay").returns(oDummyOverlay);
		},
		afterEach: function() {
			sandbox.restore();
			this.oVariantManagement.destroy();
		}
	}, function() {
		QUnit.test("when calling command factory for configure and undo with setTitle, setFavorite and setVisible changes", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns(this.oVariant);
			sandbox.stub(VariantManagementState, "setVariantData").returns(1);
			sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap");

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({data: {}});
			var mFlexSettings = {layer: Layer.CUSTOMER};
			var oTitleChange = {
				appComponent: oMockedAppComponent,
				changeType: "setTitle",
				layer: Layer.CUSTOMER,
				originalTitle: "variant A",
				title: "test",
				variantReference: "variant0"
			};
			var oFavoriteChange = {
				appComponent: oMockedAppComponent,
				changeType: "setFavorite",
				favorite: false,
				layer: Layer.CUSTOMER,
				originalFavorite: true,
				variantReference: "variant0"
			};
			var oVisibleChange = {
				appComponent: oMockedAppComponent,
				changeType: "setVisible",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				visible: false
			};
			var oContextsChange = {
				appComponent: oMockedAppComponent,
				changeType: "setContexts",
				layer: Layer.CUSTOMER,
				variantReference: "variant0",
				contexts: { role: ["ROLE1", "ROLE2"], country: ["DE", "IT"] },
				originalContexts: { role: ["OGROLE1", "OGROLE2"], country: ["OR"] }
			};
			var aChanges = [oTitleChange, oFavoriteChange, oVisibleChange, oContextsChange];
			var oControlVariantConfigureCommand;
			var aPreparedChanges;
			var iDirtyChangesCount;

			return CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control: this.oVariantManagement,
				changes: aChanges
			}, oDesignTimeMetadata, mFlexSettings)
				.then(function(oCommand) {
					oControlVariantConfigureCommand = oCommand;
					assert.ok(oControlVariantConfigureCommand, "control variant configure command exists for element");
					return oControlVariantConfigureCommand.execute();
				})
				.then(function() {
					var aConfigureChanges = oControlVariantConfigureCommand.getChanges();
					aPreparedChanges = oControlVariantConfigureCommand.getPreparedChange();
					assert.equal(aPreparedChanges.length, 4, "then the four prepared changes are available");
					checkGeneratorInChanges(aPreparedChanges, assert);
					assert.deepEqual(aConfigureChanges, aChanges, "then the changes are correctly set in change");
					assert.equal(this.oData["variantMgmtId1"].variants[1].title, oTitleChange.title, "then title is correctly set in model");
					assert.equal(this.oData["variantMgmtId1"].variants[1].favorite, oFavoriteChange.favorite, "then favorite is correctly set in model");
					assert.equal(this.oData["variantMgmtId1"].variants[1].visible, oVisibleChange.visible, "then visibility is correctly set in model");
					assert.deepEqual(this.oData["variantMgmtId1"].variants[1].contexts, oContextsChange.contexts, "then the contexts are correctly set in model");
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 4, "then there are four dirty changes in the flex persistence");
					return oControlVariantConfigureCommand.undo();
				}.bind(this))
				.then(function() {
					aPreparedChanges = oControlVariantConfigureCommand.getPreparedChange();
					assert.notOk(aPreparedChanges, "then no prepared changes are available after undo");
					assert.equal(this.oData["variantMgmtId1"].variants[1].title, oTitleChange.originalTitle, "then title is correctly reverted in model");
					assert.equal(this.oData["variantMgmtId1"].variants[1].favorite, oFavoriteChange.originalFavorite, "then favorite is correctly set in model");
					assert.equal(this.oData["variantMgmtId1"].variants[1].visible, !oVisibleChange.visible, "then visibility is correctly reverted in model");
					assert.deepEqual(this.oData["variantMgmtId1"].variants[1].contexts, oContextsChange.originalContexts, "then the contexts are correctly reverted in model");
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
				}.bind(this))
				.catch(function(oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});

		QUnit.test("when calling command factory for configure and undo with setDefault change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns(this.oVariant);
			sandbox.stub(VariantManagementState, "updateChangesForVariantManagementInMap");

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({data: {}});
			var mFlexSettings = {layer: Layer.CUSTOMER};
			var oDefaultChange = {
				appComponent: oMockedAppComponent,
				changeType: "setDefault",
				defaultVariant: "variantMgmtId1",
				layer: Layer.CUSTOMER,
				originalDefaultVariant: "variant0",
				variantManagementReference: "variantMgmtId1"
			};
			var aChanges = [oDefaultChange];
			var oControlVariantConfigureCommand;
			var iDirtyChangesCount;
			return CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control: this.oVariantManagement,
				changes: aChanges
			}, oDesignTimeMetadata, mFlexSettings)
				.then(function(oCommand) {
					oControlVariantConfigureCommand = oCommand;
					assert.ok(oControlVariantConfigureCommand, "control variant configure command exists for element");
					return oControlVariantConfigureCommand.execute();
				})
				.then(function() {
					var aConfigureChanges = oControlVariantConfigureCommand.getChanges();
					assert.deepEqual(aConfigureChanges, aChanges, "then the changes are correctly set in change");
					var oData = oControlVariantConfigureCommand.oModel.getData();
					assert.equal(oData["variantMgmtId1"].defaultVariant, oDefaultChange.defaultVariant, "then default variant is correctly set in the model");
					var aDirtyChanges = FlexTestAPI.getDirtyChanges({selector: oMockedAppComponent});
					checkGeneratorInChanges(aDirtyChanges, assert);
					assert.strictEqual(aDirtyChanges.length, 1, "then there is one dirty change in the flex persistence");
					return oControlVariantConfigureCommand.undo();
				})
				.then(function() {
					var oData = oControlVariantConfigureCommand.oModel.getData();
					assert.equal(oData["variantMgmtId1"].defaultVariant, oDefaultChange.originalDefaultVariant, "then default variant is correctly reverted in the model");
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
				})
				.catch(function(oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
