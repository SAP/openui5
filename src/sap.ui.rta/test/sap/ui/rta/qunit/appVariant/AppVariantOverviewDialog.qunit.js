/* global QUnit */

sap.ui.define([
	"sap/ui/rta/appVariant/AppVariantOverviewDialog",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	AppVariantOverviewDialog,
	AppVariantOverviewUtils,
	AppVariantUtils,
	FlUtils,
	AppVariantWriteAPI,
	Settings,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function stubUshellContainer(iNumberOfTargetMappings) {
		var oUshellContainerStub = {
			getServiceAsync() {
				return Promise.resolve({
					getLinks() {
						return [Array(iNumberOfTargetMappings)];
					}
				});
			}
		};
		sandbox.stub(FlUtils, "getUshellContainer").returns(oUshellContainerStub);
	}

	function simulateOnPremSystemConfig() {
		sandbox.stub(Settings, "getInstance").resolves(
			new Settings({
				isKeyUser: true,
				isAtoAvailable: false,
				isAtoEnabled: false,
				isProductiveSystem: false
			})
		);
	}

	QUnit.module("Given that a AppVariantOverviewDialog is available and getAppVariantOverview method is filled", {
		beforeEach() {
			simulateOnPremSystemConfig();
			const aAppVariantOverviewAttributes = [
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
					descriptorUrl: "url2",
					hasStartableIntent: true,
					startWith: {
						semanticObject: "semObj",
						action: "action",
						parameters: {
							"sap-appvar-id": {
								value: "id2",
								required: true
							}
						}
					}
				},
				{
					appId: "id3",
					title: "title3",
					subTitle: "subTitle3",
					description: "description3",
					icon: "sap-icon://history",
					isOriginal: false,
					descriptorUrl: "url3",
					hasStartableIntent: true,
					startWith: {
						semanticObject: "semObj",
						action: "action",
						parameters: {
							"sap-appvar-id": {
								value: "id3",
								required: true
							}
						}
					}
				}
			];
			sandbox.stub(AppVariantWriteAPI, "listAllAppVariants").resolves({response: {items: aAppVariantOverviewAttributes}});
		},
		afterEach() {
			this.oAppVariantOverviewDialog.destroy();
			sandbox.restore();
		},
		after() {
			if (document.getElementById("sapUiBusyIndicator")) {
				document.getElementById("sapUiBusyIndicator").style.display = "none";
			}
		}
	}, function() {
		QUnit.test("when AppVariantOverviewDialog gets opened from an original app with two app variants and all app variants have no target mapping assigned,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};
			sandbox.stub(FlUtils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);
			stubUshellContainer(0);

			this.oAppVariantOverviewDialog = new AppVariantOverviewDialog("appVariantOverviewTest", {
				idRunningApp: "id1",
				isOverviewForKeyUser: true
			});

			this.oAppVariantOverviewDialog.open();
			this.oRootControl = this.oAppVariantOverviewDialog.getContent()[0].getComponentInstance().getRootControl();
			this.oRootControl.attachModelContextChange(function() {
				const aResultAttributes = this.oRootControl.getModel().getProperty("/appVariants");
				assert.equal(aResultAttributes.length, 3, "then the app variant overview dialog contains 3 entries");
				const oOriginalApp = aResultAttributes[0];
				assert.equal(oOriginalApp.adaptUIButtonVisibility, false, "original app has no visible 'AdapUI' button");
				assert.equal(oOriginalApp.delAppVarButtonVisibility, false, "original app has no visible 'Delete' button");
				const oAppVar1 = aResultAttributes[1];
				assert.equal(oAppVar1.adaptUIButtonVisibility, true, "app variant 1 has visible 'AdapUI' button");
				assert.equal(oAppVar1.adaptUIButtonEnabled, false, "app variant 1 has disabled 'AdapUI' button");
				assert.equal(oAppVar1.delAppVarButtonVisibility, true, "app variant 1 has visible 'Delete' button");
				assert.equal(oAppVar1.delAppVarButtonEnabled, true, "app variant 1 has enabled 'Delete' button");
				const oAppVar2 = aResultAttributes[2];
				assert.equal(oAppVar2.adaptUIButtonVisibility, true, "app variant 2 has visible 'AdapUI' button");
				assert.equal(oAppVar2.adaptUIButtonEnabled, false, "app variant 2 has disabled 'AdapUI' button");
				assert.equal(oAppVar2.delAppVarButtonVisibility, true, "app variant 2 has visible 'Delete' button");
				assert.equal(oAppVar2.delAppVarButtonEnabled, true, "app variant 2 has enabled 'Delete' button");
				done();
			}.bind(this));
		});

		QUnit.test("when AppVariantOverviewDialog gets opened from an original app with two app variants and all app variants have one target mapping assigned,", function(assert) {
			var done = assert.async();
			var oReferenceAppMockedDescriptor = {
				"sap.app": {
					id: "id1"
				}
			};
			sandbox.stub(FlUtils, "getAppDescriptor").returns(oReferenceAppMockedDescriptor);
			stubUshellContainer(1);

			this.oAppVariantOverviewDialog = new AppVariantOverviewDialog("appVariantOverviewTest", {
				idRunningApp: "id1",
				isOverviewForKeyUser: true
			});

			this.oAppVariantOverviewDialog.open();
			this.oRootControl = this.oAppVariantOverviewDialog.getContent()[0].getComponentInstance().getRootControl();
			this.oRootControl.attachModelContextChange(function() {
				const aResultAttributes = this.oRootControl.getModel().getProperty("/appVariants");
				assert.equal(aResultAttributes.length, 3, "then the app variant overview dialog contains 3 entries");
				const oOriginalApp = aResultAttributes[0];
				assert.equal(oOriginalApp.adaptUIButtonVisibility, false, "original app has no visible 'AdapUI' button");
				assert.equal(oOriginalApp.delAppVarButtonVisibility, false, "original app has no visible 'Delete' button");
				const oAppVar1 = aResultAttributes[1];
				assert.equal(oAppVar1.adaptUIButtonVisibility, true, "app variant 1 has visible 'AdapUI' button");
				assert.equal(oAppVar1.adaptUIButtonEnabled, true, "app variant 1 has enabled 'AdapUI' button");
				assert.equal(oAppVar1.delAppVarButtonVisibility, true, "app variant 1 has visible 'Delete' button");
				assert.equal(oAppVar1.delAppVarButtonEnabled, false, "app variant 1 has disabled 'Delete' button");
				const oAppVar2 = aResultAttributes[2];
				assert.equal(oAppVar2.adaptUIButtonVisibility, true, "app variant 2 has visible 'AdapUI' button");
				assert.equal(oAppVar2.adaptUIButtonEnabled, true, "app variant 2 has enabled 'AdapUI' button");
				assert.equal(oAppVar2.delAppVarButtonVisibility, true, "app variant 2 has visible 'Delete' button");
				assert.equal(oAppVar2.delAppVarButtonEnabled, false, "app variant 2 has disabled 'Delete' button");
				done();
			}.bind(this));
		});
	});

	QUnit.module("Given that a AppVariantOverviewDialog is available", {
		afterEach() {
			this.oAppVariantOverviewDialog.destroy();
			sandbox.restore();
		},
		after() {
			if (document.getElementById("sapUiBusyIndicator")) {
				document.getElementById("sapUiBusyIndicator").style.display = "none";
			}
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

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});