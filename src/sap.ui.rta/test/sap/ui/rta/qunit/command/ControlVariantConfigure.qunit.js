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
],
function(
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

			this.oMockedAppComponent = {
				getLocalId: function () {},
				getModel: function () {
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

			var oFlexController = FlexControllerFactory.createForControl(this.oMockedAppComponent, this.oManifest);
			this.oData = {
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

			this.oModel = new VariantModel(this.oData, oFlexController, this.oMockedAppComponent);

			this.oVariant = {
				"content": {
					"fileName":"variant0",
					"content": {
						"title":"variant A"
					},
					"layer":"CUSTOMER",
					"variantReference":"variant00",
					"reference": "Dummy.Component"
				},
				"controlChanges" : []
			};
		},
		after: function () {
			this.oGetAppComponentForControlStub.restore();
			this.oGetComponentClassNameStub.restore();
			this.oModel.destroy();
			this.oManifest.destroy();
		},
		beforeEach: function() {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			this.oVariantManagement.setModel(this.oModel, "$FlexVariants");

			var oDummyOverlay = {
				getVariantManagement : function(){
					return "idMain1--variantManagementOrdersTable";
				}
			};

			sandbox.stub(OverlayRegistry, "getOverlay").returns(oDummyOverlay);
		},
		afterEach: function() {
			sandbox.restore();
			this.oVariantManagement.destroy();
		}
	}, function () {
		QUnit.test("when calling command factory for configure and undo with setTitle, setFavorite and setVisible changes", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns(this.oVariant);
			sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap");

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
			var mFlexSettings = {layer: "CUSTOMER"};
			var oTitleChange = {
				appComponent : this.oMockedAppComponent,
				changeType : "setTitle",
				layer : "CUSTOMER",
				originalTitle : "variant A",
				title : "test",
				variantReference : "variant0"
			};
			var oFavoriteChange = {
				appComponent : this.oMockedAppComponent,
				changeType : "setFavorite",
				favorite : false,
				layer : "CUSTOMER",
				originalFavorite : true,
				variantReference : "variant0"
			};
			var oVisibleChange = {
				appComponent : this.oMockedAppComponent,
				changeType : "setVisible",
				layer : "CUSTOMER",
				variantReference : "variant0",
				visible : false
			};
			var aChanges = [oTitleChange, oFavoriteChange, oVisibleChange],
				oControlVariantConfigureCommand, aPreparedChanges;

			return CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control : this.oVariantManagement,
				changes : aChanges
			}, oDesignTimeMetadata, mFlexSettings)
			.then(function(oCommand) {
				oControlVariantConfigureCommand = oCommand;
				assert.ok(oControlVariantConfigureCommand, "control variant configure command exists for element");
				return oControlVariantConfigureCommand.execute();
			})
			.then(function() {
				var aConfigureChanges = oControlVariantConfigureCommand.getChanges();
				aPreparedChanges = oControlVariantConfigureCommand.getPreparedChange();
				assert.equal(aPreparedChanges.length, 3, "then the prepared changes are available");
				assert.deepEqual(aConfigureChanges, aChanges, "then the changes are correctly set in change");
				assert.equal(this.oData["variantMgmtId1"].variants[1].title, oTitleChange.title, "then title is correctly set in model");
				assert.equal(this.oData["variantMgmtId1"].variants[1].favorite, oFavoriteChange.favorite, "then favorite is correctly set in model");
				assert.equal(this.oData["variantMgmtId1"].variants[1].visible, oVisibleChange.visible, "then visibility is correctly set in model");
				assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 3, "then 3 dirty changes are present");
				return oControlVariantConfigureCommand.undo();
			}.bind(this))
			.then(function() {
				aPreparedChanges = oControlVariantConfigureCommand.getPreparedChange();
				assert.notOk(aPreparedChanges, "then no prepared changes are available after undo");
				assert.equal(this.oData["variantMgmtId1"].variants[1].title, oTitleChange.originalTitle, "then title is correctly reverted in model");
				assert.equal(this.oData["variantMgmtId1"].variants[1].favorite, oFavoriteChange.originalFavorite, "then favorite is correctly set in model");
				assert.equal(this.oData["variantMgmtId1"].variants[1].visible, !oVisibleChange.visible, "then visibility is correctly reverted in model");
				assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then the dirty changes are removed");
			}.bind(this))
			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.test("when calling command factory for configure and undo with setDefault change", function(assert) {
			sandbox.stub(this.oModel, "getVariant").returns(this.oVariant);
			sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap");
			this.oModel.oVariantController._mVariantManagement = {};
			this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
			var mFlexSettings = {layer: "CUSTOMER"};
			var oDefaultChange = {
					appComponent : this.oMockedAppComponent,
					changeType : "setDefault",
					defaultVariant : "variantMgmtId1",
					layer : "CUSTOMER",
					originalDefaultVariant : "variant0",
					variantManagementReference : "variantMgmtId1"
				};
			var aChanges = [oDefaultChange],
				oControlVariantConfigureCommand;
			return CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
				control : this.oVariantManagement,
				changes : aChanges
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
				assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 1, "then 1 dirty change is present");

				return oControlVariantConfigureCommand.undo();
			})
			.then( function() {
				var oData = oControlVariantConfigureCommand.oModel.getData();
				assert.equal(oData["variantMgmtId1"].defaultVariant, oDefaultChange.originalDefaultVariant, "then default variant is correctly reverted in the model");
				assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then the dirty change is removed");
			})
			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
