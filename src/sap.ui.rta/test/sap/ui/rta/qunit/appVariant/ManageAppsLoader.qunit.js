/* global QUnit sinon */

QUnit.config.autostart = false;
sap.ui.require(["sap/ui/rta/appVariant/ManageAppsLoader",
				"sap/ui/rta/appVariant/Utils",
				"sap/ui/rta/appVariant/manageApps/webapp/controller/ManageApps.controller"], function(ManageAppsLoader, ManageAppsUtils, ManageAppsController) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a ManageAppsLoader is instantiated", {
		beforeEach : function(assert) {},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});

	QUnit.test("when load() is called,", function(assert) {
		var oMockedDescriptorData = {
			"sap.ui5": {
				componentName: "BaseAppId"
			},
			"sap.app": {
				title: "BaseAppTitle",
				subTitle: "BaseAppSubtitle",
				description: "BaseAppDescription",
				id: "BaseAppId"
			},
			"sap.ui": {
				icons: {
					icon: "sap-icon://history"
				}
			}
		};
		sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

		var aMockAppVariantsProperties = [
			{
				"componentName": "component1",
				"description" : "description1",
				"icon" : "sap-icon://history",
				"id" : "id1",
				"subTitle" : "subTitle1",
				"title" : "title1",
				"type" :"App variant"
			},
			{
				"componentName": "component2",
				"description" : "description2",
				"icon" : "sap-icon://history",
				"id" : "id2",
				"subTitle" : "subTitle2",
				"title" : "title2",
				"type" :"App variant"
			},
			{
				"componentName": "component3",
				"description" : "description3",
				"icon" : "sap-icon://history",
				"id" : "id3",
				"subTitle" : "subTitle3",
				"title" : "title3",
				"type" :"App variant"
			}
		];
		sandbox.stub(ManageAppsUtils, "getAppVariants").returns(Promise.resolve(aMockAppVariantsProperties));

		sandbox.stub(ManageAppsController.prototype, "_paintCurrentlyAdaptedApp").returns(Promise.resolve(true));

		return ManageAppsLoader.load("demoRootControl").then(function(oManageAppsDialog) {
			assert.ok(true, "the the promise got resolved and manageAppsDialog is opened");
			oManageAppsDialog.destroy();
		});
	});

	QUnit.test("when hasAppVariantsSupport() is called for FLP apps on S/4 Hana platform", function(assert) {
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);
		assert.equal(ManageAppsLoader.hasAppVariantsSupport("CUSTOMER", true), false, "then the 'i' button is not visible");
	});

	QUnit.test("when hasAppVariantsSupport() is called for non FLP apps on S/4 Hana platform", function(assert) {
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(false);
		assert.equal(ManageAppsLoader.hasAppVariantsSupport("CUSTOMER", true), false, "then the 'i' button is not visible");
	});

	QUnit.test("when hasAppVariantsSupport() is called for non FLP apps on S/4 Hana platform with feature flag 'sap-ui-xx-rta-save-as' equal to true", function(assert) {
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);
		var oMockedUriParams = {
			mParams: {
				"sap-ui-xx-rta-save-as": ["true"]
			}
		};
		sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);
		assert.equal(ManageAppsLoader.hasAppVariantsSupport("CUSTOMER", true), true, "then the 'i' button is visible");
	});

	QUnit.test("when hasAppVariantsSupport() is called for non FLP apps on S/4 Hana platform with feature flag 'sap-ui-xx-rta-save-as' equal to false", function(assert) {
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);
		var oMockedUriParams = {
			mParams: {
				"sap-ui-xx-rta-save-as": ["false"]
			}
		};
		sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);
		assert.equal(ManageAppsLoader.hasAppVariantsSupport("CUSTOMER", true), false, "then the 'i' button is not visible");
	});

	QUnit.test("when hasAppVariantsSupport() is called for non FLP apps on S/4 Hana platform without feature flag 'sap-ui-xx-rta-save-as'", function(assert) {
		sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);
		var oMockedUriParams = {
			mParams: {}
		};
		sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);
		assert.equal(ManageAppsLoader.hasAppVariantsSupport("CUSTOMER", true), false, "then the 'i' button is not visible");
	});
});
