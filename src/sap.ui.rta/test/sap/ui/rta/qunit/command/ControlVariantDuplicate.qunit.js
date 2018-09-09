/* global QUnit */

sap.ui.define([
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
	'sap/ui/thirdparty/sinon-4'
],
function (
	FlUtils,
	Manifest,
	CommandFactory,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ElementOverlay,
	VariantManagement,
	ControlVariant,
	VariantModel,
	FlexControllerFactory,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a variant management control ...", {
		before: function () {
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

			this.oManifest = new Manifest(oManifestObj);

			var oMockedAppComponent = {
				getLocalId: function () {},
				getModel: function () {
					return this.oModel;
				}.bind(this),
				getId: function () {
					return "RTADemoAppMD";
				},
				getManifest: function () {
					return this.oManifest;
				}.bind(this)
			};

			this.oGetAppComponentForControlStub = sinon.stub(FlUtils, "_getAppComponentForComponent").returns(oMockedAppComponent);
			this.oGetComponentClassNameStub = sinon.stub(FlUtils, "getComponentClassName").returns("Dummy.Component");

			var oFlexController = FlexControllerFactory.createForControl(oMockedAppComponent, this.oManifest);

			this.oModel = new VariantModel(oData, oFlexController, oMockedAppComponent);

			this.oVariant = {
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

			this.oGetCurrentLayerStub = sinon.stub(FlUtils, "getCurrentLayer").returns("CUSTOMER");
			sinon.stub(this.oModel, "getVariant").returns(this.oVariant);
			sinon.stub(this.oModel.oVariantController, "getVariants").returns([this.oVariant]);
			sinon.stub(this.oModel.oVariantController, "addVariantToVariantManagement").returns(1);
			sinon.stub(this.oModel.oVariantController, "removeVariantFromVariantManagement").returns(1);

		},
		after: function () {
			this.oManifest.destroy();
			this.oModel.destroy();
			this.oGetAppComponentForControlStub.restore();
			this.oGetComponentClassNameStub.restore();
			this.oGetCurrentLayerStub.restore();
		},
		beforeEach: function () {
			this.oVariantManagement = new VariantManagement("variantMgmtId1");
		},
		afterEach: function () {
			this.oVariantManagement.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling command factory for duplicate variants and undo", function (assert) {
			var oOverlay = new ElementOverlay({ element: this.oVariantManagement });
			var fnCreateDefaultFileNameSpy = sandbox.spy(FlUtils, "createDefaultFileName");
			sandbox.stub(OverlayRegistry, "getOverlay").returns(oOverlay);
			sandbox.stub(oOverlay, "getVariantManagement").returns("idMain1--variantManagementOrdersTable");

			var oDesignTimeMetadata = new ElementDesignTimeMetadata({ data : {} });
			var mFlexSettings = {layer: "CUSTOMER"};
			var oControlVariantDuplicateCommand, oDuplicateVariant, aPreparedChanges;

			return CommandFactory.getCommandFor(this.oVariantManagement, "duplicate", {
				sourceVariantReference : this.oVariant.content.variantReference,
				newVariantTitle: "variant A Copy"
			}, oDesignTimeMetadata, mFlexSettings)
			.then(function(oCommand) {
				oControlVariantDuplicateCommand = oCommand;
				assert.ok(oControlVariantDuplicateCommand, "control variant duplicate command exists for element");
				return oControlVariantDuplicateCommand.execute();
			})
			.then(function() {
				oDuplicateVariant = oControlVariantDuplicateCommand.getVariantChange();
				aPreparedChanges = oControlVariantDuplicateCommand.getPreparedChange();
				assert.equal(aPreparedChanges.length, 3, "then the prepared changes are available");
				assert.ok(fnCreateDefaultFileNameSpy.calledWith("Copy"), "then Copy appended to the fileName of the duplicate variant");
				assert.notEqual(oDuplicateVariant.getId().indexOf("_Copy"), -1, "then fileName correctly duplicated");
				assert.equal(oDuplicateVariant.getVariantReference(), this.oVariant.content.variantReference, "then variant reference correctly duplicated");
				assert.equal(oDuplicateVariant.getTitle(), "variant A" + " Copy", "then variant reference correctly duplicated");
				assert.equal(oDuplicateVariant.getControlChanges().length, 2, "then 2 changes duplicated");
				assert.equal(oDuplicateVariant.getControlChanges()[0].support.sourceChangeFileName, this.oVariant.controlChanges[0].fileName, "then changes duplicated with source filenames in Change.support.sourceChangeFileName");
				assert.equal(oControlVariantDuplicateCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 3, "then 3 dirty changes present - variant and 2 changes");
				return oControlVariantDuplicateCommand.undo();
			}.bind(this))
			.then( function() {
				oDuplicateVariant = oControlVariantDuplicateCommand.getVariantChange();
				aPreparedChanges = oControlVariantDuplicateCommand.getPreparedChange();
				assert.notOk(aPreparedChanges, "then no prepared changes are available after undo");
				assert.equal(oControlVariantDuplicateCommand.oModel.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "then all dirty changes removed");
				assert.notOk(oDuplicateVariant, "then duplicate variant from command unset");
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
