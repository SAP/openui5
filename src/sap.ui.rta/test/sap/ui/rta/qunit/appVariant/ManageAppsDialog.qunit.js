/* global QUnit sinon */

QUnit.config.autostart = false;
sap.ui.require([
	"sap/ui/rta/appVariant/ManageAppsDialog",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/manageApps/webapp/controller/ManageApps.controller"
],
function(
	ManageAppsDialog,
	ManageAppsUtils,
	ManageAppsController) {
	"use strict";

	QUnit.start();

	var oManageAppsDialog;
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a ManageAppsDialog is available", {
		beforeEach : function(assert) {},
		afterEach : function(assert) {
			oManageAppsDialog.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when ManageAppsDialog gets initialized in an original app and open is called (app variants),", function(assert) {
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

		oManageAppsDialog = new ManageAppsDialog({
			rootControl: {
				rootView: "demoRootControl"
			}
		});

		return oManageAppsDialog.open().then(function(){
			assert.ok(true, "then dialog displays properties of original app and its app variants");
			assert.ok(true, "then the opened event is fired");
			return oManageAppsDialog._closeDialog();
		});
	});

	QUnit.test("when ManageAppsDialog gets initialized in an original app and open is called (no app variants),", function(assert) {
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

		var aMockAppVariantsProperties = [];

		sandbox.stub(ManageAppsUtils, "getAppVariants").returns(Promise.resolve(aMockAppVariantsProperties));

		sandbox.stub(ManageAppsController.prototype, "_paintCurrentlyAdaptedApp").returns(Promise.resolve(true));

		oManageAppsDialog = new ManageAppsDialog({
			rootControl: {
				rootView: "demoRootControl"
			}
		});

		return oManageAppsDialog.open().then(function(){
			assert.ok(true, "then dialog displays properties of only original app");
			assert.ok(true, "then the opened event is fired");
			return oManageAppsDialog._closeDialog();
		});
	});

	QUnit.test("when ManageAppsDialog gets initialized in an app variant and open is called (app variants),", function(assert) {
		var oMockedDescriptorData = {
			"sap.ui5": {
				componentName: "sapUi5Id"
			},
			"sap.app": {
				title: "AppVariantTitle",
				subTitle: "AppVariantSubtitle",
				description: "AppVariantDescription",
				id: "AppVariantId"
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

		var aOriginalAppProperties = [
			{
				"componentName": "originalAppComponent",
				"description" : "originalAppDescription",
				"icon" : "sap-icon://history",
				"id" : "originalAppId",
				"subTitle" : "originalAppSubTitle",
				"title" : "originalAppTitle",
				"type" :"originalAppType"
			}
		];

		sandbox.stub(ManageAppsUtils, "getOriginalAppProperties").returns(Promise.resolve(aOriginalAppProperties));

		sandbox.stub(ManageAppsController.prototype, "_paintCurrentlyAdaptedApp").returns(Promise.resolve(true));

		oManageAppsDialog = new ManageAppsDialog({
			rootControl: {
				rootView: "demoRootControl"
			}
		});

		return oManageAppsDialog.open().then(function(){
			assert.ok(true, "then dialog displays properties of app variants, variants of app variants and original app");
			assert.ok(true, "then the opened event is fired");
			return oManageAppsDialog._closeDialog();
		});
	});

});
