/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/core/Manifest",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/thirdparty/sinon-4"
], function (
	Layer,
	flUtils,
	Manifest,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	VariantManagement,
	VariantModel,
	FlexTestAPI,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a variant management control ...", {
		before: function () {
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
				getLocalId: function () {},
				getModel: function () {
					return this.oModel;
				}.bind(this),
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function () {
					return this.oManifest;
				}.bind(this)
			};

			this.oGetAppComponentForControlStub = sinon.stub(flUtils, "getAppComponentForControl").returns(this.oMockedAppComponent);
			this.oGetComponentClassNameStub = sinon.stub(flUtils, "getComponentClassName").returns("Dummy.Component");

			var oData = {
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

			this.oModel = new VariantModel(oData, undefined, this.oMockedAppComponent);

			var oVariant = {
				content: {
					fileName:"variant0",
					content: {
						title: "variant A"
					},
					layer: Layer.CUSTOMER,
					variantReference:"variant00",
					reference: "Dummy.Component"
				},
				controlChanges : [
					{
						fileName:"change44",
						layer: Layer.CUSTOMER
					},
					{
						fileName:"change45",
						layer: Layer.CUSTOMER
					}
				]
			};

			sinon.stub(this.oModel, "getVariant").returns(oVariant);
			sinon.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			sinon.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap");
		},
		after: function () {
			this.oManifest.destroy();
			this.oModel.destroy();
			this.oGetAppComponentForControlStub.restore();
			this.oGetComponentClassNameStub.restore();
		},
		beforeEach : function () {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			this.oVariantManagement.setModel(this.oModel, flUtils.VARIANT_MODEL_NAME);
		},
		afterEach : function () {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for setTitle and undo", function (assert) {
			var oDummyOverlay = {
				getVariantManagement : function() {
					return "idMain1--variantManagementOrdersTable";
				}
			};
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oDummyOverlay);

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({data: {}});
			var mFlexSettings = {layer: Layer.CUSTOMER};
			var sNewText = "Test";
			var oControlVariantSetTitleCommand;
			var iDirtyChangesCount;
			return CommandFactory.getCommandFor(this.oVariantManagement, "setTitle", {
				newText: sNewText
			}, oDesignTimeMetadata, mFlexSettings)
				.then(function (oCommand) {
					oControlVariantSetTitleCommand = oCommand;
					assert.ok(oControlVariantSetTitleCommand, "control variant setTitle command exists for element");
					return oControlVariantSetTitleCommand.execute();
				})
				.then(function () {
					var oTitleChange = oControlVariantSetTitleCommand.getVariantChange();
					var oPreparedChange = oControlVariantSetTitleCommand.getPreparedChange();
					assert.equal(oPreparedChange, oTitleChange, "then the prepared change is available");
					assert.equal(oTitleChange.getText("title"), sNewText, "then title is correctly set in change");
					var oData = oControlVariantSetTitleCommand.oModel.getData();
					assert.equal(oData["variantMgmtId1"].variants[1].title, sNewText, "then title is correctly set in model");
					assert.equal(this.oVariantManagement.getTitle().getText(), sNewText, "then title is correctly set in variant management control");
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 1, "then there is one dirty change in the flex persistence");
					return oControlVariantSetTitleCommand.undo();
				}.bind(this))
				.then(function () {
					var oPreparedChange = oControlVariantSetTitleCommand.getPreparedChange();
					assert.notOk(oPreparedChange, "then no prepared change is available after undo");
					var oData = oControlVariantSetTitleCommand.oModel.getData();
					assert.equal(oData["variantMgmtId1"].variants[1].title, "variant A", "then title is correctly reverted in model");
					assert.equal(this.oVariantManagement.getTitle().getText(), "variant A", "then title is correctly set in variant management control");
					iDirtyChangesCount = FlexTestAPI.getDirtyChanges({selector: this.oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
				}.bind(this))
				.catch(function (oError) {
					assert.ok(false, "catch must never be called - Error: " + oError);
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
