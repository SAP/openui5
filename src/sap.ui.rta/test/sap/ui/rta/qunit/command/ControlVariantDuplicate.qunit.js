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
	"sap/ui/fl/variants/VariantController",
	"test-resources/sap/ui/fl/qunit/write/test/TestChangesUtil",
	"sap/ui/thirdparty/sinon-4",
	// needs to be included so that the ElementOverlay prototype is enhanced
	"sap/ui/rta/plugin/ControlVariant"

],
function (
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
	VariantController,
	TestChangesUtil,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a variant management control ...", {
		before: function () {
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
				reference: "Dummy.Component"
			});
			var oChange2 = new Change({
				fileName: "change45",
				layer: Layer.CUSTOMER,
				selector: {
					id: "abc123"
				},
				reference: "Dummy.Component"
			});

			this.oVariant = {
				content: {
					fileName:"variant0",
					content: {
						title:"variant A"
					},
					layer: Layer.CUSTOMER,
					variantReference:"variant00",
					support:{
						user:"Me"
					},
					reference: "Dummy.Component"
				},
				controlChanges : [oChange1, oChange2]
			};

			this.oGetCurrentLayerStub = sinon.stub(FlLayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
			sinon.stub(VariantController.prototype, "getVariantChanges").returns([oChange1, oChange2]);
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
			var mFlexSettings = {layer: Layer.CUSTOMER};
			var oControlVariantDuplicateCommand;
			var oDuplicateVariant;
			var aPreparedChanges;
			var iDirtyChangesCount;
			return CommandFactory.getCommandFor(this.oVariantManagement, "duplicate", {
				sourceVariantReference: this.oVariant.content.variantReference,
				newVariantTitle: "variant A Copy"
			}, oDesignTimeMetadata, mFlexSettings)
				.then(function (oCommand) {
					oControlVariantDuplicateCommand = oCommand;
					assert.ok(oControlVariantDuplicateCommand, "control variant duplicate command exists for element");
					return oControlVariantDuplicateCommand.execute();
				})
				.then(function () {
					oDuplicateVariant = oControlVariantDuplicateCommand.getVariantChange();
					aPreparedChanges = oControlVariantDuplicateCommand.getPreparedChange();
					assert.equal(aPreparedChanges.length, 3, "then the prepared changes are available");
					assert.strictEqual(fnCreateDefaultFileNameSpy.callCount, 3, "then sap.ui.fl.Utils.createDefaultFileName() called thrice; once for variant duplicate and twice for the copied changes");
					assert.strictEqual(fnCreateDefaultFileNameSpy.returnValues[0], oDuplicateVariant.getId(), "then the duplicated variant has the correct ID");
					assert.equal(oDuplicateVariant.getVariantReference(), this.oVariant.content.variantReference, "then variant reference correctly duplicated");
					assert.equal(oDuplicateVariant.getTitle(), "variant A" + " Copy", "then variant reference correctly duplicated");
					assert.equal(oDuplicateVariant.getControlChanges().length, 2, "then 2 changes duplicated");
					assert.equal(oDuplicateVariant.getControlChanges()[0].getDefinition().support.sourceChangeFileName, this.oVariant.controlChanges[0].getDefinition().fileName, "then changes duplicated with source filenames in Change.support.sourceChangeFileName");
					iDirtyChangesCount = TestChangesUtil.getDirtyChanges({selector: this.oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 3, "then there are three dirty changes in the flex persistence");
					return oControlVariantDuplicateCommand.undo();
				}.bind(this))
				.then(function () {
					oDuplicateVariant = oControlVariantDuplicateCommand.getVariantChange();
					aPreparedChanges = oControlVariantDuplicateCommand.getPreparedChange();
					assert.notOk(aPreparedChanges, "then no prepared changes are available after undo");
					iDirtyChangesCount = TestChangesUtil.getDirtyChanges({selector: this.oMockedAppComponent}).length;
					assert.strictEqual(iDirtyChangesCount, 0, "then there are no dirty changes in the flex persistence");
					assert.notOk(oDuplicateVariant, "then duplicate variant from command unset");
					assert.notOk(oControlVariantDuplicateCommand._oVariantChange, "then _oVariantChange property was unset for the command");
					return oControlVariantDuplicateCommand.undo();
				}.bind(this))
				.then(function () {
					assert.ok(true, "then by default a Promise.resolve() is returned on undo(), even if no changes exist for the command");
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
