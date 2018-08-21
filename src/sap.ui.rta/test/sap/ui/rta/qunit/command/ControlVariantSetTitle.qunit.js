/* global QUnit */

sap.ui.define([
	'sap/ui/fl/Utils',
	'sap/ui/core/Manifest',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/fl/variants/VariantManagement',
	'sap/ui/fl/variants/VariantModel',
	'sap/ui/fl/FlexControllerFactory',
	'sap/ui/thirdparty/sinon-4'
], function (
	FlUtils,
	Manifest,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	VariantManagement,
	VariantModel,
	FlexControllerFactory,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a variant management control ...", {
		before: function () {
			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					"applicationVersion": {
						"version": "1.2.3"
					}
				}
			};

			this.oManifest = new Manifest(oManifestObj);

			var oMockedAppComponent = {
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

			this.oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			this.oGetComponentClassNameStub = sinon.stub(FlUtils, "getComponentClassName").returns("Dummy.Component");

			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, this.oManifest);
			var oData = {
				"variantMgmtId1": {
					"defaultVariant": "variant0",
					"variants": [
						{
							"author": "SAP",
							"key": "variantMgmtId1",
							"layer": "VENDOR",
							"visible": true,
							"title": "Standard"
						}, {
							"author": "Me",
							"key": "variant0",
							"layer": "CUSTOMER",
							"visible": true,
							"title": "variant A"
						}
					]
				}
			};

			this.oModel = new VariantModel(oData, oFlexController, oMockedAppComponent);

			var oVariant = {
				"content": {
					"fileName":"variant0",
					"content": {
						"title": "variant A"
					},
					"layer":"CUSTOMER",
					"variantReference":"variant00",
					"reference": "Dummy.Component"
				},
				"controlChanges" : [
					{
						"fileName":"change44",
						"layer":"CUSTOMER"
					},
					{
						"fileName":"change45",
						"layer":"CUSTOMER"
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
			this.oVariantManagement.setModel(this.oModel, "$FlexVariants");
		},
		afterEach : function () {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for setTitle and undo", function (assert) {
			var done = assert.async();

			var oDummyOverlay = {
				getVariantManagement : function(){
					return "idMain1--variantManagementOrdersTable";
				}
			};
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oDummyOverlay);

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
			var mFlexSettings = {layer: "CUSTOMER"};
			var sNewText = "Test";
			var oControlVariantSetTitleCommand;

			return CommandFactory.getCommandFor(this.oVariantManagement, "setTitle", {
				newText : sNewText
			}, oDesignTimeMetadata, mFlexSettings)
			.then(function(oCommand) {
				oControlVariantSetTitleCommand = oCommand;
				assert.ok(oControlVariantSetTitleCommand, "control variant setTitle command exists for element");
				return oControlVariantSetTitleCommand.execute();
			})
			.then(function() {
				var oTitleChange = oControlVariantSetTitleCommand.getVariantChange();
				var oPreparedChange = oControlVariantSetTitleCommand.getPreparedChange();
				assert.equal(oPreparedChange, oTitleChange, "then the prepared change is available");
				assert.equal(oTitleChange.getText("title"), sNewText, "then title is correctly set in change");
				var oData = oControlVariantSetTitleCommand.oModel.getData();
				assert.equal(oData["variantMgmtId1"].variants[1].title, sNewText, "then title is correctly set in model");
				assert.equal(this.oVariantManagement.getTitle().getText(), sNewText, "then title is correctly set in variant management control");
				assert.equal(oControlVariantSetTitleCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 1, "then 1 dirty change is present");

				return oControlVariantSetTitleCommand.undo();
			}.bind(this))
			.then(function() {
				var oTitleChange = oControlVariantSetTitleCommand.getVariantChange();
				var oPreparedChange = oControlVariantSetTitleCommand.getPreparedChange();
				assert.notOk(oPreparedChange, "then no prepared change is available after undo");
				var oData = oControlVariantSetTitleCommand.oModel.getData();
				assert.equal(oData["variantMgmtId1"].variants[1].title, "variant A", "then title is correctly reverted in model");
				assert.equal(this.oVariantManagement.getTitle().getText(), "variant A", "then title is correctly set in variant management control");
				assert.equal(oControlVariantSetTitleCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then the dirty change is removed");
				assert.notOk(oTitleChange, "then title change from command unset");
				done();
			}.bind(this))
			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
