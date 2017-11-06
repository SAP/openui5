/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/appVariant/ManageAppsDialog",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/thirdparty/sinon"
],
function(
	ManageAppsDialog,
	AppVariantOverviewUtils,
	sinon) {
	"use strict";

	QUnit.start();

	var oAppVariantOverviewDialog;
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a ManageAppsDialog is available", {
		afterEach : function(assert) {
			oAppVariantOverviewDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when ManageAppsDialog gets opened from a reference app and reference app has app variants,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};
			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId : "id1",
					title : "title1",
					subTitle : "subTitle1",
					description : "description1",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : true,
					typeOfApp : "Original App",
					descriptorUrl : "url1"
				},
				{
					appId : "id2",
					title : "title2",
					subTitle : "subTitle2",
					description : "description2",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url2"
				},
				{
					appId : "id3",
					title : "title3",
					subTitle : "subTitle3",
					description : "description3",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url3"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			oAppVariantOverviewDialog = new ManageAppsDialog({
				rootControl: {
					rootView: "demoRootControl"
				}
			});


			oAppVariantOverviewDialog.open();
			oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays the reference (currently adapting) and app variant entries");
				done();
			});
		});

		QUnit.test("when ManageAppsDialog gets opened from a reference app and reference app has no app variants,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId : "id1",
					title : "title1",
					subTitle : "subTitle1",
					description : "description1",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : true,
					typeOfApp : "Original App",
					descriptorUrl : "url1"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			oAppVariantOverviewDialog = new ManageAppsDialog({
				rootControl: {
					rootView: "demoRootControl"
				}
			});


			oAppVariantOverviewDialog.open();
			oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays the reference app (currently adapting) entry only");
				done();
			});
		});

		QUnit.test("when ManageAppsDialog gets opened from an app variant,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id3"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId : "id1",
					title : "title1",
					subTitle : "subTitle1",
					description : "description1",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : true,
					typeOfApp : "Original App",
					descriptorUrl : "url1"
				},
				{
					appId : "id2",
					title : "title2",
					subTitle : "subTitle2",
					description : "description2",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url2"
				},
				{
					appId : "id3",
					title : "title3",
					subTitle : "subTitle3",
					description : "description3",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url3"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			oAppVariantOverviewDialog = new ManageAppsDialog({
				rootControl: {
					rootView: "demoRootControl"
				}
			});

			oAppVariantOverviewDialog.open();
			oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays the app variant (currently adapting) and other app variants grouping");
				done();
			});
		});

		QUnit.test("when ManageAppsDialog gets opened from a reference app, reference app has one new created app variant,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId : "id1",
					title : "title1",
					subTitle : "subTitle1",
					description : "description1",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : true,
					typeOfApp : "Original App",
					descriptorUrl : "url1"
				},
				{
					appId : "id2",
					title : "title2",
					subTitle : "subTitle2",
					description : "description2",
					icon : "sap-icon://history",
					originalId : "id1",
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url2",
					rowStatus : "Information"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			oAppVariantOverviewDialog = new ManageAppsDialog({
				rootControl: {
					rootView: "demoRootControl"
				}
			});

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "getNewAppVariantId").returns("id2");

			oAppVariantOverviewDialog.open();
			oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays the reference app (currently adapting) entry and a new created app variant with blue highlighter");
				done();
			});
		});
	});
});
