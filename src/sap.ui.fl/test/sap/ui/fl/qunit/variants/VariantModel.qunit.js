/* global sinon QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/variants/VariantController", "sap/ui/fl/variants/VariantModel", "sap/ui/fl/Utils", "sap/ui/fl/FlexControllerFactory", "sap/ui/fl/changeHandler/BaseTreeModifier"
], function(VariantController, VariantModel, Utils, FlexControllerFactory, BaseTreeModifier) {
	"use strict";
	sinon.config.useFakeTimers = false;
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function(assert) {
			this.oData = {
				"variantMgmtId1": {
					"defaultVariant": "variant1",
					"variants": [
						{
							"author": "SAP",
							"key": "variantMgmtId1",
							"layer": "VENDOR",
							"readOnly": true,
							"title": "Standard"
						}, {
							"author": "Me",
							"key": "variant0",
							"layer": "CUSTOMER",
							"readOnly": false,
							"title": "variant A"
						}, {
							"author": "Me",
							"key": "variant1",
							"layer": "CUSTOMER",
							"readOnly": false,
							"title": "variant B"
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
		},
		afterEach: function(assert) {
			sandbox.restore();
			delete this.oFlexController;
		}
	});

	QUnit.test("when calling 'getData'", function(assert) {
		var sExpectedJSON = "{\"variantMgmtId1\":{" + "\"modified\":false," + "\"defaultVariant\":\"variant1\"," + "\"variants\":[{" + "\"author\":\"SAP\"," + "\"key\":\"variantMgmtId1\"," + "\"layer\":\"VENDOR\"," + "\"originalTitle\":\"Standard\"," + "\"readOnly\":true," + "\"title\":\"Standard\"," + "\"toBeDeleted\":false" + "}," + "{" + "\"author\":\"Me\"," + "\"key\":\"variant0\"," + "\"layer\":\"CUSTOMER\"," + "\"originalTitle\":\"variant A\"," + "\"readOnly\":false," + "\"title\":\"variant A\"," + "\"toBeDeleted\":false" + "}," + "{" + "\"author\":\"Me\"," + "\"key\":\"variant1\"," + "\"layer\":\"CUSTOMER\"," + "\"originalTitle\":\"variant B\"," + "\"readOnly\":false," + "\"title\":\"variant B\"," + "\"toBeDeleted\":false" + "}]," + "\"currentVariant\":\"variant1\"" + "}" + "}";
		var sCurrentVariant = this.oModel.getCurrentVariantReference("variantMgmtId1");
		assert.deepEqual(this.oModel.getData(), JSON.parse(sExpectedJSON));
		assert.equal(sCurrentVariant, "variant1", "then the key of the current variant is returned");
	});

	QUnit.test("when calling 'getVariantManagementReference'", function(assert) {
		var sVariantManagementReference = this.oModel.getVariantManagementReference("variant1");
		assert.equal(sVariantManagementReference, "variantMgmtId1", "then the correct variant management reference is returned");
	});

	QUnit.test("when calling 'switchToVariant'", function(assert) {
		this.oModel._switchToVariant("variantMgmtId1", "variant1");
		assert.ok(this.fnLoadSwitchChangesStub.calledOnce, "then loadSwitchChangesMapForComponent called once from ChangePersitence");
		assert.ok(this.fnRevertChangesStub.calledOnce, "then revertChangesOnControl called once in FlexController");
		assert.ok(this.fnApplyChangesStub.calledOnce, "then applyVariantChanges called once in FlexController");
	});

	QUnit.test("when calling '_copyVariant'", function(assert) {
		var fnAddVariantToControllerStub = sandbox.stub(this.oModel.oVariantController, "addVariantToVariantManagement").returns(3);
		var oVariantData = {
			"content": {
				"fileName":"variant0",
					"title":"variant A",
					"fileType":"ctrl_variant",
					"variantManagementReference":"variantMgmtId1",
					"variantReference":"",
					"reference":"Dummy.Component",
					"packageName":"$TMP",
					"content":{},
				"selector":{},
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
			"changes": []
		};
		sandbox.stub(this.oModel, "_duplicateVariant").returns(oVariantData);
		sandbox.stub(BaseTreeModifier, "getSelector").returns({id: "variantMgmtId1"});
		sandbox.stub(this.oModel.oFlexController._oChangePersistence, "addDirtyChange");
		this.oModel._copyVariant();

		assert.ok(fnAddVariantToControllerStub.calledOnce, "then unction to add variant to VariantController called");
		assert.equal(this.oModel.oData["variantMgmtId1"].variants[3].key, oVariantData.content.fileName, "then variant added to VariantModel");
	});

	QUnit.test("when calling '_removeVariant'", function(assert) {
		sandbox.stub(this.oModel.oFlexController._oChangePersistence, "deleteChange");
		var fnRemoveVariantToControllerStub = sandbox.stub(this.oModel.oVariantController, "removeVariantFromVariantManagement").returns(2);
		assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 3, "then initial length is 3");
		this.oModel._removeVariant({}, "", "variantMgmtId1");
		assert.equal(this.oModel.oData["variantMgmtId1"].variants.length, 2, "then one variant removed from VariantModel");
		assert.ok(fnRemoveVariantToControllerStub.calledOnce, "then function to remove variant from VariantController called");
	});


	QUnit.module("Given an instance of FakeLrepConnector with no Variants in the LREP response", {
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
		},
		afterEach : function(assert) {
			sandbox.restore();
			delete this.oFlexController;
		}
	});


	QUnit.test("when calling 'ensureStandardEntryExists'", function(assert) {
		this.oModel.ensureStandardEntryExists("varMgmtRef1");
		assert.equal(this.oModel.getCurrentVariantReference("varMgmtRef1"), "varMgmtRef1", "then the Current Variant is set to the standard variant");
	});

});
