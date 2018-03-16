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

	var oData = {
		"variantMgmtId1": {
			"defaultVariant": "variantMgmtId1",
			"variants": [
				{
					"author": "SAP",
					"key": "variantMgmtId1",
					"layer": "VENDOR",
					"readOnly": true,
					"title": "Standard"
				}
			]
		}
	};

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

	var oModel = new VariantModel(oData, oFlexController, oMockedAppComponent);

	var oVariant = {
		"content": {
			"fileName":"variant0",
			"content": {
				"title":"variant A"
			},
			"layer":"CUSTOMER",
			"variantReference":"variant00",
			"support":{
				"user":"Me"
			},
			reference: "Dummy.Component"
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
	sinon.stub(Utils, "getCurrentLayer").returns("CUSTOMER");
	sinon.stub(oModel.oVariantController, "getVariants").returns([oVariant]);
	sinon.stub(oModel.oVariantController, "addVariantToVariantManagement").returns(1);
	sinon.stub(oModel.oVariantController, "removeVariantFromVariantManagement").returns(1);

	QUnit.module("Given a variant management control ...", {
		beforeEach : function(assert) {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
		},
		afterEach : function(assert) {
			this.oVariantManagement.destroy();
		}
	});

	QUnit.test("when calling command factory for duplicate variants and undo", function(assert) {
		var done = assert.async();

		var oOverlay = new ElementOverlay({ element: this.oVariantManagement });
		var fnCreateDefaultFileNameSpy = sinon.spy(Utils, "createDefaultFileName");
		sinon.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
		sinon.stub(oOverlay, "getVariantManagement").returns("idMain1--variantManagementOrdersTable");

		var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
		var mFlexSettings = {layer: "CUSTOMER"};

		var oControlVariantDuplicateCommand = CommandFactory.getCommandFor(this.oVariantManagement, "duplicate", {
			sourceVariantReference : oVariant.content.variantReference,
			newVariantTitle: "variant A Copy"
		}, oDesignTimeMetadata, mFlexSettings);

		assert.ok(oControlVariantDuplicateCommand, "control variant duplicate command exists for element");
		oControlVariantDuplicateCommand.execute().then( function() {
			var oDuplicateVariant = oControlVariantDuplicateCommand.getVariantChange();
			var aPreparedChanges = oControlVariantDuplicateCommand.getPreparedChange();
			assert.equal(aPreparedChanges.length, 3, "then the prepared changes are available");
			assert.ok(fnCreateDefaultFileNameSpy.calledWith("Copy"), "then Copy appended to the fileName of the duplicate variant");
			assert.notEqual(oDuplicateVariant.getId().indexOf("_Copy"), -1, "then fileName correctly duplicated");
			assert.equal(oDuplicateVariant.getVariantReference(), oVariant.content.variantReference, "then variant reference correctly duplicated");
			assert.equal(oDuplicateVariant.getTitle(), "variant A" + " Copy", "then variant reference correctly duplicated");
			assert.equal(oDuplicateVariant.getControlChanges().length, 2, "then 2 changes duplicated");
			assert.equal(oDuplicateVariant.getControlChanges()[0].support.sourceChangeFileName, oVariant.controlChanges[0].fileName, "then changes duplicated with source filenames in Change.support.sourceChangeFileName");
			assert.equal(oControlVariantDuplicateCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 3, "then 3 dirty changes present - variant and 2 changes");

			oControlVariantDuplicateCommand.undo().then( function() {
				oDuplicateVariant = oControlVariantDuplicateCommand.getVariantChange();
				aPreparedChanges = oControlVariantDuplicateCommand.getPreparedChange();
				assert.notOk(aPreparedChanges, "then no prepared changes are available after undo");
				assert.equal(oControlVariantDuplicateCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then all dirty changes removed");
				assert.notOk(oDuplicateVariant, "then duplicate variant from command unset");
				done();
			});
		});

	});


});
