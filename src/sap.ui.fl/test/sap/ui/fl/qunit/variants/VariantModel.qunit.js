/*global sinon QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/variants/VariantController",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FlexControllerFactory"
], function(VariantController, VariantModel, Utils, FlexControllerFactory) {
	"use strict";
	sinon.config.useFakeTimers = false;
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an instance of VariantModel", {
		beforeEach : function(assert) {
			this.oData = {
				"variantMgmtId1": {
					"defaultVariant": "variant1",
					"variants": [{
						"author": "SAP",
						"key": "variantMgmtId1",
						"layer": "VENDOR",
						"originalTitle": "Standard",
						"readOnly": true,
						"title": "Standard",
						"toBeDeleted": false
					},
					{
						"author": "Me",
						"key": "variant0",
						"layer": "CUSTOMER",
						"originalTitle": "variant A",
						"readOnly": false,
						"title": "variant A",
						"toBeDeleted": false
					},
					{
						"author": "Me",
						"key": "variant1",
						"layer": "CUSTOMER",
						"originalTitle": "variant B",
						"readOnly": false,
						"title": "variant B",
						"toBeDeleted": false
					}]
				}
			};

			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					"applicationVersion": {
						"version" : "1.2.3"
					}
				}
			};
			var oManifest = new sap.ui.core.Manifest(oManifestObj);
			var oComponent = {
				name: "MyComponent",
				appVersion: "1.2.3",
				getId : function() {return "RTADemoAppMD";},
				getManifestObject : function() {return oManifest;}
			};

			var oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);

			this.oModel = new VariantModel(this.oData, oFlexController, oComponent);
		},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});


	QUnit.test("when calling 'getJSON'", function(assert) {
		var done = assert.async();
		var sExpectedJSON = "{\"variantMgmtId1\":{" +
													"\"defaultVariant\":\"variant1\"," +
													"\"variants\":[{" +
														"\"author\":\"SAP\"," +
														"\"key\":\"variantMgmtId1\"," +
														"\"layer\":\"VENDOR\"," +
														"\"originalTitle\":\"Standard\"," +
														"\"readOnly\":true," +
														"\"title\":\"Standard\"," +
														"\"toBeDeleted\":false" +
														"}," +
														"{" +
														"\"author\":\"Me\"," +
														"\"key\":\"variant0\"," +
														"\"layer\":\"CUSTOMER\"," +
														"\"originalTitle\":\"variant A\"," +
														"\"readOnly\":false," +
														"\"title\":\"variant A\"," +
														"\"toBeDeleted\":false" +
														"}," +
														"{" +
														"\"author\":\"Me\"," +
														"\"key\":\"variant1\"," +
														"\"layer\":\"CUSTOMER\"," +
														"\"originalTitle\":\"variant B\"," +
														"\"readOnly\":false," +
														"\"title\":\"variant B\"," +
														"\"toBeDeleted\":false" +
													"}]," +
													"\"currentVariant\":\"variant1\"" +
													"}" +
												"}";
		var sJSON = this.oModel.getJSON();
		var sCurrentVariant = this.oModel.getCurrentVariantRef("variantMgmtId1");
		assert.equal(sJSON, sExpectedJSON, "then the correct JSON string is returned");
		assert.equal(sCurrentVariant, "variant1", "then the key of the current variant is returned");
		done();
	});

});
