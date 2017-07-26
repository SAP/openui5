/* global QUnit sinon */
QUnit.config.autostart = false;
sap.ui.require(["sap/ui/rta/appVariant/Utils"], function(ManageAppsUtils) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	QUnit.start();

	QUnit.module("Given an AppVariantUtils is instantiated", {
		beforeEach: function () {},
		afterEach: function () {
			sandbox.restore();
		}
	});

	QUnit.test("When getAppVariants() method is called", function (assert) {
		var sComponentName = "sap.ui.fl.smartformdemo";

		var oAjaxStubResult = {
			results: [
				{
					"descriptorUrl" : "testDescriptionUrl"
				}
			]
		};
		sandbox.stub(ManageAppsUtils, "ajaxRequest").returns(Promise.resolve(oAjaxStubResult));

		var oAppVariantDescriptorStubResult = [{
			title: "testTitle",
			subTitle: "testSubTitle",
			description: "testDescription",
			icon: "sap-icon://history",
			componentName: "testComponent",
			type: "App Variant",
			id: "testId"
		}];

		sandbox.stub(ManageAppsUtils, "getAppVariantDescriptorInfo").returns(Promise.resolve(oAppVariantDescriptorStubResult));
		return ManageAppsUtils.getAppVariants(sComponentName).then(function(oResult){
			assert.ok(true, "then the promise is resolved");
			assert.ok(oResult, "then the result contains app variants properties");
			assert.strictEqual(oResult[0].title, "testTitle", "then the title of an app variant is correct");
			assert.strictEqual(oResult[0].subTitle, "testSubTitle", "then the subtitle of an app variant is correct");
			assert.strictEqual(oResult[0].description, "testDescription", "then the description of an app variant is correct");
			assert.strictEqual(oResult[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
			assert.strictEqual(oResult[0].componentName, "testComponent", "then the component name of an app variant is correct");
			assert.strictEqual(oResult[0].type, "App Variant", "then the type is correct");
			assert.strictEqual(oResult[0].id, "testId", "then the id of an app variant is correct");
		});
	});

	QUnit.test("When getAppVariantDescriptorInfo() method is called", function (assert) {
		var aAppVariants =  [
			{
				"descriptorUrl" : "testDescriptionUrl"
			}
		];

		var oStubResult = {
			"sap.app": {
				title: "testTitle",
				subTitle: "testSubTitle",
				description: "testDescription",
				id: "testId"
			},
			"sap.ui": {
				icons: {
					icon: "sap-icon://history"
				}
			},
			"sap.ui5": {
				componentName: "testComponent"
			}
		};

		sandbox.stub(ManageAppsUtils, "ajaxRequest").returns(Promise.resolve(oStubResult));


		return ManageAppsUtils.getAppVariantDescriptorInfo(aAppVariants, "App Variant").then(function(oResult){
			assert.ok(true, "then the promise is resolved");
			assert.ok(oResult, "then the result contains app variant properties");
			assert.strictEqual(oResult[0].title, "testTitle", "then the title of an app variant is correct");
			assert.strictEqual(oResult[0].subTitle, "testSubTitle", "then the subtitle of an app variant is correct");
			assert.strictEqual(oResult[0].description, "testDescription", "then the description of an app variant is correct");
			assert.strictEqual(oResult[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
			assert.strictEqual(oResult[0].componentName, "testComponent", "then the component name of an app variant is correct");
			assert.strictEqual(oResult[0].type, "App Variant", "then the type is correct");
			assert.strictEqual(oResult[0].id, "testId", "then the id of an app variant is correct");
		});
	});

	QUnit.test("When getOriginalAppProperties() method is called", function (assert) {
		var aAppVariants =  [
			{
				"descriptorUrl" : "testDescriptionUrl"
			}
		];

		sandbox.stub(ManageAppsUtils, "ajaxRequest").returns(Promise.resolve(aAppVariants));

		var oAppVariantDescriptorStubResult = [{
			title: "originalAppTitle",
			subTitle: "originalAppSubTitle",
			description: "originalAppDescription",
			icon: "sap-icon://history",
			componentName: "originalAppComponent",
			type: "Original",
			id: "originalAppId"
		}];

		sandbox.stub(ManageAppsUtils, "getAppVariantDescriptorInfo").returns(Promise.resolve(oAppVariantDescriptorStubResult));

		return ManageAppsUtils.getOriginalAppProperties("sOriginalAppId").then(function(oResult){
			assert.ok(true, "then the promise is resolved");
			assert.ok(oResult, "then the result contains app variant properties");
			assert.strictEqual(oResult[0].title, "originalAppTitle", "then the title of an app variant is correct");
			assert.strictEqual(oResult[0].subTitle, "originalAppSubTitle", "then the subtitle of an app variant is correct");
			assert.strictEqual(oResult[0].description, "originalAppDescription", "then the description of an app variant is correct");
			assert.strictEqual(oResult[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
			assert.strictEqual(oResult[0].componentName, "originalAppComponent", "then the component name of an app variant is correct");
			assert.strictEqual(oResult[0].type, "Original", "then the type is correct");
			assert.strictEqual(oResult[0].id, "originalAppId", "then the id of an app variant is correct");
		});
	});

});