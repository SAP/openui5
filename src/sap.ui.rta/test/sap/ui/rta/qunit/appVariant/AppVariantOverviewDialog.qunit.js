/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/appVariant/AppVariantOverviewDialog",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function (
	jQuery,
	AppVariantOverviewDialog,
	AppVariantOverviewUtils,
	AppVariantUtils,
	FlUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a AppVariantOverviewDialog is available", {
		afterEach: function () {
			this.oAppVariantOverviewDialog.destroy();
			sandbox.restore();
		},
		after: function() {
			jQuery("#sapUiBusyIndicator").hide();
		}
	}, function() {
		QUnit.test("when AppVariantOverviewDialog gets opened from an original app and a key user has already created app variants based on an original app,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};
			sandbox.stub(FlUtils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId: "id1",
					title: "title1",
					subTitle: "subTitle1",
					description: "description1",
					icon: "sap-icon://history",
					isOriginal: true,
					typeOfApp: "Original App",
					descriptorUrl: "url1",
					adaptUIButtonVisibility: false
				},
				{
					appId: "id2",
					title: "title2",
					subTitle: "subTitle2",
					description: "description2",
					icon: "sap-icon://history",
					isOriginal: false,
					typeOfApp: "App Variant",
					descriptorUrl: "url2",
					adaptUIButtonVisibility: false
				},
				{
					appId: "id3",
					title: "title3",
					subTitle: "subTitle3",
					description: "description3",
					icon: "sap-icon://history",
					isOriginal: false,
					typeOfApp: "App Variant",
					descriptorUrl: "url3",
					adaptUIButtonVisibility: false
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			this.oAppVariantOverviewDialog = new AppVariantOverviewDialog({
				idRunningApp: "id1"
			});

			this.oAppVariantOverviewDialog.open();
			this.oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays an original (currently adapting) app and app variant entries");
				done();
			});
		});

		QUnit.test("when AppVariant Overview Dialog gets opened from an original app and there are no app variants based on an original app,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId: "id1",
					title: "title1",
					subTitle: "subTitle1",
					description: "description1",
					icon: "sap-icon://history",
					isOriginal: true,
					typeOfApp: "Original App",
					descriptorUrl: "url1",
					adaptUIButtonVisibility: false
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			this.oAppVariantOverviewDialog = new AppVariantOverviewDialog({
				idRunningApp: "id1"
			});

			this.oAppVariantOverviewDialog.open();
			this.oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays an original app (Currently Adapting) entry only");
				done();
			});
		});

		QUnit.test("when AppVariant Overview Dialog gets opened from an app variant,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id3"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId: "id1",
					title: "title1",
					subTitle: "subTitle1",
					description: "description1",
					icon: "sap-icon://history",
					isOriginal: true,
					typeOfApp: "Original App",
					descriptorUrl: "url1"
				},
				{
					appId: "id2",
					title: "title2",
					subTitle: "subTitle2",
					description: "description2",
					icon: "sap-icon://history",
					isOriginal: false,
					typeOfApp: "App Variant",
					descriptorUrl: "url2"
				},
				{
					appId: "id3",
					title: "title3",
					subTitle: "subTitle3",
					description: "description3",
					icon: "sap-icon://history",
					isOriginal: false,
					typeOfApp: "App Variant",
					descriptorUrl: "url3"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			this.oAppVariantOverviewDialog = new AppVariantOverviewDialog({
				idRunningApp: "id1"
			});

			this.oAppVariantOverviewDialog.open();
			this.oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays the app variant (currently adapting) and other app variants grouping");
				done();
			});
		});

		QUnit.test("when AppVariantOverviewDialog gets opened from an original app, original app has one new created app variant,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);

			var aAppVariantOverviewAttributes = [
				{
					appId: "id1",
					title: "title1",
					subTitle: "subTitle1",
					description: "description1",
					icon: "sap-icon://history",
					isOriginal: true,
					typeOfApp: "Original App",
					descriptorUrl: "url1"
				},
				{
					appId: "id2",
					title: "title2",
					subTitle: "subTitle2",
					description: "description2",
					icon: "sap-icon://history",
					isOriginal: false,
					typeOfApp: "App Variant",
					descriptorUrl: "url2",
					currentStatus: "Just Created"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			this.oAppVariantOverviewDialog = new AppVariantOverviewDialog({
				idRunningApp: "id1"
			});

			sandbox.stub(AppVariantUtils, "getNewAppVariantId").returns("id2");

			this.oAppVariantOverviewDialog.open();
			this.oAppVariantOverviewDialog.oPopup.attachOpened(function() {
				assert.ok(true, "then the app variant overview dialog displays the reference app (currently adapting) entry and a new created app variant with blue highlighter");
				done();
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
