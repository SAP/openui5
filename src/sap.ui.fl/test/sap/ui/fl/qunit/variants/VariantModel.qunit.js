/* global QUnit */

sap.ui.define([
	"sap/m/App",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Change",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function(
	App,
	VariantModel,
	VariantManagement,
	Utils,
	Layer,
	LayerUtils,
	Change,
	FlexControllerFactory,
	Reverter,
	URLHandler,
	ChangesController,
	JsControlTreeModifier,
	BusyIndicator,
	UIComponent,
	ComponentContainer,
	XMLView,
	FlexState,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	sinon.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
	sinon.stub(BusyIndicator, "show");
	sinon.stub(BusyIndicator, "hide");
	var oDummyControl = {
		attachManage: sandbox.stub(),
		detachManage: sandbox.stub(),
		openManagementDialog: sandbox.stub()
	};

	QUnit.module("Given an instance of VariantModel", {
		before: function() {
			return FlexState.initialize({
				reference: "MyComponent",
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			});
		},
		beforeEach: function() {
			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
			var oManifest = new sap.ui.core.Manifest(oManifestObj);

			this.oComponent = {
				name: "MyComponent",
				appVersion: "1.2.3",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function() {
					return oManifest;
				},
				getLocalId: function() {}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
			sandbox.stub(Utils, "getComponentClassName").returns(this.oComponent.name);
			sandbox.stub(URLHandler, "attachHandlers");
			sandbox.stub(FlexState, "getVariantsState").returns({});

			this.oFlexController = FlexControllerFactory.createForControl(this.oComponent, oManifest);
			this.oData = {
				variantMgmtId1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: this.oFlexController._oChangePersistence._oVariantController.DEFAULT_AUTHOR,
							key: "variantMgmtId1",
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true
						}, {
							author: "Me",
							key: "variant0",
							layer: Layer.CUSTOMER,
							title: "variant A",
							favorite: true,
							visible: true
						}, {
							author: "Me",
							key: "variant1",
							layer: Layer.CUSTOMER,
							title: "variant B",
							favorite: false,
							visible: true
						}
					]
				}
			};

			this.fnRevertChangesStub = sandbox.stub(Reverter, "revertMultipleChanges").resolves();
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "applyVariantChanges").resolves();
			sandbox.spy(URLHandler, "initialize");
			sandbox.spy(this.oFlexController._oChangePersistence._oVariantController, "assignResetMapListener");
			sandbox.stub(this.oFlexController._oChangePersistence._oVariantController, "fillVariantModel").returns(this.oData);
			this.oModel = new VariantModel({}, this.oFlexController, this.oComponent);
			this.fnLoadSwitchChangesStub = sandbox.stub(this.oModel.oChangePersistence, "loadSwitchChangesMapForComponent").returns({changesToBeReverted:[], changesToBeApplied:[]});
		},
		afterEach: function() {
			sandbox.restore();
			this.oModel.destroy();
			delete this.oFlexController;
		},
		after: function() {
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when initializing a variant model instance", function(assert) {
			assert.ok(URLHandler.initialize.calledOnce, "then URLHandler.initialize() called once");
			assert.ok(URLHandler.initialize.calledWith({model: this.oModel}), "then URLHandler.initialize() called with the the VariantModel");
		});

		QUnit.test("when listener for variant controller map reset is called", function(assert) {
			var aRevertChanges = ["revertMockChange"];
			var sVariantManagementReference = "variantMgmtId1";
			sandbox.stub(URLHandler, "update");
			this.fnLoadSwitchChangesStub.returns({
				changesToBeReverted: aRevertChanges
			});

			var fnResetListener = this.oModel.oVariantController.assignResetMapListener.getCall(0).args[0];
			assert.ok(typeof fnResetListener === "function", "then a listener function was assigned to variant controller map reset");
			return fnResetListener().then(function () {
				assert.ok(this.fnRevertChangesStub.calledWith(aRevertChanges, {
					appComponent: this.oComponent,
					modifier: JsControlTreeModifier,
					flexController: this.oFlexController
				}), "then current variant changes were reverted");
				assert.ok(URLHandler.update.calledWith({
					parameters: [],
					updateHashEntry: true,
					model: this.oModel
				}), "then hash register was reset");
				assert.strictEqual(this.oData[sVariantManagementReference].variants.length, 1, "then only one variant exists after reset");
				assert.strictEqual(this.oData[sVariantManagementReference].variants[0].key, sVariantManagementReference, "then the only variant existing is standard variant");
			}.bind(this));
		});

		QUnit.test("when calling 'getData'", function(assert) {
			var sExpectedJSON = '{"variantMgmtId1":{"currentVariant":"variant1","defaultVariant":"variant1","originalCurrentVariant":"variant1","originalDefaultVariant":"variant1","variants":[{"author":"' + this.oModel.oVariantController.DEFAULT_AUTHOR + '","favorite":true,"key":"variantMgmtId1","layer":"VENDOR","originalFavorite":true,"originalTitle":"Standard","originalVisible":true,"title":"Standard","visible":true},{"author":"Me","favorite":true,"key":"variant0","layer":"' + Layer.CUSTOMER + '","originalFavorite":true,"originalTitle":"variant A","originalVisible":true,"title":"variant A","visible":true},{"author":"Me","favorite":false,"key":"variant1","layer":"' + Layer.CUSTOMER + '","originalFavorite":false,"originalTitle":"variant B","originalVisible":true,"title":"variant B","visible":true}]}}';
			var sCurrentVariant = this.oModel.getCurrentVariantReference("variantMgmtId1");
			assert.deepEqual(this.oModel.getData(), JSON.parse(sExpectedJSON));
			assert.equal(sCurrentVariant, "variant1", "then the key of the current variant is returned");
		});

		QUnit.test("when calling 'setModelPropertiesForControl'", function(assert) {
			this.oModel.getData()["variantMgmtId1"]._isEditable = true;
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, true, "the parameter variantsEditable is initially true");
			this.oModel.setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable is set to false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, true, "the parameter variantsEditable is set to true for bDesignTimeMode = false");
		});

		QUnit.test("when calling 'setModelPropertiesForControl' and variant management control has property editable=false", function(assert) {
			this.oModel.getData()["variantMgmtId1"]._isEditable = false;
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable is initially false");
			this.oModel.setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable stays false for bDesignTimeMode = true");
			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable stays false for bDesignTimeMode = false");
		});

		QUnit.test("when calling 'setModelPropertiesForControl' with updateVariantInURL = true", function(assert) {
			assert.expect(8);
			this.oModel.getData()["variantMgmtId1"]._isEditable = true;
			this.oModel.getData()["variantMgmtId1"].updateVariantInURL = true;
			this.oModel.getData()["variantMgmtId1"].currentVariant = "variant0";
			var iUpdateCallCount = 0;
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				var mExpectedParameters = {
					parameters:	[],
					updateURL: true,
					updateHashEntry: false,
					model: this.oModel
				};

				if (iUpdateCallCount === 1) {
					// second URLHandler.update() call with designTime mode being set from true -> false
					mExpectedParameters.parameters = ["currentHash1", "currentHash2"];
				}
				assert.strictEqual(mPropertyBag.model._bDesignTimeMode, iUpdateCallCount === 0, "then model's _bDesignTime property was set before URLHandler.update() was called");

				assert.deepEqual(mPropertyBag, mExpectedParameters, "then URLHandler.update() called with the correct parameters");
				iUpdateCallCount++;
			}.bind(this));
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["currentHash1", "currentHash2"]);

			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");
			assert.strictEqual(this.oModel._bDesignTimeMode, false, "the model's _bDesignTimeMode property is initially false");

			this.oModel.setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 0, "then URLHandler.getStoredHashParams() not called");

			this.oModel.setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
			assert.strictEqual(URLHandler.getStoredHashParams.callCount, 1, "then URLHandler.getStoredHashParams() called once");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a current variant reference", function(assert) {
			var done = assert.async();
			this.oData["variantMgmtId1"].currentVariant = "variant0";
			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(
				function (sVariantManagementReference, sVariantReference) {
					return Promise.resolve().then(function () {
						if (sVariantManagementReference === "variantMgmtId1" && sVariantReference === this.oData["variantMgmtId1"].defaultVariant) {
							assert.ok(true, "then the correct variant management and variant references were passed to VariantModel.updateCurrentVariant");
						} else {
							assert.notOk(true, "then the correct variant management and variant references were not passed to VariantModel.updateCurrentVariant");
						}
						done();
					}.bind(this));
				}.bind(this)
			);
			this.oModel.switchToDefaultForVariant("variant0");
		});

		QUnit.test("when calling 'switchToDefaultForVariant' for a variant reference which is not the current variant", function(assert) {
			sandbox.stub(this.oModel, "updateCurrentVariant").returns(Promise.resolve());
			this.oModel.switchToDefaultForVariant("variant0");
			assert.strictEqual(this.oModel.updateCurrentVariant.callCount, 0, "then VariantModel.updateCurrentVariant not called");
		});


		QUnit.test("when calling 'switchToDefaultForVariant' without a variant reference", function(assert) {
			var done = assert.async();
			this.oData["dummy"] = {
				defaultVariant: "dummyDefaultVariant",
				currentVariant: "dummyCurrentVariant"
			};
			// currentVariant and defaultVariant should be different
			this.oData["variantMgmtId1"].currentVariant = "mockCurrentVariant";

			var aVariantManagementReferences = ["variantMgmtId1", "dummy"];

			sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(
				function (sVariantManagementReference, sVariantReference) {
					return Promise.resolve().then(function () {
						var iIndex = aVariantManagementReferences.indexOf(sVariantManagementReference);
						if (sVariantManagementReference === aVariantManagementReferences[iIndex] && sVariantReference === this.oData[aVariantManagementReferences[iIndex]].defaultVariant) {
							assert.ok(true, "then for variant management reference " + sVariantManagementReference + "  default variant is passed to VariantModel.updateCurrentVariant");
							aVariantManagementReferences.splice(iIndex, 1);
						} else {
							assert.notOk(true, "then variant management reference and default variant were not passed to VariantModel.updateCurrentVariant");
						}
						if (aVariantManagementReferences.length === 0) {
							done();
						}
					}.bind(this));
				}.bind(this)
			);
			this.oModel.switchToDefaultForVariant();
		});

		QUnit.test("when calling 'switchToDefaultForVariantManagement' for a variant management reference", function(assert) {
			// currentVariant and defaultVariant should be different
			this.oData["variantMgmtId1"].currentVariant = "mockCurrentVariant";
			sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			this.oModel.switchToDefaultForVariantManagement("variantMgmtId1");
			assert.ok(this.oModel.updateCurrentVariant.calledOnceWithExactly("variantMgmtId1", this.oData["variantMgmtId1"].defaultVariant),
				"then VariantModel.updateCurrentVariant called once with the correct parameters");
		});

		QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
			var mVariantManagementReference = this.oModel.getVariantManagementReference("variant1");
			assert.deepEqual(mVariantManagementReference, {
				variantIndex: 2,
				variantManagementReference: "variantMgmtId1"
			}, "then the correct variant management reference is returned");
		});

		QUnit.test("when calling 'getVariantProperty' with title as property", function(assert) {
			sandbox.stub(this.oModel.oVariantController, "getVariant").returns(
				{
					content:
					{
						content: {
							title: this.oData["variantMgmtId1"].variants[2].title
						}
					}
				}
			);
			var sPropertyValue = this.oModel.getVariantProperty("variant1", "title");
			assert.equal(sPropertyValue, this.oData["variantMgmtId1"].variants[2].title, "then the correct title value is returned");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setTitle' to add a change", function(assert) {
			var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType : "setTitle",
				title : "New Title",
				layer : Layer.CUSTOMER,
				variantReference : "variant1",
				appComponent : this.oComponent
			};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, true);
			assert.equal(oChange.getText("title"), mPropertyBag.title, "then the new change created with the new title");
			assert.equal(oChange.getChangeType(), "setTitle", "then the new change created with 'setTitle' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].title, mPropertyBag.title, "then the new title updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.calledOnce, "then '_setVariantData' of VariantController called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setTitle' to delete a change", function(assert) {
			var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType : "setTitle",
				title : "Old Title",
				variantReference : "variant1",
				change : fnChangeStub()
			};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, false);
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].title, mPropertyBag.title, "then the new title updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.callCount, 0, "then '_setVariantData' of VariantController not called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setFavorite' to add a change", function(assert) {
			var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType : "setFavorite",
				favorite : false,
				layer : Layer.CUSTOMER,
				variantReference : "variant1",
				appComponent : this.oComponent
			};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, true);
			assert.equal(oChange.getContent().favorite, mPropertyBag.favorite, "then the new change created with the parameter 'favorite' in content");
			assert.equal(oChange.getChangeType(), "setFavorite", "then the new change created with 'setFavorite' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].favorite, mPropertyBag.favorite, "then the parameter 'favorite' updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.calledOnce, "then '_setVariantData' of VariantController called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setFavorite' to delete a change", function(assert) {
			var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType : "setFavorite",
				favorite : true,
				variantReference : "variant1",
				change : fnChangeStub()
			};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, false);
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].favorite, mPropertyBag.favorite, "then the parameter 'favorite' updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.callCount, 0, "then '_setVariantData' of VariantController not called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setVisible' to add a change", function(assert) {
			var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType : "setVisible",
				visible : false,
				layer : Layer.CUSTOMER,
				variantReference : "variant1",
				appComponent : this.oComponent
			};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, true);
			assert.equal(oChange.getContent().visible, mPropertyBag.visible, "then the new change created with the parameter 'visible' in content");
			assert.equal(oChange.getChangeType(), "setVisible", "then the new change created with 'setVisible' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].visible, mPropertyBag.visible, "then the parameter 'visible' updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.calledOnce, "then '_setVariantData' of VariantController called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setVisible' to delete a change", function(assert) {
			var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType : "setVisible",
				visible : true,
				variantReference : "variant1",
				change : fnChangeStub()
			};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, false);
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].visible, mPropertyBag.visible, "then the parameter 'visible' updated in the VariantModel");
			assert.ok(fnSetVariantDataStub.callCount, 0, "then '_setVariantData' of VariantController not called");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' to add a change", function(assert) {
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnAddDirtyChangeStub = sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			var mPropertyBag = {
				changeType : "setDefault",
				defaultVariant : "variant0",
				layer : Layer.CUSTOMER,
				variantManagementReference : "variantMgmtId1",
				appComponent : this.oComponent
			};
			this.oModel.oVariantController._mVariantManagement = {};
			this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, true);
			assert.equal(oChange.getContent().defaultVariant, mPropertyBag.defaultVariant, "then the new change created with the parameter 'visible' in content");
			assert.equal(oChange.getChangeType(), "setDefault", "then the new change created with 'setDefault' as changeType");
			assert.equal(oChange.getFileType(), "ctrl_variant_management_change", "then the new change created with 'ctrl_variant_change' as fileType");
			assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' to delete a change", function(assert) {
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var mPropertyBag = {
				changeType : "setDefault",
				defaultVariant : "variant1",
				variantManagementReference : "variantMgmtId1",
				change : fnChangeStub()
			};
			this.oModel.oVariantController._mVariantManagement = {};
			this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, false);
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' to delete a change while current variant is not the default variant", function(assert) {
			var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var fnUpdateCurrentVariantStub = sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
			var mPropertyBag = {
				changeType : "setDefault",
				defaultVariant : "variant0",
				variantManagementReference : "variantMgmtId1",
				change : fnChangeStub()
			};
			this.oModel.oVariantController._mVariantManagement = {};
			this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

			var oChange = this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, false);
			assert.ok(fnUpdateCurrentVariantStub.calledOnce, "then 'updateCurrentVariant' called");
			assert.notOk(oChange, "then no change returned");
			assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
			assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
			assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with different current and default variants, in UI adaptation mode", function(assert) {
			var mPropertyBag = {
				changeType : "setDefault",
				defaultVariant : "variant1",
				layer : Layer.CUSTOMER,
				variantManagementReference : "variantMgmtId1",
				appComponent : this.oComponent,
				change : { getDefinition : function() {} }
			};
			sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			sandbox.stub(URLHandler, "getStoredHashParams").returns([]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode true
			this.oModel._bDesignTimeMode = true;

			// mock current variant id to make it different
			this.oModel.oData["variantMgmtId1"].currentVariant = "variantCurrent";

			// mock variant controller data
			this.oModel.oVariantController._mVariantManagement = {};
			this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

			this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, true);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [this.oModel.oData["variantMgmtId1"].currentVariant],
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				model: this.oModel
			}), "then the URLHandler.update() called with the current variant id as a parameter in UI adaptation mode");
		});

		QUnit.test("when calling 'setVariantProperties' for 'setDefault' with same current and default variants, in personalization mode", function(assert) {
			var mPropertyBag = {
				changeType : "setDefault",
				defaultVariant : "variant1",
				layer : Layer.CUSTOMER,
				variantManagementReference : "variantMgmtId1",
				appComponent : this.oComponent,
				change : { getDefinition : function() {} }
			};
			sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
			// current variant already exists in hash parameters
			sandbox.stub(URLHandler, "getStoredHashParams").returns([this.oData["variantMgmtId1"].currentVariant]);
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange");
			sandbox.stub(URLHandler, "update");

			// set adaptation mode false
			this.oModel._bDesignTimeMode = false;

			// mock variant controller data
			this.oModel.oVariantController._mVariantManagement = {};
			this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

			this.oModel.setVariantProperties("variantMgmtId1", mPropertyBag, true);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [],
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				model: this.oModel
			}), "then the URLHandler.update() called without the current variant id as a parameter in personalization mode");
		});

		QUnit.test("when calling 'updateCurrentVariant' with root app component", function(assert) {
			var fnUpdateCurrentVariantInMapStub = sandbox.stub(this.oModel.oVariantController, "updateCurrentVariantInMap");
			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");

			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant is variant1");
			assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant1", "then initially original current variant is variant1");

			this.oModel.oData["variantMgmtId1"].updateVariantInURL = true;
			return this.oModel.updateCurrentVariant("variantMgmtId1", "variant0", this.oModel.oAppComponent)
			.then(function() {
				assert.ok(this.fnLoadSwitchChangesStub.calledWith({
					variantManagementReference: "variantMgmtId1",
					currentVariantReference: "variant1",
					newVariantReference: "variant0"
				}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
				assert.ok(oSetVariantSwitchPromiseStub.calledBefore(this.fnRevertChangesStub), "the promise was first set");
				assert.ok(this.fnLoadSwitchChangesStub.calledOnce, "then loadSwitchChangesMapForComponent called once from ChangePersitence");
				assert.ok(this.fnRevertChangesStub.calledOnce, "then revertMultipleChanges called once in FlexController");
				assert.ok(this.fnApplyChangesStub.calledOnce, "then applyVariantChanges called once in FlexController");
				assert.ok(fnUpdateCurrentVariantInMapStub.calledWith("variantMgmtId1", "variant0"), "then variantController.updateCurrentVariantInMap called with the right parameters");
				assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant0", "then current variant updated to variant0");
				assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then original current variant updated to variant0");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' without a root app component", function(assert) {
			var fnUpdateCurrentVariantInMapStub = sandbox.stub(this.oModel.oVariantController, "updateCurrentVariantInMap");
			var oReturnObject = {};

			this.oModel.oData["variantMgmtId1"].updateVariantInURL = true;
			this.fnLoadSwitchChangesStub.returns(oReturnObject);
			return this.oModel.updateCurrentVariant("variantMgmtId1", "variant0")
				.then(function() {
					assert.ok(this.fnLoadSwitchChangesStub.calledWith({
						variantManagementReference: "variantMgmtId1",
						currentVariantReference: "variant1",
						newVariantReference: "variant0"
					}), "then ChangePersistence.loadSwitchChangesMapForComponent() called with correct parameters");
					assert.deepEqual(this.fnRevertChangesStub.getCall(0).args[1].appComponent, this.oComponent, "then revertMultipleChanges called in FlexController with the correct component");
					assert.deepEqual(this.fnApplyChangesStub.getCall(0).args[1], this.oComponent, "then applyVariantChanges called in FlexController with the correct component");
					assert.ok(fnUpdateCurrentVariantInMapStub.calledWith("variantMgmtId1", "variant0"), "then variantController.updateCurrentVariantInMap called with the right parameters");
				}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' with dirty changes in current variant", function(assert) {
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges");

			this.oModel.oData["variantMgmtId1"].modified = true;
			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant is variant1");
			return this.oModel.updateCurrentVariant("variantMgmtId1", "variant0")
			.then(function() {
				assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then original current variant updated to variant0");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be finished", function(assert) {
			sandbox.stub(this.oModel.oVariantController, "updateCurrentVariantInMap");
			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant is variant1");
			assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant1", "then initially original current variant is variant1");

			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");
			Reverter.revertMultipleChanges.restore();
			var oRevertChangesStub = sandbox.stub(Reverter, "revertMultipleChanges")
			.onCall(0).returns(new Promise(function(resolve) {
				setTimeout(function() {
					resolve();
				}, 0);
			}))
			.onCall(1).resolves();
			this.oModel.updateCurrentVariant("variantMgmtId1", "variant2", this.oModel.oAppComponent);
			return this.oModel.updateCurrentVariant("variantMgmtId1", "variant0", this.oModel.oAppComponent)
			.then(this.oModel._oVariantSwitchPromise)
			.then(function() {
				assert.ok(true, "the internal promise '_oVariantSwitchPromise' is resolved");
				assert.equal(this.fnLoadSwitchChangesStub.callCount, 2, "then loadSwitchChangesMapForComponent called twice from ChangePersitence");
				assert.equal(oRevertChangesStub.callCount, 2, "then revertMultipleChanges called twice in FlexController");
				assert.equal(oSetVariantSwitchPromiseStub.callCount, 2, "then oSetVariantSwitchPromiseStub called twice in FlexController");
				assert.equal(this.fnApplyChangesStub.callCount, 2, "then applyVariantChanges called twice in FlexController");
				assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant0", "then current variant updated to variant0");
				assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then original current variant updated to variant0");
			}.bind(this));
		});

		QUnit.test("when calling 'updateCurrentVariant' twice without waiting for the first one to be failed and finished", function(assert) {
			assert.expect(15);
			var sVMReference = "variantMgmtId1";
			sandbox.stub(this.oModel.oVariantController, "updateCurrentVariantInMap");
			assert.equal(this.oModel.oData[sVMReference].currentVariant, "variant1", "then initially current variant is variant1");
			assert.equal(this.oModel.oData[sVMReference].originalCurrentVariant, "variant1", "then initially original current variant is variant1");

			var oSetVariantSwitchPromiseStub = sandbox.stub(this.oFlexController, "setVariantSwitchPromise");
			Reverter.revertMultipleChanges.restore();

			var fnRejectionStub = sandbox.stub();

			// revert stubs - called during the start of an update call
			var oRevertChangesStub = sandbox.stub(Reverter, "revertMultipleChanges")
				.onCall(0).callsFake(function () {
					assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property was set before the first update call");
					return new Promise(function(resolve, reject) {
						fnRejectionStub.callsFake(reject);
						setTimeout(fnRejectionStub, 0);
					});
				}.bind(this))
				.onCall(1).callsFake(function() {
					assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property was set before the second update call");
					return Promise.resolve();
				}.bind(this));

			// first call
			this.oModel.updateCurrentVariant(sVMReference, "variant2", this.oModel.oAppComponent)
				.catch(function() {
					assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, false, "then 'variantBusy' property was unset after the first update call was rejected");
					assert.ok(true, "then the first promise was rejected");
				}.bind(this));

			// second call
			return this.oModel.updateCurrentVariant(sVMReference, "variant0", this.oModel.oAppComponent)
				.then(function () {
					assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, false, "then 'variantBusy' property was unset after the second update call was resolved");
					assert.ok(fnRejectionStub.calledOnce, "then the first promise was rejected");
					assert.ok(true, "the internal promise '_oVariantSwitchPromise' is resolved");
					assert.equal(this.fnLoadSwitchChangesStub.callCount, 2, "then loadSwitchChangesMapForComponent called twice from ChangePersitence");
					assert.equal(oRevertChangesStub.callCount, 2, "then Reverter.revertMultipleChanges() was called twice");
					assert.equal(oSetVariantSwitchPromiseStub.callCount, 2, "then oSetVariantSwitchPromiseStub called twice in FlexController");
					assert.equal(this.fnApplyChangesStub.callCount, 1, "then applyVariantChanges called only for the first call");
					assert.equal(this.oModel.oData[sVMReference].currentVariant, "variant0", "then current variant updated to variant0");
					assert.equal(this.oModel.oData[sVMReference].originalCurrentVariant, "variant0", "then original current variant updated to variant0");
				}.bind(this));
		});

		QUnit.test("when calling '_duplicateVariant' on the same layer", function(assert) {
			var oSourceVariant = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"variant2",
					content:{
						title:"variant A"
					},
					selector:{},
					layer:Layer.CUSTOMER,
					namespace:"Dummy.Component"
				},
				controlChanges: [],
				variantChanges: {}
			};

			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.CUSTOMER,
				title: "variant A Copy"
			};

			var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
			oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
			oSourceVariantCopy.content.fileName = "newVariant";
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns([]);
			sandbox.stub(LayerUtils, "compareAgainstCurrentLayer").returns(0);
			sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);
			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.deepEqual(oDuplicateVariant, oSourceVariantCopy);
		});

		QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer referencing variant on VENDOR layer", function(assert) {
			var oSourceVariant = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"variant2",
					content:{
						title:"variant A"
					},
					selector:{},
					layer: Layer.VENDOR,
					namespace:"Dummy.Component"
				},
				controlChanges: [],
				variantChanges: {}
			};

			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.VENDOR,
				title: "variant A Copy"
			};

			var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
			oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
			oSourceVariantCopy.content.fileName = "newVariant";
			oSourceVariantCopy.content.variantReference = "variant0";
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns([]);
			sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);
			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			assert.deepEqual(oDuplicateVariant, oSourceVariantCopy, "then the duplicate variant returned with customized properties");
		});

		QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer with reference to a variant on VENDOR layer with one CUSTOMER and one VENDOR change", function(assert) {
			// non-personalization mode
			this.oModel._bDesignTimeMode = true;
			var oChange0 = new Change({
				fileName: "change0",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.CUSTOMER,
				support: {},
				reference: "test.Component",
				packageName: "MockPackageName"
			});
			var oChange1 = new Change({
				fileName: "change1",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.VENDOR,
				support: {},
				reference: "test.Component"
			});

			var oSourceVariant = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"variant2",
					content:{
						title:"variant A"
					},
					selector:{},
					layer: Layer.VENDOR,
					namespace:"Dummy.Component"
				},
				controlChanges: [oChange0, oChange1],
				variantChanges: {}
			};

			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.VENDOR,
				title: "variant A Copy"
			};

			var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
			oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
			oSourceVariantCopy.content.fileName = "newVariant";
			oSourceVariantCopy.content.variantReference = "variant0";

			sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns(oSourceVariant.controlChanges);
			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);

			assert.deepEqual(oDuplicateVariant.content, oSourceVariantCopy.content, "then the duplicate variant returned with customized properties");
			assert.equal(oDuplicateVariant.controlChanges.length, 1, "then only one change duplicated");
			assert.equal(oDuplicateVariant.controlChanges[0].getDefinition().variantReference, "newVariant", "then the change has the correct variantReference");
			assert.equal(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, oSourceVariant.controlChanges[0].getDefinition().fileName, "then the fileName of the origin change is written to support object");
			assert.equal(oDuplicateVariant.controlChanges[0].getLayer(), LayerUtils.getCurrentLayer(), "then only the change with the same layer is duplicated");
			assert.equal(oDuplicateVariant.controlChanges[0].getPackage(), "$TMP", "then the package name of the duplicate change was set to $TMP");
			assert.equal(oDuplicateVariant.content.variantReference, oSourceVariant.content.fileName, "then the duplicate variant has reference to the source variant from VENDOR layer");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer with reference to a variant on VENDOR layer with one USER, one CUSTOMER, one VENDOR change", function(assert) {
			LayerUtils.getCurrentLayer.restore();
			var oChange0 = new Change({
				fileName: "change0",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.USER,
				support: {},
				reference: "test.Component"
			});
			var oChange1 = new Change({
				fileName: "change1",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.CUSTOMER,
				support: {},
				reference: "test.Component"
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {id: "abc123"},
				variantReference: "variant0",
				layer: Layer.VENDOR,
				support: {},
				reference: "test.Component"
			});

			var oSourceVariant = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"variant2",
					content:{
						title:"variant A"
					},
					selector:{},
					layer: Layer.VENDOR,
					namespace:"Dummy.Component"
				},
				controlChanges: [oChange0, oChange1, oChange2],
				variantChanges: {}
			};

			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.VENDOR,
				title: "variant A Copy"
			};

			var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
			oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
			oSourceVariantCopy.content.fileName = "newVariant";
			oSourceVariantCopy.content.variantReference = "variant0";

			sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns(oSourceVariant.controlChanges);
			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);

			assert.deepEqual(oDuplicateVariant.content, oSourceVariantCopy.content, "then the duplicate variant returned with customized properties");
			assert.equal(oDuplicateVariant.controlChanges.length, 1, "then only one change duplicated");
			assert.equal(oDuplicateVariant.controlChanges[0].getDefinition().variantReference, "newVariant", "then the change has the correct variantReference");
			assert.equal(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, oSourceVariant.controlChanges[0].getDefinition().fileName, "then the fileName of the origin change is written to support object");
			assert.equal(oDuplicateVariant.controlChanges[0].getLayer(), LayerUtils.getCurrentLayer(true), "then only the change with the same layer is duplicated");
			assert.equal(oDuplicateVariant.content.variantReference, oSourceVariant.content.fileName, "then the duplicate variant has reference to the source variant from VENDOR layer");
			sinon.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
		});

		QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer with reference to a variant with no layer", function(assert) {
			var oSourceVariant = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"variant0",
					content:{
						title:"variant A"
					},
					selector:{},
					namespace:"Dummy.Component"
				},
				controlChanges: [],
				variantChanges: {}
			};

			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.CUSTOMER,
				title: "variant A Copy"
			};

			sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns([]);
			sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
			oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
			oSourceVariantCopy.content.fileName = "newVariant";
			oSourceVariantCopy.content.layer = Layer.CUSTOMER;

			assert.deepEqual(oDuplicateVariant, oSourceVariantCopy, "then the duplicate variant returned with customized properties");
		});

		QUnit.test("when calling '_duplicateVariant' from USER layer with reference to a variant with no layer", function(assert) {
			LayerUtils.getCurrentLayer.restore();
			var oSourceVariant = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"variant0",
					content:{
						title:"variant A"
					},
					selector:{},
					namespace:"Dummy.Component"
				},
				controlChanges: [],
				variantChanges: {}
			};

			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.USER,
				title: "variant A Copy"
			};

			sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns([]);
			sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);

			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
			var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
			oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
			oSourceVariantCopy.content.fileName = "newVariant";
			oSourceVariantCopy.content.layer = Layer.USER;

			assert.deepEqual(oDuplicateVariant, oSourceVariantCopy, "then the duplicate variant returned with customized properties");
			sinon.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
		});

		QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer with reference to a variant on the same layer", function(assert) {
			// non-personalization mode
			this.oModel._bDesignTimeMode = true;
			var oChange0 = new Change({fileName:"change0", selector: {id: "abc123"}, variantReference:"variant0", layer: Layer.CUSTOMER, support: {}, reference: "test.Component"});
			var oChange1 = new Change({fileName:"change1", selector: {id: "abc123"}, variantReference:"variant0", layer: Layer.CUSTOMER, support: {}, reference: "test.Component"});

			var oSourceVariant = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"variant2",
					content:{
						title:"variant A"
					},
					selector:{},
					layer:Layer.CUSTOMER,
					namespace:"Dummy.Component"
				},
				controlChanges: [oChange0, oChange1],
				variantChanges: {}
			};

			var mPropertyBag = {
				newVariantReference: "newVariant",
				sourceVariantReference: "variant0",
				variantManagementReference: "variantMgmtId1",
				layer: Layer.CUSTOMER,
				title: "variant A Copy"
			};

			sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns(oSourceVariant.controlChanges);

			var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
			oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
			oSourceVariantCopy.content.fileName = "newVariant";
			var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);

			assert.deepEqual(oDuplicateVariant.content, oSourceVariantCopy.content, "then the duplicate variant returned with customized properties");
			assert.equal(oDuplicateVariant.controlChanges.length, 2, "then both changes duplicated");
			assert.equal(oDuplicateVariant.controlChanges[0].getDefinition().variantReference, "newVariant", "then the change has the correct variantReference");
			assert.equal(oDuplicateVariant.controlChanges[1].getDefinition().variantReference, "newVariant", "then the change has the correct variantReference");
			assert.equal(oDuplicateVariant.controlChanges[0].getDefinition().support.sourceChangeFileName, oChange0.getDefinition().fileName, "then first duplicate variant change's support.sourceChangeFileName property set to source change's fileName");
			assert.equal(oDuplicateVariant.controlChanges[1].getDefinition().support.sourceChangeFileName, oChange1.getDefinition().fileName, "then second duplicate variant change's support.sourceChangeFileName property set to source change's fileName");
			assert.equal(oDuplicateVariant.content.variantReference, oSourceVariant.content.variantReference, "then the duplicate variant references to the reference of the source variant");
		});

		QUnit.test("when calling '_ensureStandardVariantExists'", function(assert) {
			var oVariantControllerContent = {
				variants: [{
					content: {
						fileName: "mockVariantManagement",
						fileType: "ctrl_variant",
						variantManagementReference: "mockVariantManagement",
						variantReference: "",
						content: {
							title: "Standard",
							favorite: true,
							visible: true
						},
						support: {
							user: this.oModel.oVariantController.DEFAULT_AUTHOR
						}
					},
					controlChanges: [],
					variantChanges: {}
				}
			],
				defaultVariant: "mockVariantManagement",
				variantManagementChanges: {}
			};

			var oVariantModelResponse = {
				currentVariant: "mockVariantManagement",
				originalCurrentVariant: "mockVariantManagement",
				defaultVariant: "mockVariantManagement",
				originalDefaultVariant: "mockVariantManagement",
				variants: [{
					key: "mockVariantManagement",
					title: "Standard",
					originalTitle: "Standard",
					favorite: true,
					originalFavorite: true,
					visible: true,
					originalVisible: true,
					author: this.oModel.oVariantController.DEFAULT_AUTHOR
				}]
			};

			this.oModel.setData({});
			this.oModel._ensureStandardVariantExists("mockVariantManagement");

			assert.deepEqual(this.oModel.oData["mockVariantManagement"], oVariantModelResponse, "then standard variant entry created for variant model");
			assert.deepEqual(this.oModel.oVariantController._mVariantManagement["mockVariantManagement"], oVariantControllerContent, "then standard variant entry created for variant controller");
		});

		QUnit.test("when calling 'copyVariant'", function(assert) {
			var fnAddVariantToControllerStub = sandbox.stub(this.oModel.oVariantController, "addVariantToVariantManagement").returns(3);
			var oVariantData = {
				content: {
					fileName:"variant0",
					fileType:"ctrl_variant",
					variantManagementReference:"variantMgmtId1",
					variantReference:"",
					reference:"Dummy.Component",
					packageName:"$TMP",
					content:{
						title:"variant A"
					},
					layer:Layer.CUSTOMER,
					texts:{
						TextDemo: {
							value: "Text for TextDemo",
							type: "myTextType"
						}
					},
					namespace:"Dummy.Component",
					creation:"",
					originalLanguage:"EN",
					conditions:{},
					support:{
						generator:"Change.createInitialFileContent",
						service:"",
						user:""
					}
				},
				controlChanges: [],
				variantChanges: {}
			};
			sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
			sandbox.stub(JsControlTreeModifier, "getSelector").returns({id: "variantMgmtId1"});
			sandbox.stub(this.oModel.oChangePersistence, "addDirtyChange").returnsArg(0);

			var mPropertyBag = {
				variantManagementReference: "variantMgmtId1",
				appComponent: this.oComponent
			};
			return this.oModel.copyVariant(mPropertyBag).then(function (aChanges) {
				var oVariantDefinition = aChanges[0].getDefinitionWithChanges();

				assert.ok(fnAddVariantToControllerStub.calledOnce, "then function to add variant to VariantController called");

				//Mocking properties set inside Variant.createInitialFileContent
				oVariantData.content.support.sapui5Version = sap.ui.version;
				oVariantData.content.self = oVariantData.content.namespace + oVariantData.content.fileName + "." + "ctrl_variant";

				assert.deepEqual(oVariantDefinition, oVariantData, "then ctrl_variant change prepared with the correct content");

				// mocking "visible" and "favorite" property only required in VariantController map
				oVariantDefinition.content.content.visible = true;
				oVariantDefinition.content.content.favorite = true;

				assert.ok(fnAddVariantToControllerStub.calledWith(oVariantDefinition), "then function to add variant to VariantController called with the correct parameters");
				assert.equal(this.oModel.oData["variantMgmtId1"].variants[3].key, oVariantData.content.fileName, "then variant added to VariantModel");
				assert.equal(aChanges[0].getId(), oVariantData.content.fileName, "then the returned variant is the duplicate variant");
			}.bind(this));
		});

		QUnit.test("when calling 'removeVariant' with a component", function(assert) {
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oChangePersistence, "deleteChange");
			var oChangeInVariant = {
				fileName: "change0",
				variantReference: "variant0",
				layer: Layer.VENDOR,
				getId: function () {
					return this.fileName;
				},
				getVariantReference: function() {
					return this.variantReference;
				}
			};
			var oVariant = {
				fileName: "variant0",
				getId: function() {
					return this.fileName;
				}
			};
			var aDummyDirtyChanges = [oVariant].concat(oChangeInVariant);

			var fnRemoveVariantToControllerStub = sandbox.stub(this.oModel.oVariantController, "removeVariantFromVariantManagement").returns(2);
			var fnUpdateCurrentVariantSpy = sandbox.spy(this.oModel, "updateCurrentVariant");
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns(aDummyDirtyChanges);

			assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 3, "then initial length is 3");
			var mPropertyBag = {
				variant: oVariant,
				sourceVariantReference: "sourceVariant",
				variantManagementReference: "variantMgmtId1",
				component: this.oModel.oAppComponent
			};
			return this.oModel.removeVariant(mPropertyBag)
				.then(function () {
					assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 2, "then one variant removed from VariantModel");
					assert.ok(fnRemoveVariantToControllerStub.calledOnce, "then function to remove variant from VariantController called");
					assert.ok(fnUpdateCurrentVariantSpy.calledWith(mPropertyBag.variantManagementReference, mPropertyBag.sourceVariantReference, mPropertyBag.component),
						"then updateCurrentVariant() called with the correct parameters");
					assert.ok(fnDeleteChangeStub.calledTwice, "then ChangePersistence.deleteChange called twice");
					assert.ok(fnDeleteChangeStub.calledWith(oChangeInVariant), "then ChangePersistence.deleteChange called for change in variant");
					assert.ok(fnDeleteChangeStub.calledWith(oVariant), "then ChangePersistence.deleteChange called for variant");
					assert.ok(fnUpdateCurrentVariantSpy.calledBefore(fnRemoveVariantToControllerStub), "then previous variant is reverted before removing the current variant");
				}.bind(this));
		});

		QUnit.test("when calling 'addChange'", function(assert) {
			var fnAddChangeToVariant = sandbox.stub(this.oModel.oVariantController, "addChangeToVariant");
			var oChange = {
				fileName : "addedChange",
				getVariantReference : function () {
					return "variant1";
				}
			};
			this.oModel.oData["variantMgmtId1"].modified = false;
			this.oModel.oData["variantMgmtId1"].variantsEditable = true;
			this.oModel.addChange(oChange);
			assert.equal(this.oModel.oData["variantMgmtId1"].modified, this.oModel.oData["variantMgmtId1"].variantsEditable, "then modified property equals variantEditable property");
			assert.ok(fnAddChangeToVariant.calledOnce, "then VariantController.addChangeToVariant called once");
			assert.ok(fnAddChangeToVariant.calledWith(oChange), "then VariantController.addChangeToVariant called with the passed change");
		});

		QUnit.test("when calling 'collectModelChanges'", function(assert) {
			this.oModel.getData()["variantMgmtId1"].variants[1].title = "test";
			this.oModel.getData()["variantMgmtId1"].variants[1].favorite = false;
			this.oModel.getData()["variantMgmtId1"].variants[1].visible = false;
			this.oModel.getData()["variantMgmtId1"].defaultVariant = "variant0";

			var aChanges = this.oModel.collectModelChanges("variantMgmtId1", Layer.CUSTOMER);
			assert.equal(aChanges.length, 4, "then 4 changes with mPropertyBags were created");
		});

		QUnit.test("when calling 'manageVariants' in Adaptation mode once with changes and then without changes", function(assert) {
			var sVariantManagementReference = "variantMgmtId1";
			var oVariantManagement = new VariantManagement(sVariantManagementReference);
			var sLayer = Layer.CUSTOMER;
			oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			sandbox.stub(oVariantManagement, "openManagementDialog").callsFake(oVariantManagement.fireManage);
			sandbox.stub(this.oModel.oChangePersistence._oVariantController, "_setVariantData");
			sandbox.stub(this.oModel.oChangePersistence._oVariantController, "_updateChangesForVariantManagementInMap");

			this.oModel.setModelPropertiesForControl(sVariantManagementReference, true, oVariantManagement);

			this.oModel.getData()[sVariantManagementReference].variants[1].title = "test";
			this.oModel.getData()[sVariantManagementReference].variants[1].favorite = false;
			this.oModel.getData()[sVariantManagementReference].variants[1].visible = false;
			this.oModel.getData()[sVariantManagementReference].defaultVariant = "variant0";

			return this.oModel.manageVariants(oVariantManagement, sVariantManagementReference, sLayer).then(function(aChanges) {
				assert.equal(aChanges.length, 4, "then 4 changes were returned since changes were made in the manage dialog");
				aChanges.forEach(this.oModel.setVariantProperties.bind(this.oModel, sVariantManagementReference));
				return this.oModel.manageVariants(oVariantManagement, sVariantManagementReference, sLayer).then(function(aChanges) {
					assert.equal(aChanges.length, 0, "then no changes were returned the since no changes were made in the manage dialog");
					oVariantManagement.destroy();
				});
			}.bind(this));
		});

		QUnit.test("when calling '_initializeManageVariantsEvents'", function(assert) {
			assert.notOk(this.oModel.fnManageClick, "the function 'this.fnManageClick' is not available before");
			assert.notOk(this.oModel.fnManageClickRta, "the function 'this.fnManageClickRta' is not available before");
			this.oModel._initializeManageVariantsEvents();
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
			assert.ok(this.oModel.fnManageClick, "the function 'this.fnManageClick' is available afterwards");
		});

		QUnit.test("when calling '_handleSave' with parameter from SaveAs button and default box checked", function(assert) {
			var done = assert.async();
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = new Change({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oCopiedVariantContent = {
				content: {
					title: "Personalization Test Variant",
					variantManagementReference: sVMReference,
					variantReference: "variant1",
					layer: Layer.USER
				}
			};
			var oCopiedVariant = new sap.ui.fl.Variant(oCopiedVariantContent);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: false,
						name: "Test",
						def: true
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel.getData()[sVMReference].modified = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges")
				.callThrough()
				.withArgs(sVMReference, this.oModel.oData[sVMReference].currentVariant, true)
				.returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oVariantController, "removeChangeFromVariant");
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oFlexController, "deleteChange");
			var fnCopyVariantStub = sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties").returns({fileName: "changeWithSetDefault"});
			var fnSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();
			var fnCreateDefaultFileNameSpy = sandbox.spy(Utils, "createDefaultFileName");

			return this.oModel._handleSave(oEvent)
			.then(function() {
				var sNewVariantReference = fnCreateDefaultFileNameSpy.getCall(0).returnValue;
				assert.strictEqual(fnCreateDefaultFileNameSpy.getCall(0).args.length, 0, "then no argument was passed to sap.ui.fl.Utils.createDefaultFileName");
				assert.ok(fnCopyVariantStub.calledOnce, "CopyVariant is called");
				assert.ok(fnCopyVariantStub.calledWith({
					appComponent: this.oComponent,
					layer: LayerUtils.getCurrentLayer(),
					newVariantReference: sNewVariantReference,
					sourceVariantReference: oCopiedVariant.getVariantReference(),
					title: "Test",
					variantManagementReference: sVMReference
				}), "CopyVariant is called");

				assert.ok(fnSetVariantPropertiesStub.calledOnce, "SetVariantProperties is called");
				assert.ok(fnSaveDirtyChangesStub.calledOnce, "SaveDirtyChanges is called");
				assert.equal(fnSaveDirtyChangesStub.args[0][1].length, 5, "five dirty changes are saved (new variant, 3 copied ctrl changes, setDefault change");
				assert.equal(fnSaveDirtyChangesStub.args[0][1][4].fileName, "changeWithSetDefault", "the last change is 'setDefault'");
				assert.notOk(this.oModel.getData()[sVMReference].modified, "finally the model property 'modified' is set to false");
				assert.ok(fnDeleteChangeStub.calledBefore(fnSaveDirtyChangesStub), "the changes were deleted from default variant before the copied variant is saved");
				[oChange1, oChange2, oChange3].forEach(function (oDirtyChange) {
					assert.ok(this.oModel.oVariantController.removeChangeFromVariant.calledWith(oDirtyChange, oCopiedVariantContent.content.variantManagementReference, oCopiedVariantContent.content.variantReference), "then dirty changes were removed from the source variant");
					assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComponent), "then dirty changes from source variant were deleted from the persistence");
				}.bind(this));
				oVariantManagement.destroy();
				done();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSave' with parameter from SaveAs button and default box unchecked", function(assert) {
			var done = assert.async();
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});
			var oChange3 = new Change({
				fileName: "change3",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oCopiedVariantContent = {
				content: {
					title: "Personalization Test Variant",
					variantManagementReference: sVMReference,
					variantReference: "variant1",
					layer: Layer.USER
				}
			};
			var oCopiedVariant = new sap.ui.fl.Variant(oCopiedVariantContent);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: false,
						name: "Test",
						def: false
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel.getData()[sVMReference].modified = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges")
				.callThrough()
				.withArgs(sVMReference, this.oModel.oData[sVMReference].currentVariant, true)
				.returns([oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, oChange1, oChange2, oChange3]);
			sandbox.stub(this.oModel.oVariantController, "removeChangeFromVariant");
			var fnDeleteChangeStub = sandbox.stub(this.oModel.oFlexController, "deleteChange");
			var fnCopyVariantStub = sandbox.stub(this.oModel, "copyVariant").resolves([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
			var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			var fnSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();

			return this.oModel._handleSave(oEvent).then(function() {
				assert.ok(fnCopyVariantStub.calledOnce, "CopyVariant is called");
				assert.equal(fnSetVariantPropertiesStub.callCount, 0, "SetVariantProperties is not called");
				assert.ok(fnSaveDirtyChangesStub.calledOnce, "SaveDirtyChanges is called");
				assert.notOk(this.oModel.getData()[sVMReference].modified, "finally the model property 'modified' is set to false");
				assert.ok(fnDeleteChangeStub.calledBefore(fnSaveDirtyChangesStub), "the changes were deleted from default variant before the copied variant is saved");
				[oChange1, oChange2, oChange3].forEach(function (oDirtyChange) {
					assert.ok(this.oModel.oVariantController.removeChangeFromVariant.calledWith(oDirtyChange, oCopiedVariantContent.content.variantManagementReference, oCopiedVariantContent.content.variantReference), "then dirty changes were removed from the source variant");
					assert.ok(this.oModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComponent), "then dirty changes from source variant were deleted from the persistence");
				}.bind(this));
				oVariantManagement.destroy();
				done();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSave' with parameter from Save button, which calls 'checkDirtyStateForControlModels' later, with no dirty changes existing after Save", function(assert) {
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});
			var oChange2 = new Change({
				fileName: "change2",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: true,
						name: "Test"
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel.getData()[sVMReference].modified = true;

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges")
				.callThrough()
				.withArgs(sVMReference, this.oModel.oData[sVMReference].currentVariant, true)
				.returns([oChange1, oChange2]);
			var fnCopyVariantStub = sandbox.stub(this.oModel, "copyVariant");
			var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			var fnSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();
			// only when getting it for the first time, second time they are asked when already saved
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges")
				.callThrough()
				.onFirstCall().returns([oChange1, oChange2]);

			return this.oModel._handleSave(oEvent).then(function() {
				assert.equal(fnCopyVariantStub.callCount, 0, "CopyVariant is not called");
				assert.equal(fnSetVariantPropertiesStub.callCount, 0, "SetVariantProperties is not called");
				assert.ok(fnSaveDirtyChangesStub.calledOnce, "SaveAll is called");
				assert.notOk(this.oModel.getData()[sVMReference].modified, "finally the model property 'modified' is set to false");
				oVariantManagement.destroy();
			}.bind(this));
		});

		QUnit.test("when calling '_handleSave' with parameter from Save button, which calls 'checkDirtyStateForControlModels' later, with dirty changes still existing after Save", function(assert) {
			var sVMReference = "variantMgmtId1";
			var oChange1 = new Change({
				fileName: "change1",
				selector: {
					id: "abc123"
				}
			});

			var oVariantManagement = new VariantManagement(sVMReference);
			var oEvent = {
				getParameters: function() {
					return {
						overwrite: true,
						name: "Test"
					};
				},
				getSource: function() {
					return oVariantManagement;
				}
			};

			this.oModel.getData()[sVMReference].modified = true; // dirty changes exist

			sandbox.stub(this.oModel, "getLocalId").returns(sVMReference);
			sandbox.stub(this.oModel.oVariantController, "getVariantChanges")
				.callThrough()
				.withArgs(sVMReference, this.oModel.oData[sVMReference].currentVariant, true)
				.returns([oChange1]);
			var fnCopyVariantStub = sandbox.stub(this.oModel, "copyVariant");
			var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "setVariantProperties");
			var fnSaveDirtyChangesStub = sandbox.stub(this.oModel.oChangePersistence, "saveDirtyChanges").resolves();
			// dirty changes always present are not saved
			sandbox.stub(this.oModel.oChangePersistence, "getDirtyChanges").returns([oChange1]);

			return this.oModel._handleSave(oEvent).then(function() {
				assert.equal(fnCopyVariantStub.callCount, 0, "CopyVariant is not called");
				assert.equal(fnSetVariantPropertiesStub.callCount, 0, "SetVariantProperties is not called");
				assert.ok(fnSaveDirtyChangesStub.calledOnce, "SaveAll is called");
				assert.ok(this.oModel.getData()[sVMReference].modified, "the model property 'modified' is still set to true");
				oVariantManagement.destroy();
			}.bind(this));
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 2 occurrences", function(assert) {
			this.oModel.oData["variantMgmtId1"].variants.push({
				title: "SampleTitle Copy(5)",
				visible: true
			}, {
				title: "SampleTitle Copy(5)",
				visible: true
			});
			assert.strictEqual(this.oModel._getVariantTitleCount("SampleTitle Copy(5)", "variantMgmtId1"), 2, "then 2 occurrences returned");
			this.oModel.oData["variantMgmtId1"].variants.splice(3, 1);
		});

		QUnit.test("when calling '_getVariantTitleCount' with a title having 4 occurrences with different cases of characters", function(assert) {
			this.oModel.oData["variantMgmtId1"].variants.push({
				title: "Test",
				visible: true
			}, {
				title: "TEST",
				visible: true
			}, {
				title: "tesT",
				visible: true
			}, {
				title: "test",
				visible: true
			});
			assert.strictEqual(this.oModel._getVariantTitleCount("TeSt", "variantMgmtId1"), 4, "then 4 occurrences returned");
			this.oModel.oData["variantMgmtId1"].variants.splice(3, 4);
		});

		QUnit.test("when calling 'getVariant' without a variant management reference", function(assert) {
			sandbox.stub(this.oModel.oVariantController, "getVariant").callsFake(function() {
				assert.ok(this.oModel.getVariantManagementReference.calledOnce, "then variant management reference calculated");
				assert.equal(arguments[0], "varMgmtRef", "then correct variant management reference received");
				assert.equal(arguments[1], "varRef", "then correct variant reference received");
			}.bind(this));
			sandbox.stub(this.oModel, "getVariantManagementReference").returns({
				variantManagementReference: "varMgmtRef"
			});
			this.oModel.getVariant("varRef");
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called to get all current variant references", function(assert) {
			this.oData = {
				variantManagementRef1: {
					currentVariant: "currentVariantRef1"
				},
				variantManagementRef2: {
					currentVariant: "currentVariantRef2"
				}
			};
			this.oModel.setData(this.oData);
			assert.deepEqual(
				this.oModel.getCurrentControlVariantIds(),
				[this.oData["variantManagementRef1"]["currentVariant"], this.oData["variantManagementRef2"]["currentVariant"]],
				"then the function returns an array current variant references"
			);
		});

		QUnit.test("when 'getCurrentControlVariantIds' is called with no variant model data", function(assert) {
			this.oModel.setData({});
			assert.deepEqual(this.oModel.getCurrentControlVariantIds(), [], "then the function returns an empty array");
		});
	});

	QUnit.module("Given a VariantModel with no data and a VariantManagement control", {
		before: function() {
			return FlexState.initialize({
				reference: "MyComponent",
				componentId: "RTADemoAppMD",
				componentData: {},
				manifest: {}
			});
		},
		beforeEach : function() {
			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
			var oManifest = new sap.ui.core.Manifest(oManifestObj);
			this.oVariantManagement = new VariantManagement("varMgmtRef1");
			var oComponent = {
				name: "MyComponent",
				appVersion: "1.2.3",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifest: function() {
					return oManifest;
				},
				getLocalId: function(sId) {
					if (sId === this.oVariantManagement.getId()) {
						return "localId";
					}
					return null;
				}.bind(this)
			};

			sandbox.stub(Utils, "getComponentClassName").returns("MyComponent");
			sandbox.stub(FlexState, "getVariantsState").returns({});
			this.fnGetAppComponentForControlStub = sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			this.oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
			this.fnRevertChangesStub = sandbox.stub(Reverter, "revertMultipleChanges").resolves();
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "applyVariantChanges").resolves();
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "saveSequenceOfDirtyChanges").resolves();
			this.oRegisterControlStub = sandbox.stub(URLHandler, "registerControl");

			sandbox.stub(this.oFlexController._oChangePersistence._oVariantController, "fillVariantModel").returns(this.oData);
			sandbox.stub(this.oFlexController._oChangePersistence._oVariantController, "loadInitialChanges").returns([]);

			this.oModel = new VariantModel({}, this.oFlexController, oComponent);
			this.fnLoadSwitchChangesStub = sandbox.stub(this.oModel.oChangePersistence, "loadSwitchChangesMapForComponent").returns({aRevert:[], aNew:[]});
		},
		afterEach : function() {
			sandbox.restore();
			this.oModel.destroy();
			this.oVariantManagement.destroy();
			delete this.oFlexController;
		},
		after: function () {
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when calling 'setModel' of VariantManagement control", function(assert) {
			var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
			sandbox.stub(this.oModel, "getVariantManagementReferenceForControl").returns("varMgmtRef1");
			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			assert.equal(this.oModel.getCurrentVariantReference("varMgmtRef1"), "varMgmtRef1", "then the Current Variant is set to the standard variant");
			assert.ok(fnRegisterToModelSpy.calledOnce, "then registerToModel called once, when VariantManagement control setModel is called");
			assert.ok(fnRegisterToModelSpy.calledWith(this.oVariantManagement), "then registerToModel called with VariantManagement control");
		});

		QUnit.test("when variant management controls are initialized with with 'updateVariantInURL' property set and default (false)", function(assert) {
			this.oRegisterControlStub.resetHistory();
			var oVariantManagementWithURLUpdate = new VariantManagement("varMgmtRef2", {updateVariantInURL: true});
			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			oVariantManagementWithURLUpdate.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			assert.deepEqual(this.oRegisterControlStub.getCall(0).args[0], {vmReference: this.oModel.oAppComponent.getLocalId(this.oVariantManagement.getId()), updateURL: false, model: this.oModel}, "then URLHandler.attachHandlers was called once for a control to update URL");
			assert.deepEqual(this.oRegisterControlStub.getCall(1).args[0], {vmReference:oVariantManagementWithURLUpdate.getId(), updateURL: true, model: this.oModel}, "then URLHandler.attachHandlers was called once for a control without URL update");
			oVariantManagementWithURLUpdate.destroy();
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control where app component couldn't be retrieved", function(assert) {
			this.fnGetAppComponentForControlStub.returns(null);
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement), this.oVariantManagement.getId(), "then control's id is returned");
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with no app component prefix", function(assert) {
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl({getId: function() { return "mockControl"; }}), "mockControl", "then control's id is returned");
		});

		QUnit.test("when calling 'getVariantManagementReferenceForControl' with a variant management control with an app component prefix", function(assert) {
			assert.strictEqual(this.oModel.getVariantManagementReferenceForControl(this.oVariantManagement), "localId", "then the local id of the control is retuned");
		});

		QUnit.test("when 'save' event event is triggered from a variant management control for a new variant, when variant model is busy", function(assert) {
			var done = assert.async();
			var fnSwitchPromiseStub = sandbox.stub();

			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.ok(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0][0].getTitle(), "variant created title", "then the required variant change was saved");
					done();
				}.bind(this));
			}.bind(this));

			// set variant model busy
			this.oModel._oVariantSwitchPromise = new Promise(function(resolve) {
				fnSwitchPromiseStub.callsFake(function() {
					resolve();
				});
				setTimeout(fnSwitchPromiseStub, 0);
			});

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});

		QUnit.test("when 'save' event is triggered from a variant management control for an existing variant, when variant model is busy", function(assert) {
			var done = assert.async();
			var sVMReference = "localId";
			var fnSwitchPromiseStub = sandbox.stub();

			var oDirtyChange1 = new Change({fileName: "newChange1"});
			var oDirtyChange2 = new Change({fileName: "newChange2"});
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange1);
			this.oFlexController._oChangePersistence.addDirtyChange(oDirtyChange2);

			sandbox.stub(this.oModel.oVariantController, "getVariantChanges")
				.callThrough()
				.withArgs(sVMReference, sVMReference, true)
				.returns([oDirtyChange1, oDirtyChange2]);

			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			this.oVariantManagement.attachEventOnce("save", function() {
				this.oModel._oVariantSwitchPromise.then(function() {
					// resolved when variant model is not busy anymore
					assert.ok(fnSwitchPromiseStub.calledOnce, "then first the previous variant switch was performed completely");
					assert.deepEqual(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0], [oDirtyChange1, oDirtyChange2], "then the control changes inside the variant were saved");
					done();
				}.bind(this));
			}.bind(this));

			// set variant model busy
			this.oModel._oVariantSwitchPromise = new Promise(function(resolve) {
				fnSwitchPromiseStub.callsFake(function() {
					resolve();
				});
				setTimeout(fnSwitchPromiseStub, 0);
			});
			this.oVariantManagement.fireSave({
				overwrite: true,
				def: false
			});
		});

		QUnit.test("when 'save' event is triggered from a variant management control for a new variant, with another update variant call being triggered in parallel", function(assert) {
			var done = assert.async();
			assert.expect(4);
			var sVMReference = "localId";

			this.oVariantManagement.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			Reverter.revertMultipleChanges.onFirstCall().callsFake(function() {
				assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property is set");
				// make second update call to set variant model busy, when the first call is still in process
				this.oModel.updateCurrentVariant(sVMReference, sVMReference)
					.then(function() {
						assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, false, "then 'variantBusy' property is unset");
						done();
					}.bind(this));
				return Promise.resolve();
			}.bind(this));

			Reverter.revertMultipleChanges.onSecondCall().callsFake(function() {
				assert.strictEqual(this.oModel.oData[sVMReference].variantBusy, true, "then 'variantBusy' property is set");
				// on second call check if the first call was completed successfully
				assert.ok(this.oFlexController.saveSequenceOfDirtyChanges.getCall(0).args[0][0].getTitle(), "variant created title", "then a variant change was saved before the second update call was executed");
				return Promise.resolve();
			}.bind(this));

			this.oVariantManagement.fireSave({
				name: "variant created title",
				overwrite: false,
				def: false
			});
		});
	});

	QUnit.module("Given a variant management control in personalization mode", {
		before: function() {
			return FlexState.initialize({
				reference: "MockController.Component",
				componentId: "testComponent",
				componentData: {},
				manifest: {}
			});
		},
		beforeEach: function () {
			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							}
						}
					}
				},
				createContent: function () {
					var oView = new XMLView({
						viewName: "sap.ui.test.VariantManagementTestApp",
						id: this.createId("mockview")
					});
					var oApp = new App(oView.createId("mockapp"));
					oApp.addPage(oView);
					return oApp;
				}
			});

			this.oComp = new MockComponent({id: "testComponent"});
			this.oFlexController = ChangesController.getFlexControllerInstance(this.oComp);
			this.oVariantModel = new VariantModel({}, this.oFlexController, this.oComp);
			this.oComp.setModel(this.oVariantModel, Utils.VARIANT_MODEL_NAME);
			this.sVMReference = "mockview--VariantManagement1";

			var oData = {};
			oData[this.sVMReference] = {
				defaultVariant: "variant0",
				originalDefaultVariant: "variant0",
				currentVariant: "variant0",
				originalCurrentVariant: "variant0",
				variants: [
					{
						author: this.oFlexController._oChangePersistence._oVariantController.DEFAULT_AUTHOR,
						key: this.sVMReference,
						layer: Layer.VENDOR,
						title: "Standard",
						favorite: true,
						visible: true
					}, {
						author: "Me",
						key: "variant0",
						layer: Layer.CUSTOMER,
						title: "variant A",
						favorite: true,
						visible: true
					}
				]
			};
			sandbox.stub(this.oVariantModel, "updateCurrentVariant").resolves();
			sandbox.stub(this.oVariantModel.oVariantController, "removeChangeFromVariant");
			sandbox.stub(this.oVariantModel.oVariantController, "getVariantChanges");
			sandbox.stub(this.oVariantModel.oFlexController, "deleteChange");
			sandbox.stub(this.oVariantModel.oChangePersistence, "getDirtyChanges");
			sandbox.stub(Reverter, "revertMultipleChanges").resolves();

			this.oVariantModel.setData(oData);
			this.oVariantModel.checkUpdate(true);

			this.oCompContainer = new ComponentContainer("sap-ui-static", {
				component: this.oComp
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			sandbox.restore();
			this.oCompContainer.destroy();
		},
		after: function() {
			FlexState.clearState();
		}
	}, function() {
		function clickOnVMControl(oVMControl) {
			// to create variant list control - inside variant management control's popover
			oVMControl.getDomRef().click();
		}

		function makeSelection(oVMControl, iIndex) {
			var oVariantListControl = oVMControl.oVariantPopOver.getContent()[0].getContent()[0];
			var oSelectedItem = oVariantListControl.getItems()[iIndex];
			oVariantListControl.fireItemPress({
				item: oSelectedItem
			});
		}

		function selectTargetVariant(oVMControl, iIndex) {
			// variant management control popover
			if (oVMControl.oVariantPopOver && oVMControl.oVariantPopOver.isOpen()) {
				makeSelection(oVMControl, iIndex);
			} else {
				oVMControl.oVariantPopOver.attachEventOnce("afterOpen", makeSelection.bind(null, oVMControl, iIndex));
			}
		}

		QUnit.test("when the control is switched to a new variant with no unsaved personalization changes", function (assert) {
			var done = assert.async();
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = sap.ui.getCore().byId(sVMControlId);

			oVMControl.attachEventOnce("select", function(oEvent) {
				var sSelectedVariantReference = oEvent.getParameters().key;
				this.oVariantModel.updateCurrentVariant.onFirstCall().callsFake(function() {
					// update call will make variant model busy, which will be resolved after the whole update process has taken place
					this.oVariantModel._oVariantSwitchPromise.then(function() {
						assert.ok(this.oVariantModel.updateCurrentVariant.calledWith(sSelectedVariantReference, this.sVMReference, this.oComp, true), "then variant switch was performed");
						assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");
						assert.ok(this.oVariantModel.oVariantController.removeChangeFromVariant.notCalled, "then dirty changes were not removed from the source variant");
						assert.ok(this.oVariantModel.oFlexController.deleteChange.notCalled, "then no dirty changes were deleted");
						done();
					}.bind(this));
					return Promise.resolve();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to a new variant with unsaved personalization changes", function (assert) {
			var done = assert.async();
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = sap.ui.getCore().byId(sVMControlId);
			var sSourceVariantId = this.oVariantModel.oData[this.sVMReference].currentVariant;

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [new Change({fileName: "dirtyChange1"}), new Change({fileName: "dirtyChange2"})];
			this.oVariantModel.oVariantController.getVariantChanges.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function(oEvent) {
				var sTargetVariantId = oEvent.getParameters().key;
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.ok(this.oVariantModel.updateCurrentVariant.calledWith(sTargetVariantId, this.sVMReference, this.oComp), "then variant switch was performed");
					assert.ok(Reverter.revertMultipleChanges.notCalled, "then variant was not reverted explicitly");
					assert.strictEqual(this.oVariantModel.oData[this.sVMReference].modified, false);

					aMockDirtyChanges.forEach(function (oDirtyChange) {
						assert.ok(this.oVariantModel.oVariantController.removeChangeFromVariant.calledWith(oDirtyChange, this.sVMReference, sSourceVariantId), "then a dirty change was removed from the variant");
						assert.ok(this.oVariantModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComp), "then a dirty change was deleted from the persistence");
					}.bind(this));

					done();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 0);
		});

		QUnit.test("when the control is switched to the same variant with no unsaved personalization changes", function (assert) {
			var done = assert.async();
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = sap.ui.getCore().byId(sVMControlId);

			var aMockDirtyChanges = [new Change({fileName: "dirtyChange1"}), new Change({fileName: "dirtyChange2"})];
			this.oVariantModel.oVariantController.getVariantChanges.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function() {
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					assert.ok(this.oVariantModel.oVariantController.removeChangeFromVariant.notCalled, "then dirty changes were not removed from the variant");
					assert.ok(this.oVariantModel.oFlexController.deleteChange.notCalled, "then dirty changes were not deleted from the persistence");
					done();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
		});

		QUnit.test("when the control is switched to the same variant with unsaved personalization changes", function (assert) {
			var done = assert.async();
			var sVMControlId = this.oComp.createId(this.sVMReference);
			var oVMControl = sap.ui.getCore().byId(sVMControlId);

			this.oVariantModel.oData[this.sVMReference].modified = true;
			var aMockDirtyChanges = [new Change({fileName: "dirtyChange1"}), new Change({fileName: "dirtyChange2"})];
			this.oVariantModel.oVariantController.getVariantChanges.returns(aMockDirtyChanges);
			this.oVariantModel.oChangePersistence.getDirtyChanges.returns(aMockDirtyChanges);

			// when new item is selected from the variants list
			oVMControl.attachEventOnce("select", function(oEvent) {
				var sTargetVariantId = oEvent.getParameters().key;
				this.oVariantModel._oVariantSwitchPromise.then(function() {
					assert.ok(this.oVariantModel.updateCurrentVariant.notCalled, "then variant switch was not performed");
					assert.ok(Reverter.revertMultipleChanges.calledWith(aMockDirtyChanges, {
						appComponent: this.oComp,
						modifier: JsControlTreeModifier,
						flexController: this.oFlexController
					}), "then variant was reverted");
					assert.strictEqual(this.oVariantModel.oData[this.sVMReference].modified, false);

					aMockDirtyChanges.forEach(function (oDirtyChange) {
						assert.ok(this.oVariantModel.oVariantController.removeChangeFromVariant.calledWith(oDirtyChange, this.sVMReference, sTargetVariantId), "then a dirty change was removed from the variant");
						assert.ok(this.oVariantModel.oFlexController.deleteChange.calledWith(oDirtyChange, this.oComp), "then a dirty change was deleted from the persistence");
					}.bind(this));

					done();
				}.bind(this));
			}.bind(this));

			clickOnVMControl(oVMControl);

			selectTargetVariant(oVMControl, 1);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});