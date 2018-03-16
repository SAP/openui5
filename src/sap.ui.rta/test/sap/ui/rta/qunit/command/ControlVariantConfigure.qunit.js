/* global QUnit sinon */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	// internal:
	'sap/ui/fl/Utils',
	'sap/ui/core/Manifest',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/fl/variants/VariantManagement',
	'sap/ui/rta/plugin/ControlVariant',
	'sap/ui/fl/variants/VariantModel',
	'sap/ui/fl/variants/VariantController',
	'sap/ui/fl/FlexControllerFactory',
	// should be last:
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	Utils,
	Manifest,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	VariantManagement,
	ControlVariant,
	VariantModel,
	VariantController,
	FlexControllerFactory
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	var oManifestObj = {
		"sap.app": {
			id: "MyComponent",
			"applicationVersion": {
				"version": "1.2.3"
			}
		}
	};
	var oManifest = new Manifest(oManifestObj);

	var oMockedAppComponent = {
		getLocalId: function () {
			return undefined;
		},
		getModel: function () {return oModel;},
		getId: function() {
			return "RTADemoAppMD";
		},
		getManifestObject: function() {
			return oManifest;
		}
	};

	sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
	sinon.stub(Utils, "getComponentClassName").returns("Dummy.Component");

	var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, oManifest);
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

	var oModel = new VariantModel(oData, oFlexController, oMockedAppComponent);

	var oVariant = {
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

	QUnit.module("Given a variant management control ...", {
		beforeEach : function(assert) {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			this.oVariantManagement.setModel(oModel, "$FlexVariants");

			var oDummyOverlay = {
				getVariantManagement : function(){
					return "idMain1--variantManagementOrdersTable";
				}
			};

			sandbox.stub(OverlayRegistry, "getOverlay").returns(oDummyOverlay);
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oVariantManagement.destroy();
		}
	});

	QUnit.test("when calling command factory for configure and undo with setTitle, setFavorite and setVisible changes", function(assert) {
		var done = assert.async();

		sandbox.stub(oModel, "getVariant").returns(oVariant);
		sandbox.stub(oModel.oVariantController, "_setVariantData").returns(1);
		sandbox.stub(oModel.oVariantController, "_updateChangesForVariantManagementInMap");

		var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
		var mFlexSettings = {layer: "CUSTOMER"};
		var oTitleChange = {
			appComponent : oMockedAppComponent,
			changeType : "setTitle",
			layer : "CUSTOMER",
			originalTitle : "variant A",
			title : "test",
			variantReference : "variant0"
		};
		var oFavoriteChange = {
			appComponent : oMockedAppComponent,
			changeType : "setFavorite",
			favorite : false,
			layer : "CUSTOMER",
			originalFavorite : true,
			variantReference : "variant0"
		};
		var oVisibleChange = {
			appComponent : oMockedAppComponent,
			changeType : "setVisible",
			layer : "CUSTOMER",
			variantReference : "variant0",
			visible : false
		};
		var aChanges = [oTitleChange, oFavoriteChange, oVisibleChange];
		var oControlVariantConfigureCommand = CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
			control : this.oVariantManagement,
			changes : aChanges
		}, oDesignTimeMetadata, mFlexSettings);

		assert.ok(oControlVariantConfigureCommand, "control variant configure command exists for element");
		oControlVariantConfigureCommand.execute().then(function() {
			var aConfigureChanges = oControlVariantConfigureCommand.getChanges();
			var aPreparedChanges = oControlVariantConfigureCommand.getPreparedChange();
			assert.equal(aPreparedChanges.length, 3, "then the prepared changes are available");
			assert.deepEqual(aConfigureChanges, aChanges, "then the changes are correctly set in change");
			assert.equal(oData["variantMgmtId1"].variants[1].title, oTitleChange.title, "then title is correctly set in model");
			assert.equal(oData["variantMgmtId1"].variants[1].favorite, oFavoriteChange.favorite, "then favorite is correctly set in model");
			assert.equal(oData["variantMgmtId1"].variants[1].visible, oVisibleChange.visible, "then visibility is correctly set in model");
			assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 3, "then 3 dirty changes are present");

			oControlVariantConfigureCommand.undo().then( function() {
				aPreparedChanges = oControlVariantConfigureCommand.getPreparedChange();
				assert.notOk(aPreparedChanges, "then no prepared changes are available after undo");
				assert.equal(oData["variantMgmtId1"].variants[1].title, oTitleChange.originalTitle, "then title is correctly reverted in model");
				assert.equal(oData["variantMgmtId1"].variants[1].favorite, oFavoriteChange.originalFavorite, "then favorite is correctly set in model");
				assert.equal(oData["variantMgmtId1"].variants[1].visible, !oVisibleChange.visible, "then visibility is correctly reverted in model");
				assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then the dirty changes are removed");
				done();
			});
		});

	});

	QUnit.test("when calling command factory for configure and undo with setDefault change", function(assert) {
		var done = assert.async();

		sandbox.stub(oModel, "getVariant").returns(oVariant);
		sandbox.stub(oModel.oVariantController, "_updateChangesForVariantManagementInMap");
		oModel.oVariantController._mVariantManagement = {};
		oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : oData["variantMgmtId1"].defaultVariant};

		var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
		var mFlexSettings = {layer: "CUSTOMER"};
		var oDefaultChange = {
				appComponent : oMockedAppComponent,
				changeType : "setDefault",
				defaultVariant : "variantMgmtId1",
				layer : "CUSTOMER",
				originalDefaultVariant : "variant0",
				variantManagementReference : "variantMgmtId1"
			};
		var aChanges = [oDefaultChange];
		var oControlVariantConfigureCommand = CommandFactory.getCommandFor(this.oVariantManagement, "configure", {
			control : this.oVariantManagement,
			changes : aChanges
		}, oDesignTimeMetadata, mFlexSettings);

		assert.ok(oControlVariantConfigureCommand, "control variant configure command exists for element");
		oControlVariantConfigureCommand.execute().then(function() {
			var aConfigureChanges = oControlVariantConfigureCommand.getChanges();
			assert.deepEqual(aConfigureChanges, aChanges, "then the changes are correctly set in change");
			var oData = oControlVariantConfigureCommand.oModel.getData();
			assert.equal(oData["variantMgmtId1"].defaultVariant, oDefaultChange.defaultVariant, "then default variant is correctly set in the model");
			assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 1, "then 1 dirty change is present");

			oControlVariantConfigureCommand.undo().then( function() {
				oData = oControlVariantConfigureCommand.oModel.getData();
				assert.equal(oData["variantMgmtId1"].defaultVariant, oDefaultChange.originalDefaultVariant, "then default variant is correctly reverted in the model");
				assert.equal(oControlVariantConfigureCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then the dirty change is removed");
				done();
			});
		});

	});

});
