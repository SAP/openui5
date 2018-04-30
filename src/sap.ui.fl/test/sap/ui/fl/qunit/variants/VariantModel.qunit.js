/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/variants/VariantController",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/core/util/reflection/BaseTreeModifier",
	"sap/ui/fl/variants/util/VariantUtil",
	"sap/ui/thirdparty/sinon-4"
],
function(
	VariantController,
	VariantModel,
	VariantManagement,
	Utils,
	FlexControllerFactory,
	BaseTreeModifier,
	VariantUtil,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER");
	var oDummyControl = {
		attachManage: sandbox.stub(),
		detachManage: sandbox.stub(),
		openManagementDialog: sandbox.stub()
	};

	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function(assert) {
			this.oData = {
				"variantMgmtId1": {
					"defaultVariant": "variant1",
					"originalDefaultVariant": "variant1",
					"variants": [
						{
							"author": "SAP",
							"key": "variantMgmtId1",
							"layer": "VENDOR",
							"title": "Standard",
							"favorite": true,
							"visible": true
						}, {
							"author": "Me",
							"key": "variant0",
							"layer": "CUSTOMER",
							"title": "variant A",
							"favorite": true,
							"visible": true
						}, {
							"author": "Me",
							"key": "variant1",
							"layer": "CUSTOMER",
							"title": "variant B",
							"favorite": false,
							"visible": true
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
			var oManifest = new sap.ui.core.Manifest(oManifestObj);

			this.oComponent = {
				name: "MyComponent",
				appVersion: "1.2.3",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifestObject: function() {
					return oManifest;
				}
			};
			sandbox.stub(Utils, "getComponentClassName").returns("MyComponent");

			this.oFlexController = FlexControllerFactory.createForControl(this.oComponent, oManifest);
			this.fnLoadSwitchChangesStub = sandbox.stub(this.oFlexController._oChangePersistence, "loadSwitchChangesMapForComponent").returns({aRevert:[], aNew:[]});
			this.fnRevertChangesStub = sandbox.stub(this.oFlexController, "revertChangesOnControl");
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "applyVariantChanges");
			this.fnDeleteChangeStub = sandbox.stub(this.oFlexController, "deleteChange");

			sandbox.stub(VariantUtil, "initializeHashRegister");
			this.oModel = new VariantModel(this.oData, this.oFlexController, this.oComponent);
		},
		afterEach: function(assert) {
			sandbox.restore();
			this.oModel.destroy();
			delete this.oFlexController;
		}
	});

	QUnit.test("when initializing a variant model instance", function(assert) {
		assert.ok(VariantUtil.initializeHashRegister.calledOnce, "then VariantUtil.initializeHashRegister() called once");
		assert.ok(VariantUtil.initializeHashRegister.calledOn(this.oModel), "then VariantUtil.initializeHashRegister() called with VariantModel as context");
	});

	QUnit.test("when calling 'getData'", function(assert) {
		var sExpectedJSON = "{\"variantMgmtId1\":{" + "\"defaultVariant\":\"variant1\"," + "\"originalCurrentVariant\": \"variant1\"," + "\"originalDefaultVariant\":\"variant1\"," + "\"variants\":[{" + "\"author\":\"SAP\"," + "\"key\":\"variantMgmtId1\"," + "\"layer\":\"VENDOR\"," + "\"originalFavorite\":true," + "\"originalTitle\":\"Standard\"," + "\"favorite\":true,"  + "\"title\":\"Standard\"," + "\"visible\":true" + "}," + "{" + "\"author\":\"Me\"," + "\"key\":\"variant0\"," + "\"layer\":\"CUSTOMER\"," + "\"originalFavorite\":true,"  + "\"originalTitle\":\"variant A\"," + "\"favorite\":true," + "\"title\":\"variant A\"," + "\"visible\":true" + "}," + "{" + "\"author\":\"Me\"," + "\"key\":\"variant1\"," + "\"layer\":\"CUSTOMER\"," + "\"originalFavorite\":false," + "\"originalTitle\":\"variant B\"," + "\"favorite\":false,"  + "\"title\":\"variant B\"," + "\"visible\":true" + "}]," + "\"currentVariant\":\"variant1\"" + "}" + "}";
		var sCurrentVariant = this.oModel.getCurrentVariantReference("variantMgmtId1");
		assert.deepEqual(this.oModel.getData(), JSON.parse(sExpectedJSON));
		assert.equal(sCurrentVariant, "variant1", "then the key of the current variant is returned");
	});

	QUnit.test("when calling '_setModelPropertiesForControl'", function(assert) {
		this.oModel.getData()["variantMgmtId1"]._isEditable = true;
		this.oModel._setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
		assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, true, "the parameter variantsEditable is initially true");
		this.oModel._setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
		assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable is set to false for bAdaptationMode = true");
		this.oModel._setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
		assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, true, "the parameter variantsEditable is set to true for bAdaptationMode = false");
	});

	QUnit.test("when calling '_setModelPropertiesForControl' and variant management control has property editable=false", function(assert) {
		this.oModel.getData()["variantMgmtId1"]._isEditable = false;
		this.oModel._setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
		assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable is initially false");
		this.oModel._setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
		assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable stays false for bAdaptationMode = true");
		this.oModel._setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
		assert.equal(this.oModel.getData()["variantMgmtId1"].variantsEditable, false, "the parameter variantsEditable stays false for bAdaptationMode = false");
	});

	QUnit.test("when calling '_setModelPropertiesForControl' with updateVariantInURL = true", function(assert) {
		this.oModel.getData()["variantMgmtId1"]._isEditable = true;
		this.oModel.getData()["variantMgmtId1"].updateVariantInURL = true;
		this.oModel.getData()["variantMgmtId1"].currentVariant = "variant0";

		sandbox.stub(this.oModel, "_updateVariantInURL");

		this.oModel._setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
		assert.equal(this.oModel._bAdaptationMode, false, "the property _bAdaptationMode is initially false");
		assert.deepEqual(this.oModel._updateVariantInURL.getCall(0).args, ["variantMgmtId1", "variant0"],
			"then VariantModel._updateVariantInURL() called with the current variant");

		this.oModel._setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
		assert.equal(this.oModel._bAdaptationMode, true, "the property _bAdaptationMode is true when adaptation mode is on");
		assert.deepEqual(this.oModel._updateVariantInURL.getCall(1).args, ["variantMgmtId1", "variant1"],
			"then VariantModel._updateVariantInURL() called with the default variant");

		this.oModel._setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
		assert.equal(this.oModel._bAdaptationMode, false, "the property _bAdaptationMode is set to false when adaptation mode is turned off");

		assert.equal(this.oModel._updateVariantInURL.callCount, 3, "then VariantModel._updateVariantInURL() called 3 times");

	});

	QUnit.test("when calling '_setModelPropertiesForControl' with updateVariantInURL = false", function(assert) {
		this.oModel.getData()["variantMgmtId1"]._isEditable = true;
		this.oModel.getData()["variantMgmtId1"].updateVariantInURL = false;

		var mTechnicalParameters = {};
		sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);
		sandbox.stub(Utils, "getTechnicalParametersForComponent").returns(mTechnicalParameters);

		var fnSetTechnicalURLParameterValuesStub = sandbox.stub(Utils, "setTechnicalURLParameterValues");

		this.oModel._setModelPropertiesForControl("variantMgmtId1", true, oDummyControl);
		this.oModel._setModelPropertiesForControl("variantMgmtId1", false, oDummyControl);
		assert.equal(this.oModel._bAdaptationMode, false, "the property _bAdaptationMode is false when adaptation mode is turned off");
		assert.equal(fnSetTechnicalURLParameterValuesStub.callCount, 0, "but the URL is not modified");
	});

	QUnit.test("when calling 'switchToDefaultVariant' for a current variant reference", function(assert) {
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
		this.oModel.switchToDefaultVariant("variant0");
	});

	QUnit.test("when calling 'switchToDefaultVariant' for a variant reference which is not the current variant", function(assert) {
		sandbox.stub(this.oModel, "updateCurrentVariant");
		this.oModel.switchToDefaultVariant("variant0");
		assert.strictEqual(this.oModel.updateCurrentVariant.callCount, 0, "then VariantModel.updateCurrentVariant not called");
	});


	QUnit.test("when calling 'switchToDefaultVariant' without a variant reference", function(assert) {
		var done = assert.async();
		this.oData["dummy"] = {
			defaultVariant: "dummyDefaultVariant"
		};
		var aVariantManagementReferences = ["variantMgmtId1", "dummy"];
		var i = 0;
		sandbox.stub(this.oModel, "updateCurrentVariant").callsFake(
			function (sVariantManagementReference, sVariantReference) {
				return Promise.resolve().then(function () {
					if (sVariantManagementReference === aVariantManagementReferences[i] && sVariantReference === this.oData[aVariantManagementReferences[i]].defaultVariant) {
						assert.ok(true, "then each for each variant management reference default variant is passed to VariantModel.updateCurrentVariant");
						i++;
					} else {
						assert.notOk(true, "then variant management reference and default variant were not passed to VariantModel.updateCurrentVariant");
					}
					if (i === 1) {
						done();
					}
				}.bind(this));
			}.bind(this)
		);
		this.oModel.switchToDefaultVariant();
	});

	QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
		var mVariantManagementReference = this.oModel.getVariantManagementReference("variant1");
		assert.deepEqual(mVariantManagementReference, {
			"variantIndex": 2,
			"variantManagementReference": "variantMgmtId1"
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

	QUnit.test("when calling '_setVariantProperties' for 'setTitle' to add a change", function(assert) {
		var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnAddDirtyChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "addDirtyChange");
		var mPropertyBag = {
			"changeType" : "setTitle",
			"title" : "New Title",
			"layer" : "CUSTOMER",
			"variantReference" : "variant1",
			"appComponent" : this.oComponent
		};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, true);
		assert.equal(oChange.getText("title"), mPropertyBag.title, "then the new change created with the new title");
		assert.equal(oChange.getChangeType(), "setTitle", "then the new change created with 'setTitle' as changeType");
		assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
		assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].title, mPropertyBag.title, "then the new title updated in the VariantModel");
		assert.ok(fnSetVariantDataStub.calledOnce, "then '_setVariantData' of VariantController called");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling '_setVariantProperties' for 'setTitle' to delete a change", function(assert) {
		var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
		var fnDeleteChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "deleteChange");
		var mPropertyBag = {
			"changeType" : "setTitle",
			"title" : "Old Title",
			"variantReference" : "variant1",
			"change" : fnChangeStub()
		};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, false);
		assert.notOk(oChange, "then no change returned");
		assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].title, mPropertyBag.title, "then the new title updated in the VariantModel");
		assert.ok(fnSetVariantDataStub.callCount, 0, "then '_setVariantData' of VariantController not called");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling '_setVariantProperties' for 'setFavorite' to add a change", function(assert) {
		var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnAddDirtyChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "addDirtyChange");
		var mPropertyBag = {
			"changeType" : "setFavorite",
			"favorite" : false,
			"layer" : "CUSTOMER",
			"variantReference" : "variant1",
			"appComponent" : this.oComponent
		};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, true);
		assert.equal(oChange.getContent().favorite, mPropertyBag.favorite, "then the new change created with the parameter 'favorite' in content");
		assert.equal(oChange.getChangeType(), "setFavorite", "then the new change created with 'setFavorite' as changeType");
		assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
		assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].favorite, mPropertyBag.favorite, "then the parameter 'favorite' updated in the VariantModel");
		assert.ok(fnSetVariantDataStub.calledOnce, "then '_setVariantData' of VariantController called");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling '_setVariantProperties' for 'setFavorite' to delete a change", function(assert) {
		var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
		var fnDeleteChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "deleteChange");
		var mPropertyBag = {
			"changeType" : "setFavorite",
			"favorite" : true,
			"variantReference" : "variant1",
			"change" : fnChangeStub()
		};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, false);
		assert.notOk(oChange, "then no change returned");
		assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].favorite, mPropertyBag.favorite, "then the parameter 'favorite' updated in the VariantModel");
		assert.ok(fnSetVariantDataStub.callCount, 0, "then '_setVariantData' of VariantController not called");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling '_setVariantProperties' for 'setVisible' to add a change", function(assert) {
		var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnAddDirtyChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "addDirtyChange");
		var mPropertyBag = {
			"changeType" : "setVisible",
			"visible" : false,
			"layer" : "CUSTOMER",
			"variantReference" : "variant1",
			"appComponent" : this.oComponent
		};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, true);
		assert.equal(oChange.getContent().visible, mPropertyBag.visible, "then the new change created with the parameter 'visible' in content");
		assert.equal(oChange.getChangeType(), "setVisible", "then the new change created with 'setVisible' as changeType");
		assert.equal(oChange.getFileType(), "ctrl_variant_change", "then the new change created with 'ctrl_variant_change' as fileType");
		assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].visible, mPropertyBag.visible, "then the parameter 'visible' updated in the VariantModel");
		assert.ok(fnSetVariantDataStub.calledOnce, "then '_setVariantData' of VariantController called");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling '_setVariantProperties' for 'setVisible' to delete a change", function(assert) {
		var fnSetVariantDataStub = sandbox.stub(this.oModel.oVariantController, "_setVariantData").returns(1);
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
		var fnDeleteChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "deleteChange");
		var mPropertyBag = {
			"changeType" : "setVisible",
			"visible" : true,
			"variantReference" : "variant1",
			"change" : fnChangeStub()
		};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, false);
		assert.notOk(oChange, "then no change returned");
		assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].variants[1].visible, mPropertyBag.visible, "then the parameter 'visible' updated in the VariantModel");
		assert.ok(fnSetVariantDataStub.callCount, 0, "then '_setVariantData' of VariantController not called");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling '_setVariantProperties' for 'setDefault' to add a change", function(assert) {
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnAddDirtyChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "addDirtyChange");
		var mPropertyBag = {
			"changeType" : "setDefault",
			"defaultVariant" : "variant0",
			"layer" : "CUSTOMER",
			"variantManagementReference" : "variantMgmtId1",
			"appComponent" : this.oComponent
		};
		this.oModel.oVariantController._mVariantManagement = {};
		this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, true);
		assert.equal(oChange.getContent().defaultVariant, mPropertyBag.defaultVariant, "then the new change created with the parameter 'visible' in content");
		assert.equal(oChange.getChangeType(), "setDefault", "then the new change created with 'setDefault' as changeType");
		assert.equal(oChange.getFileType(), "ctrl_variant_management_change", "then the new change created with 'ctrl_variant_change' as fileType");
		assert.ok(fnAddDirtyChangeStub.calledWith(oChange), "then 'FlexController.addDirtyChange called with the newly created change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling '_setVariantProperties' for 'setDefault' to delete a change", function(assert) {
		var fnUpdateChangesForVariantManagementInMap = sandbox.stub(this.oModel.oVariantController, "_updateChangesForVariantManagementInMap").returns(1);
		var fnChangeStub = sandbox.stub().returns({ getDefinition : function() {} });
		var fnDeleteChangeStub = sandbox.stub(this.oFlexController._oChangePersistence, "deleteChange");
		var mPropertyBag = {
				"changeType" : "setDefault",
				"defaultVariant" : "variant1",
				"variantManagementReference" : "variantMgmtId1",
				"change" : fnChangeStub()
			};
		this.oModel.oVariantController._mVariantManagement = {};
		this.oModel.oVariantController._mVariantManagement["variantMgmtId1"] = {defaultVariant : this.oData["variantMgmtId1"].defaultVariant};

		var oChange = this.oModel._setVariantProperties("variantMgmtId1", mPropertyBag, false);
		assert.notOk(oChange, "then no change returned");
		assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change), "then 'FlexController.deleteChange' called with the passed change");
		assert.equal(this.oModel.getData()["variantMgmtId1"].defaultVariant, mPropertyBag.defaultVariant, "then the parameter 'defaultVariant' updated in the VariantModel");
		assert.ok(fnUpdateChangesForVariantManagementInMap.calledOnce, "then '_updateChangesForVariantManagementInMap' of VariantController called");
	});

	QUnit.test("when calling 'updateCurrentVariant'", function(assert) {
		var fnUpdateCurrentVariantInMapStub = sandbox.stub(this.oModel.oVariantController, "updateCurrentVariantInMap");
		assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant is variant1");
		assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant1", "then initially original current variant is variant1");
		this.oModel.oData["variantMgmtId1"].updateVariantInURL = true;
		return this.oModel.updateCurrentVariant("variantMgmtId1", "variant0")
		.then(function() {
			assert.ok(this.fnLoadSwitchChangesStub.calledOnce, "then loadSwitchChangesMapForComponent called once from ChangePersitence");
			assert.ok(this.fnRevertChangesStub.calledOnce, "then revertChangesOnControl called once in FlexController");
			assert.ok(this.fnApplyChangesStub.calledOnce, "then applyVariantChanges called once in FlexController");
			assert.ok(fnUpdateCurrentVariantInMapStub.calledWith("variantMgmtId1", "variant0"), "then variantController.updateCurrentVariantInMap called with the right parameters");
			assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant0", "then current variant updated to variant0");
			assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then original current variant updated to variant0");
		}.bind(this));
	});

	QUnit.test("when calling 'updateCurrentVariant' with dirty changes in current variant", function(assert) {
		var fnRemoveDirtyChangesStub = sandbox.stub(this.oModel, "_removeDirtyChanges");

		this.oModel.oData["variantMgmtId1"].modified = true;
		assert.equal(this.oModel.oData["variantMgmtId1"].currentVariant, "variant1", "then initially current variant is variant1");
		return this.oModel.updateCurrentVariant("variantMgmtId1", "variant0")
		.then(function() {
			assert.ok(fnRemoveDirtyChangesStub.calledOnce, "then '_removeDirtyChanges' called once");
			assert.equal(this.oModel.oData["variantMgmtId1"].originalCurrentVariant, "variant0", "then original current variant updated to variant0");
		}.bind(this));
	});

	QUnit.test("when calling '_updateVariantInURL' with no 'sap-ui-fl-control-variant-id' URL parameter", function(assert) {
		var oParameters = {
			params: {
				"sap-ui-fl-control-variant-id": []
			}
		};

		var aModifiedUrlTechnicalParameters = ["variant0"];

		sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);
		var fnGetParsedURLHashStub = sandbox.stub(Utils, "getParsedURLHash").returns(oParameters);
		var fnUpdateHasherEntryStub = sandbox.stub(this.oModel, "updateHasherEntry");
		var fnGetVariantIndexInURLSpy = sandbox.spy(this.oModel, "getVariantIndexInURL");

		this.oModel._updateVariantInURL("variantMgmtId1", "variant0");
		assert.ok(fnGetParsedURLHashStub.calledOnce, "then url parameters requested once");
		assert.deepEqual(fnGetVariantIndexInURLSpy.returnValues[0], {
			parameters: oParameters.params,
			index: -1
		}, "then VariantModel.getVariantIndexInURL returns the correct parameters and index");
		assert.ok(fnUpdateHasherEntryStub.calledWithExactly({
			parameters: aModifiedUrlTechnicalParameters,
			updateURL: true
		}), "then VariantModel.updateHasherEntry() called with the correct object as parameter");
	});

	QUnit.test("when calling '_updateVariantInURL' with a valid 'sap-ui-fl-control-variant-id' URL parameter for the same variant management", function(assert) {
		var oParameters = {
			params: {
				"sap-ui-fl-control-variant-id": ["Dummy", "variantMgmtId1"]
			}
		};

		var aModifiedUrlTechnicalParameters = ["Dummy", "variant0"];

		sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);
		var fnGetParsedURLHashStub = sandbox.stub(Utils, "getParsedURLHash").returns(oParameters);
		var fnUpdateHasherEntryStub = sandbox.stub(this.oModel, "updateHasherEntry");
		var fnGetVariantIndexInURLSpy = sandbox.spy(this.oModel, "getVariantIndexInURL");

		this.oModel._updateVariantInURL("variantMgmtId1", "variant0");
		assert.ok(fnGetParsedURLHashStub.calledOnce, "then url parameters requested once");
		assert.deepEqual(fnGetVariantIndexInURLSpy.returnValues[0], {
			parameters: oParameters.params,
			index: 1
		}, "then VariantModel.getVariantIndexInURL returns the correct parameters and index");
		assert.ok(fnUpdateHasherEntryStub.calledWithExactly({
			parameters: aModifiedUrlTechnicalParameters,
			updateURL: true
		}), "then VariantModel.updateHasherEntry() called with the correct object as parameter");
	});

	QUnit.test("when calling '_updateVariantInURL' in standalone mode (without a ushell container)", function(assert) {
		var fnGetParsedURLHashStub = sandbox.stub(Utils, "getParsedURLHash").returns({});
		var fnUpdateHasherEntryStub = sandbox.stub(this.oModel, "updateHasherEntry");
		var fnGetVariantIndexInURLSpy = sandbox.spy(this.oModel, "getVariantIndexInURL");

		this.oModel._updateVariantInURL("variantMgmtId1", "variant0");

		assert.ok(fnGetParsedURLHashStub.calledOnce, "then url parameters requested once");
		assert.deepEqual(fnGetVariantIndexInURLSpy.returnValues[0], {
			parameters: undefined,
			index: -1
		}, "then VariantModel.getVariantIndexInURL returns the correct parameters and index");
		assert.strictEqual(fnUpdateHasherEntryStub.callCount, 0, "then VariantModel.updateHasherEntry() not called");
	});

	QUnit.test("when calling '_updateVariantInURL' for the default variant with no 'sap-ui-fl-control-variant-id' URL parameter", function(assert) {
		sandbox.stub(Utils, "getParsedURLHash").returns({
			params: {}
		});
		var fnUpdateHasherEntryStub = sandbox.stub(this.oModel, "updateHasherEntry");

		this.oModel._updateVariantInURL("variantMgmtId1", "variant1"); //default variant

		assert.strictEqual(fnUpdateHasherEntryStub.callCount, 0, "then VariantModel.updateHasherEntry() not called");
	});

	QUnit.test("when calling '_updateVariantInURL' for the default variant with a valid 'sap-ui-fl-control-variant-id' URL parameter for the same variant management", function(assert) {
		sandbox.stub(Utils, "getParsedURLHash").returns({
			params: {
				"sap-ui-fl-control-variant-id": ["Dummy", "variantMgmtId1", "Dummy1"]
			}
		});
		var fnUpdateHasherEntryStub = sandbox.stub(this.oModel, "updateHasherEntry");
		sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);

		this.oModel._updateVariantInURL("variantMgmtId1", "variant1"); //default variant

		assert.ok(fnUpdateHasherEntryStub.calledWith({
			parameters: ["Dummy", "Dummy1"],
			updateURL: true
		}), "then VariantModel.updateHasherEntry() called with the correct object with a parameter list excluding default variant");
	});

	QUnit.test("when calling '_updateVariantInURL' while in adaptation mode and a URL parameter is already present", function(assert) {
		sandbox.stub(Utils, "getParsedURLHash").returns({
			params: {
				"sap-ui-fl-control-variant-id": ["Dummy", "variantMgmtId1", "Dummy1"]
			}
		});
		sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);
		var fnUpdateHasherEntryStub = sandbox.stub(this.oModel, "updateHasherEntry");
		this.oModel._bAdaptationMode = true;

		this.oModel._updateVariantInURL("variantMgmtId1", "variant0");

		assert.ok(fnUpdateHasherEntryStub.calledWith({
			parameters: [],
			updateURL: true
		}), "then VariantModel.updateHasherEntry() called with the correct object with an empty parameter list");
	});

	QUnit.test("when calling '_updateVariantInURL' while in adaptation mode and there is no URL parameter present", function(assert) {
		sandbox.stub(Utils, "getParsedURLHash").returns({
			params: {}
		});
		var fnUpdateHasherEntryStub = sandbox.stub(this.oModel, "updateHasherEntry");
		this.oModel._bAdaptationMode = true;

		this.oModel._updateVariantInURL("variantMgmtId1", "variant0");

		assert.ok(fnUpdateHasherEntryStub.calledWith({
			parameters: [],
			updateURL: true
		}), "then VariantModel.updateHasherEntry() called with the correct object with an empty parameter list");
	});

	QUnit.test("when calling '_removeDirtyChanges'", function(assert) {
		sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
		sandbox.stub(this.oFlexController._oChangePersistence, "getDirtyChanges").returns(
				[{getDefinition: function() {return {fileName: "change2"};}},
				 {getDefinition: function() {return {fileName: "change3"};}},
				 {getDefinition: function() {return {fileName: "change4"};}}]
		);
		sandbox.stub(this.oModel.oVariantController, "removeChangeFromVariant");
		var aChanges = [{fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}];

		this.oModel._removeDirtyChanges(aChanges, "variantMgmtId1", this.oModel.oData["variantMgmtId1"].currentVariant);
		assert.ok(this.fnRevertChangesStub.calledOnce, "then 'revertChangesOnControl' called once");
		assert.equal(this.fnRevertChangesStub.args[0][0].length, 2, "and two changes are dirty and in Variant");
		assert.propEqual(this.fnRevertChangesStub.args[0][0][0].getDefinition(), aChanges[2], "the first change was applied before the second change");
		assert.propEqual(this.fnRevertChangesStub.args[0][0][1].getDefinition(), aChanges[1], "the second change was applied before the first change");
		assert.equal(this.fnDeleteChangeStub.callCount, 2, "and 'deleteChange' called twice (due to 2 changes)");
	});

	QUnit.test("when calling '_duplicateVariant' on the same layer", function(assert) {
		var oSourceVariant = {
			"content": {
				"fileName":"variant0",
				"fileType":"ctrl_variant",
				"variantManagementReference":"variantMgmtId1",
				"variantReference":"variant2",
				"content":{
					"title":"variant A"
				},
				"selector":{},
				"layer":"CUSTOMER",
				"namespace":"Dummy.Component"
			},
			"controlChanges": [],
			"variantChanges": {}
		};

		var mPropertyBag = {
			newVariantReference: "newVariant",
			sourceVariantReference: "variant0",
			variantManagementReference: "variantMgmtId1",
			layer: "CUSTOMER",
			title: "variant A Copy"
		};

		var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
		oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
		oSourceVariantCopy.content.fileName = "newVariant";
		sandbox.stub(Utils, "isLayerAboveCurrentLayer").returns(0);
		sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);
		var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
		assert.deepEqual(oDuplicateVariant, oSourceVariantCopy);
	});

	QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer referencing variant on VENDOR layer", function(assert) {
		var oSourceVariant = {
			"content": {
				"fileName":"variant0",
				"fileType":"ctrl_variant",
				"variantManagementReference":"variantMgmtId1",
				"variantReference":"variant2",
				"content":{
					"title":"variant A"
				},
				"selector":{},
				"layer":"VENDOR",
				"namespace":"Dummy.Component"
			},
			"controlChanges": [],
			"variantChanges": {}
		};

		var mPropertyBag = {
			newVariantReference: "newVariant",
			sourceVariantReference: "variant0",
			variantManagementReference: "variantMgmtId1",
			layer: "VENDOR",
			title: "variant A Copy"
		};

		var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
		oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
		oSourceVariantCopy.content.fileName = "newVariant";
		oSourceVariantCopy.content.variantReference = "variant0";
		sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);
		var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
		assert.deepEqual(oDuplicateVariant, oSourceVariantCopy, "then the duplicate variant returned with customized properties");
	});

	QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer with reference to a variant on VENDOR layer with one CUSTOMER and one VENDOR change", function(assert) {
		var oChangeContent0 = {"fileName":"change0", "variantReference":"variant0", "layer": "CUSTOMER", "support": {}};
		var oChangeContent1 = {"fileName":"change1", "variantReference":"variant0", "layer": "VENDOR", "support": {}};

		var oSourceVariant = {
			"content": {
				"fileName":"variant0",
				"fileType":"ctrl_variant",
				"variantManagementReference":"variantMgmtId1",
				"variantReference":"variant2",
				"content":{
					"title":"variant A"
				},
				"selector":{},
				"layer":"VENDOR",
				"namespace":"Dummy.Component"
			},
			"controlChanges": [oChangeContent0, oChangeContent1],
			"variantChanges": {}
		};

		var mPropertyBag = {
			newVariantReference: "newVariant",
			sourceVariantReference: "variant0",
			variantManagementReference: "variantMgmtId1",
			layer: "VENDOR",
			title: "variant A Copy"
		};

		sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);

		var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
		oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
		oSourceVariantCopy.content.fileName = "newVariant";
		oSourceVariantCopy.content.variantReference = "variant0";
		oSourceVariantCopy.controlChanges.splice(1, 1);
		var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);

		oSourceVariantCopy.controlChanges.forEach( function (oCopiedChange, iIndex) {
			oCopiedChange.variantReference = "newVariant";
			oCopiedChange.support.sourceChangeFileName = oSourceVariant.controlChanges[iIndex].fileName;
			oSourceVariantCopy.controlChanges[iIndex].fileName = oDuplicateVariant.controlChanges[iIndex].fileName; /*mock*/
		});

		assert.deepEqual(oDuplicateVariant, oSourceVariantCopy, "then the duplicate variant returned with customized properties");
		assert.equal(oDuplicateVariant.controlChanges.length, 1, "then only one change duplicated");
		assert.equal(oDuplicateVariant.controlChanges[0].layer, Utils.getCurrentLayer(), "then only one change duplicated");
		assert.equal(oDuplicateVariant.content.variantReference, oSourceVariant.content.fileName, "then the duplicate variant has reference to the source variant from VENDOR layer");
	});

	QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer with reference to a variant with no layer", function(assert) {
		var oSourceVariant = {
			"content": {
				"fileName":"variant0",
				"fileType":"ctrl_variant",
				"variantManagementReference":"variantMgmtId1",
				"variantReference":"variant0",
				"content":{
					"title":"variant A"
				},
				"selector":{},
				"namespace":"Dummy.Component"
			},
			"controlChanges": [],
			"variantChanges": {}
		};

		var mPropertyBag = {
			newVariantReference: "newVariant",
			sourceVariantReference: "variant0",
			variantManagementReference: "variantMgmtId1",
			layer: "CUSTOMER",
			title: "variant A Copy"
		};

		sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);

		var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);
		var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
		oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
		oSourceVariantCopy.content.fileName = "newVariant";
		oSourceVariantCopy.content.layer = "CUSTOMER";

		assert.deepEqual(oDuplicateVariant, oSourceVariantCopy, "then the duplicate variant returned with customized properties");
	});

	QUnit.test("when calling '_duplicateVariant' from CUSTOMER layer with reference to a variant on the same layer", function(assert) {
		var oChangeContent0 = {"fileName":"change0", "variantReference":"variant0", "layer": "CUSTOMER", "support": {}};
		var oChangeContent1 = {"fileName":"change1", "variantReference":"variant0", "layer": "CUSTOMER", "support": {}};

		var oSourceVariant = {
			"content": {
				"fileName":"variant0",
				"fileType":"ctrl_variant",
				"variantManagementReference":"variantMgmtId1",
				"variantReference":"variant2",
				"content":{
					"title":"variant A"
				},
				"selector":{},
				"layer":"CUSTOMER",
				"namespace":"Dummy.Component"
			},
			"controlChanges": [oChangeContent0, oChangeContent1],
			"variantChanges": {}
		};

		var mPropertyBag = {
			newVariantReference: "newVariant",
			sourceVariantReference: "variant0",
			variantManagementReference: "variantMgmtId1",
			layer: "CUSTOMER",
			title: "variant A Copy"
		};

		sandbox.stub(this.oModel, "getVariant").returns(oSourceVariant);

		var oSourceVariantCopy = JSON.parse(JSON.stringify(oSourceVariant));
		oSourceVariantCopy.content.content.title = oSourceVariant.content.content.title + " Copy";
		oSourceVariantCopy.content.fileName = "newVariant";
		var oDuplicateVariant = this.oModel._duplicateVariant(mPropertyBag);

		oSourceVariantCopy.controlChanges.forEach( function (oCopiedChange, iIndex) {
			oCopiedChange.variantReference = "newVariant";
			oCopiedChange.support.sourceChangeFileName = oSourceVariant.controlChanges[iIndex].fileName;
			oSourceVariantCopy.controlChanges[iIndex].fileName = oDuplicateVariant.controlChanges[iIndex].fileName; /*mock*/
		});

		assert.deepEqual(oDuplicateVariant, oSourceVariantCopy, "then the duplicate variant returned with customized properties");
		assert.equal(oDuplicateVariant.controlChanges.length, 2, "then both changes duplicated");
		assert.equal(oDuplicateVariant.content.variantReference, oSourceVariant.content.variantReference, "then the duplicate variant references to the reference of the source variant");
		assert.equal(oDuplicateVariant.controlChanges[0].support.sourceChangeFileName , oChangeContent0.fileName, "then first duplicate variant change's support.sourceChangeFileName property set to source change's fileName");
		assert.equal(oDuplicateVariant.controlChanges[1].support.sourceChangeFileName , oChangeContent1.fileName, "then second duplicate variant change's support.sourceChangeFileName property set to source change's fileName");
	});

	QUnit.test("when calling '_ensureStandardVariantExists'", function(assert) {
		var oVariantControllerContent = {
			"variants": [{
			"content": {
				"fileName": "mockVariantManagement",
				"fileType": "ctrl_variant",
				"variantManagementReference": "mockVariantManagement",
				"variantReference": "",
				"content": {
					"title": "Standard",
					"favorite": true,
					"visible": true
				}
			},
			"controlChanges": [],
			"variantChanges": {}
		}
		],
			"defaultVariant": "mockVariantManagement",
			"variantManagementChanges": {}
		};

		var oVariantModelResponse = {
			"currentVariant": "mockVariantManagement",
			"originalCurrentVariant": "mockVariantManagement",
			"defaultVariant": "mockVariantManagement",
			"originalDefaultVariant": "mockVariantManagement",
			"variants": [{
				"key": "mockVariantManagement",
				"title": "Standard",
				"originalTitle": "Standard",
				"favorite": true,
				"originalFavorite": true,
				"visible": true
			}]
		};

		this.oModel.setData({});
		this.oModel._ensureStandardVariantExists("mockVariantManagement");

		assert.deepEqual(this.oModel.oData["mockVariantManagement"], oVariantModelResponse, "then standard variant entry created for variant model");
		assert.deepEqual(this.oModel.oVariantController._mVariantManagement["mockVariantManagement"], oVariantControllerContent, "then standard variant entry created for variant controller");
	});

	QUnit.test("when calling '_copyVariant'", function(assert) {
		var fnAddVariantToControllerStub = sandbox.stub(this.oModel.oVariantController, "addVariantToVariantManagement").returns(3);
		var oVariantData = {
			"content": {
				"fileName":"variant0",
				"fileType":"ctrl_variant",
				"variantManagementReference":"variantMgmtId1",
				"variantReference":"",
				"reference":"Dummy.Component",
				"packageName":"$TMP",
				"content":{
					"title":"variant A"
				},
				"layer":"CUSTOMER",
				"texts":{
					"TextDemo": {
						"value": "Text for TextDemo",
						"type": "myTextType"
					}
				},
				"namespace":"Dummy.Component",
				"creation":"",
				"originalLanguage":"EN",
				"conditions":{},
				"support":{
					"generator":"Change.createInitialFileContent",
					"service":"",
					"user":""
				}
			},
			"controlChanges": [],
			"variantChanges": {}
		};
		sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
		sandbox.stub(BaseTreeModifier, "getSelector").returns({id: "variantMgmtId1"});
		sandbox.stub(this.oModel.oFlexController._oChangePersistence, "addDirtyChange").returnsArg(0);

		var mPropertyBag = {
			variantManagementReference: "variantMgmtId1"
		};
		return this.oModel._copyVariant(mPropertyBag).then( function (aChanges) {
			assert.ok(fnAddVariantToControllerStub.calledOnce, "then function to add variant to VariantController called");

			//Mocking properties set inside Variant.createInitialFileContent
			oVariantData.content.support.sapui5Version = sap.ui.version;
			oVariantData.content.self = oVariantData.content.namespace + oVariantData.content.fileName + "." + "ctrl_variant";

			assert.deepEqual(aChanges[0].getDefinitionWithChanges(), oVariantData, "then ctrl_variant change prepared with the correct content");
			assert.ok(fnAddVariantToControllerStub.calledWith(aChanges[0].getDefinitionWithChanges()), "then function to add variant to VariantController called with the correct parameters");
			assert.equal(this.oModel.oData["variantMgmtId1"].variants[3].key, oVariantData.content.fileName, "then variant added to VariantModel");
			assert.equal(aChanges[0].getId(), oVariantData.content.fileName, "then the returned variant is the duplicate variant");
		}.bind(this));
	});

	QUnit.test("when calling 'removeVariant'", function(assert) {
		var fnDeleteChangeStub = sandbox.stub(this.oModel.oFlexController._oChangePersistence, "deleteChange");
		var oChangeInVariant = {
			"fileName": "change0",
			"variantReference": "variant0",
			"layer": "VENDOR",
			getId: function () {
				return this.fileName;
			},
			getVariantReference: function() {
				return this.variantReference;
			}
		};
		var oVariant = {
			"fileName": "variant0",
			getId: function() {
				return this.fileName;
			}
		};
		var aDummyDirtyChanges = [oVariant].concat(oChangeInVariant);

		var fnRemoveVariantToControllerStub = sandbox.stub(this.oModel.oVariantController, "removeVariantFromVariantManagement").returns(2);
		var fnUpdateCurrentVariantSpy = sandbox.spy(this.oModel, "updateCurrentVariant");
		sandbox.stub(this.oModel.oFlexController._oChangePersistence, "getDirtyChanges").returns(aDummyDirtyChanges);

		assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 3, "then initial length is 3");

		return this.oModel.removeVariant(oVariant, "", "variantMgmtId1").then( function () {
			assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 2, "then one variant removed from VariantModel");
			assert.ok(fnRemoveVariantToControllerStub.calledOnce, "then function to remove variant from VariantController called");
			assert.ok(fnDeleteChangeStub.calledTwice, "then ChangePersistence.deleteChange called twice");
			assert.ok(fnDeleteChangeStub.calledWith(oChangeInVariant), "then ChangePersistence.deleteChange called for change in variant");
			assert.ok(fnDeleteChangeStub.calledWith(oVariant), "then ChangePersistence.deleteChange called for variant");
			assert.ok(fnUpdateCurrentVariantSpy.calledBefore(fnRemoveVariantToControllerStub), "then previous variant is reverted before removing the current variant");
		}.bind(this));
	});

	QUnit.test("when calling '_addChange'", function(assert) {
		var fnAddChangeToVariant = sandbox.stub(this.oModel.oVariantController, "addChangeToVariant");
		var oChange = {
			fileName : "addedChange",
			getVariantReference : function () {
				return "variant1";
			}
		};
		this.oModel.oData["variantMgmtId1"].modified = false;
		this.oModel.oData["variantMgmtId1"].variantsEditable = true;
		this.oModel._addChange(oChange);
		assert.equal(this.oModel.oData["variantMgmtId1"].modified, this.oModel.oData["variantMgmtId1"].variantsEditable, "then modified property equals variantEditable property");
		assert.ok(fnAddChangeToVariant.calledOnce, "then VariantController.addChangeToVariant called once");
		assert.ok(fnAddChangeToVariant.calledWith(oChange), "then VariantController.addChangeToVariant called with the passed change");

	});

	QUnit.test("when calling 'collectModelChanges'", function(assert) {
		this.oModel.getData()["variantMgmtId1"].variants[1].title = "test";
		this.oModel.getData()["variantMgmtId1"].variants[1].favorite = false;
		this.oModel.getData()["variantMgmtId1"].variants[1].visible = false;
		this.oModel.getData()["variantMgmtId1"].defaultVariant = "variant0";

		var aChanges = this.oModel.collectModelChanges("variantMgmtId1", "CUSTOMER");
		assert.equal(aChanges.length, 4, "then 4 changes with mPropertyBags were created");
	});

	QUnit.test("when calling 'manageVariants' in RTA mode", function(assert) {
		var done = assert.async();
		var oVariantManagement = new VariantManagement("variantMgmtId1");

		sandbox.stub(this.oModel, "_getLocalId").returns("variantMgmtId1");
		oVariantManagement.setModel(this.oModel, "$FlexVariants");

		sandbox.stub(oVariantManagement, "openManagementDialog").callsFake(oVariantManagement.fireManage);
		sandbox.stub(this.oFlexController._oChangePersistence._oVariantController, "_setVariantData");
		sandbox.stub(this.oFlexController._oChangePersistence._oVariantController, "_updateChangesForVariantManagementInMap");

		this.oModel._setModelPropertiesForControl("variantMgmtId1", true, oVariantManagement);

		this.oModel.getData()["variantMgmtId1"].variants[1].title = "test";
		this.oModel.getData()["variantMgmtId1"].variants[1].favorite = false;
		this.oModel.getData()["variantMgmtId1"].variants[1].visible = false;
		this.oModel.getData()["variantMgmtId1"].defaultVariant = "variant0";

		this.oModel.manageVariants(oVariantManagement, "variantMgmtId1", "CUSTOMER").then(function(aChanges) {
			assert.equal(aChanges.length, 4, "then 4 changes with mPropertyBags were created");
			oVariantManagement.destroy();
			done();
		});
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

		var oVariantManagement = new VariantManagement("variantMgmtId1");
		var oCopiedVariantContent = {
			content: {
				title: "Personalization Test Variant",
				variantManagementReference: "variantMgmtId1",
				variantReference: "variant1",
				layer: "USER"
			}
		};
		var oCopiedVariant = new sap.ui.fl.Variant(oCopiedVariantContent);
		var oEvent = {
			getParameter: function(sParameter) {
				if (sParameter === "overwrite") {
					return false;
				} else if (sParameter === "name") {
					return "Test";
				} else if (sParameter === "def") {
					return true;
				}
			},
			getSource: function() {
				return oVariantManagement;
			}
		};

		this.oModel.getData()["variantMgmtId1"].modified = true;

		sandbox.stub(this.oModel, "_getLocalId").returns("variantMgmtId1");
		sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns([{fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
		sandbox.stub(this.oFlexController._oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
		var fnCopyVariantStub = sandbox.stub(this.oModel, "_copyVariant").returns(Promise.resolve([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]));
		var fnRemoveDirtyChangesStub = sandbox.stub(this.oModel, "_removeDirtyChanges").returns(Promise.resolve());
		var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "_setVariantProperties").returns({fileName: "changeWithSetDefault"});
		var fnSaveSequenceOfDirtyChangesStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveSequenceOfDirtyChanges");

		return this.oModel._handleSave(oEvent).then(function() {
			assert.ok(fnCopyVariantStub.calledOnce, "CopyVariant is called");
			assert.ok(fnRemoveDirtyChangesStub.calledOnce, "RemoveDirtyChanges is called");
			assert.ok(fnSetVariantPropertiesStub.calledOnce, "SetVariantProperties is called");
			assert.ok(fnSaveSequenceOfDirtyChangesStub.calledOnce, "SaveSequenceOfDirtyChanges is called");
			assert.equal(fnSaveSequenceOfDirtyChangesStub.args[0][0].length, 5, "five dirty changes are saved (new variant, 3 copied ctrl changes, setDefault change");
			assert.equal(fnSaveSequenceOfDirtyChangesStub.args[0][0][4].fileName, "changeWithSetDefault", "the last change is 'setDefault'");
			assert.notOk(this.oModel.getData()["variantMgmtId1"].modified, "finally the model property 'modified' is set to false");
			oVariantManagement.destroy();
			done();
		}.bind(this));
	});

	QUnit.test("when calling '_handleSave' with parameter from SaveAs button and default box unchecked", function(assert) {
		var done = assert.async();

		var oVariantManagement = new VariantManagement("variantMgmtId1");
		var oCopiedVariantContent = {
			content: {
				title: "Personalization Test Variant",
				variantManagementReference: "variantMgmtId1",
				variantReference: "variant1",
				layer: "USER"
			}
		};
		var oCopiedVariant = new sap.ui.fl.Variant(oCopiedVariantContent);
		var oEvent = {
			getParameter: function(sParameter) {
				if (sParameter === "overwrite") {
					return false;
				} else if (sParameter === "name") {
					return "Test";
				} else if (sParameter === "def") {
					return false;
				}
			},
			getSource: function() {
				return oVariantManagement;
			}
		};

		this.oModel.getData()["variantMgmtId1"].modified = true;

		sandbox.stub(this.oModel, "_getLocalId").returns("variantMgmtId1");
		sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns([{fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
		sandbox.stub(this.oFlexController._oChangePersistence, "getDirtyChanges").returns([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
		var fnCopyVariantStub = sandbox.stub(this.oModel, "_copyVariant").returns(Promise.resolve([oCopiedVariant, {fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]));
		var fnRemoveDirtyChangesStub = sandbox.stub(this.oModel, "_removeDirtyChanges").returns(Promise.resolve());
		var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "_setVariantProperties");
		var fnSaveSequenceOfDirtyChangesStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveSequenceOfDirtyChanges");

		return this.oModel._handleSave(oEvent).then(function() {
			assert.ok(fnCopyVariantStub.calledOnce, "CopyVariant is called");
			assert.ok(fnRemoveDirtyChangesStub.calledOnce, "RemoveDirtyChanges is called");
			assert.equal(fnSetVariantPropertiesStub.callCount, 0, "SetVariantProperties is not called");
			assert.ok(fnSaveSequenceOfDirtyChangesStub.calledOnce, "SaveSequenceOfDirtyChanges is called");
			assert.notOk(this.oModel.getData()["variantMgmtId1"].modified, "finally the model property 'modified' is set to false");
			oVariantManagement.destroy();
			done();
		}.bind(this));
	});

	QUnit.test("when calling '_handleSave' with parameter from Save button", function(assert) {
		var done = assert.async();

		var oVariantManagement = new VariantManagement("variantMgmtId1");
		var oEvent = {
			getParameter: function(sParameter) {
				if (sParameter === "overwrite") {
					return true;
				} else if (sParameter === "name") {
					return "Test";
				}
			},
			getSource: function() {
				return oVariantManagement;
			}
		};

		this.oModel.getData()["variantMgmtId1"].modified = true;

		sandbox.stub(this.oModel, "_getLocalId").returns("variantMgmtId1");
		sandbox.stub(this.oModel.oVariantController, "getVariantChanges").returns([{fileName: "change1"}, {fileName: "change2"}, {fileName: "change3"}]);
		var fnCopyVariantStub = sandbox.stub(this.oModel, "_copyVariant");
		var fnRemoveDirtyChangesStub = sandbox.stub(this.oModel, "_removeDirtyChanges");
		var fnSetVariantPropertiesStub = sandbox.stub(this.oModel, "_setVariantProperties");
		var fnSaveSequenceOfDirtyChangesStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveSequenceOfDirtyChanges");

		return this.oModel._handleSave(oEvent).then(function() {
			assert.equal(fnCopyVariantStub.callCount, 0, "CopyVariant is not called");
			assert.equal(fnRemoveDirtyChangesStub.callCount, 0, "RemoveDirtyChanges is not called");
			assert.equal(fnSetVariantPropertiesStub.callCount, 0, "SetVariantProperties is not called");
			assert.ok(fnSaveSequenceOfDirtyChangesStub.calledOnce, "SaveAll is called");
			assert.notOk(this.oModel.getData()["variantMgmtId1"].modified, "finally the model property 'modified' is set to false");
			oVariantManagement.destroy();
			done();
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

	QUnit.test("when calling 'getVariant' without a variant management reference", function(assert) {
		sandbox.stub(this.oModel.oVariantController, "getVariant").callsFake(function(){
			assert.ok(this.oModel.getVariantManagementReference.calledOnce, "then variant management reference calculated");
			assert.equal(arguments[0], "varMgmtRef", "then correct variant management reference received");
			assert.equal(arguments[1], "varRef", "then correct variant reference received");
		}.bind(this));
		sandbox.stub(this.oModel, "getVariantManagementReference").returns({
			variantManagementReference: "varMgmtRef"
		});
		this.oModel.getVariant("varRef");
	});

	QUnit.module("Given an empty VariantModel and a VariantManagement control", {
		beforeEach : function(assert) {
			this.oData = {};

			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					"applicationVersion": {
						"version": "1.2.3"
					}
				}
			};
			var oManifest = new sap.ui.core.Manifest(oManifestObj);
			var oComponent = {
				name: "MyComponent",
				appVersion: "1.2.3",
				getId: function() {
					return "RTADemoAppMD";
				},
				getManifestObject: function() {
					return oManifest;
				}
			};
			sandbox.stub(Utils, "getComponentClassName").returns("MyComponent");

			this.oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
			this.fnLoadSwitchChangesStub = sandbox.stub(this.oFlexController._oChangePersistence, "loadSwitchChangesMapForComponent").returns({aRevert:[], aNew:[]});
			this.fnRevertChangesStub = sandbox.stub(this.oFlexController, "revertChangesOnControl");
			this.fnApplyChangesStub = sandbox.stub(this.oFlexController, "applyVariantChanges");

			this.oModel = new VariantModel(this.oData, this.oFlexController, oComponent);
			this.oVariantManagement = new VariantManagement("varMgmtRef1");
		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oModel.destroy();
			this.oVariantManagement.destroy();
			delete this.oFlexController;
		}
	});

	QUnit.test("when calling 'setModel' of VariantManagement control", function(assert) {
		var fnRegisterToModelSpy = sandbox.spy(this.oModel, "registerToModel");
		sandbox.stub(this.oModel, "_getLocalId").returns("varMgmtRef1");
		this.oVariantManagement.setModel(this.oModel, "$FlexVariants");

		assert.equal(this.oModel.getCurrentVariantReference("varMgmtRef1"), "varMgmtRef1", "then the Current Variant is set to the standard variant");
		assert.ok(fnRegisterToModelSpy.calledOnce, "then registerToModel called once, when VariantManagement control setModel is called");
		assert.ok(fnRegisterToModelSpy.calledWith(this.oVariantManagement), "then registerToModel called with VariantManagement control");
	});

	QUnit.start();
});
