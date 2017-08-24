/* global sinon QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/variants/VariantController", "sap/ui/fl/variants/VariantModel", "sap/ui/fl/Utils", "sap/ui/fl/FlexControllerFactory"
], function(VariantController, VariantModel, Utils, FlexControllerFactory) {
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
			this.oLoadSwitchChangesStub = sandbox.stub(this.oFlexController._oChangePersistence, "loadSwitchChangesMapForComponent").returns({aRevert:[], aNew:[]});
			this.oRevertChangesStub = sandbox.stub(this.oFlexController, "revertChangesOnControl");
			this.oApplyChangesStub = sandbox.stub(this.oFlexController, "applyVariantChanges");


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
		assert.ok(this.oLoadSwitchChangesStub.calledOnce, "then loadSwitchChangesMapForComponent called once from ChangePersitence");
		assert.ok(this.oRevertChangesStub.calledOnce, "then revertChangesOnControl called once in FlexController");
		assert.ok(this.oApplyChangesStub.calledOnce, "then applyVariantChanges called once in FlexController");
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
			this.oLoadSwitchChangesStub = sandbox.stub(this.oFlexController._oChangePersistence, "loadSwitchChangesMapForComponent").returns({aRevert:[], aNew:[]});
			this.oRevertChangesStub = sandbox.stub(this.oFlexController, "revertChangesOnControl");
			this.oApplyChangesStub = sandbox.stub(this.oFlexController, "applyVariantChanges");

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
