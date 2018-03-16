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
	FlexControllerFactory
) {
	'use strict';

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

	sinon.stub(oModel, "getVariant").returns(oVariant);
	sinon.stub(oModel.oVariantController, "_setVariantData").returns(1);
	sinon.stub(oModel.oVariantController, "_updateChangesForVariantManagementInMap");

	QUnit.module("Given a variant management control ...", {
		beforeEach : function(assert) {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
			this.oVariantManagement.setModel(oModel, "$FlexVariants");
		},
		afterEach : function(assert) {
			this.oVariantManagement.destroy();
		}
	});

	QUnit.test("when calling command factory for setTitle and undo", function(assert) {
		var done = assert.async();

		var oDummyOverlay = {
			getVariantManagement : function(){
				return "idMain1--variantManagementOrdersTable";
			}
		};
		sinon.stub(OverlayRegistry, "getOverlay").returns(oDummyOverlay);

		var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
		var mFlexSettings = {layer: "CUSTOMER"};
		var sNewText = "Test";

		var oControlVariantSetTitleCommand = CommandFactory.getCommandFor(this.oVariantManagement, "setTitle", {
			newText : sNewText
		}, oDesignTimeMetadata, mFlexSettings);

		assert.ok(oControlVariantSetTitleCommand, "control variant setTitle command exists for element");
		oControlVariantSetTitleCommand.execute().then(function() {
			var oTitleChange = oControlVariantSetTitleCommand.getVariantChange();
			var oPreparedChange = oControlVariantSetTitleCommand.getPreparedChange();
			assert.equal(oPreparedChange, oTitleChange, "then the prepared change is available");
			assert.equal(oTitleChange.getText("title"), sNewText, "then title is correctly set in change");
			var oData = oControlVariantSetTitleCommand.oModel.getData();
			assert.equal(oData["variantMgmtId1"].variants[1].title, sNewText, "then title is correctly set in model");
			assert.equal(this.oVariantManagement.getTitle().getText(), sNewText, "then title is correctly set in variant management control");
			assert.equal(oControlVariantSetTitleCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 1, "then 1 dirty change is present");

			oControlVariantSetTitleCommand.undo().then( function() {
				oTitleChange = oControlVariantSetTitleCommand.getVariantChange();
				oPreparedChange = oControlVariantSetTitleCommand.getPreparedChange();
				assert.notOk(oPreparedChange, "then no prepared change is available after undo");
				oData = oControlVariantSetTitleCommand.oModel.getData();
				assert.equal(oData["variantMgmtId1"].variants[1].title, "variant A", "then title is correctly reverted in model");
				assert.equal(this.oVariantManagement.getTitle().getText(), "variant A", "then title is correctly set in variant management control");
				assert.equal(oControlVariantSetTitleCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then the dirty change is removed");
				assert.notOk(oTitleChange, "then title change from command unset");
				done();
			}.bind(this));
		}.bind(this));

	});


});
