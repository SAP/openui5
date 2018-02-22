/* global QUnit  */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/thirdparty/sinon",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/fl/registry/Settings",
	"sap/ui/rta/command/Stack"
], function(
	sinon,
	RtaAppVariantFeature,
	AppVariantOverviewUtils,
	AppVariantUtils,
	AppVariantManager,
	Settings,
	Stack
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		afterEach : function(assert) {
			sandbox.restore();
		}
	}, function() {

		QUnit.test("when onGetOverview() is called,", function(assert) {
			var done = assert.async();

			var oMockedDescriptorData = {
				"sap.app": {
					id: "id1"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			var aAppVariantOverviewAttributes = [
				{
					appId : "id1",
					title : "title1",
					subTitle : "subTitle1",
					description : "description1",
					icon : "sap-icon://history",
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
					isOriginal : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url3"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			return RtaAppVariantFeature.onGetOverview(true).then(function(oAppVariantOverviewDialog) {
				assert.ok(true, "the the promise got resolved and AppVariant Overview Dialog is opened");
				oAppVariantOverviewDialog.fireCancel();
				done();
			});
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is true,", function(assert) {
			var oMockedUriParams = {
				mParams: {
					"sap-ui-xx-app-variant-overview-extended": ["true"]
				}
			};

			sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), true, "then the app variant overview is shown both for key user and SAP developer");
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is false,", function(assert) {
			var oMockedUriParams = {
				mParams: {
					"sap-ui-xx-app-variant-overview-extended": ["false"]
				}
			};

			sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), false, "then the app variant overview is shown only for key user");
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is not given at all,", function(assert) {
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), false, "then the app variant overview is shown only for key user");
		});

		QUnit.test("when isPlatFormEnabled() is called for non FLP apps", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(false);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new sap.ui.core.Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, "CUSTOMER", oStack), false, "then the 'i' button is not visible");
			assert.equal(fnInboundInfoSpy.callCount, 0, "then the getInboundInfo is never called");
		});

		QUnit.test("when isPlatFormEnabled() is called for FLP apps", function(assert) {

			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new sap.ui.core.Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, "CUSTOMER", oStack), true, "then the 'i' button is visible");
			assert.ok(fnInboundInfoSpy.calledOnce, "then the getInboundInfo is called once");
			assert.equal(fnInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
		});

		QUnit.test("when isPlatFormEnabled() is called for standalone apps", function(assert) {

			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(true);

			var oRootControl = new sap.ui.core.Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, "CUSTOMER", oStack), false, "then the 'i' button is not visible");
		});

		QUnit.test("when isPlatFormEnabled() is called for an FLP app which has no crossNavigation in 'sap.app' property of a descriptor", function(assert) {
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

			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");
			var oRootControl = new sap.ui.core.Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, "CUSTOMER", oStack), true, "then the 'i' button is visible");
			assert.equal(fnInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
		});

		QUnit.test("when isPlatFormEnabled() is called for FLP app which has no 'sap.app' property of a descriptor", function(assert) {
			var oMockedDescriptorData = {
				"sap.ui5": {
					componentName: "BaseAppId"
				},
				"sap.ui": {
					icons: {
						icon: "sap-icon://history"
					}
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);
			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new sap.ui.core.Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, "CUSTOMER", oStack), false, "then the 'i' button is not visible");
			assert.equal(fnInboundInfoSpy.callCount, 0, "then the getInboundInfo method is never called");
		});

		QUnit.test("when isPlatFormEnabled() is called and it is an flp app, not a standalone app and no cross navigation property", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new sap.ui.core.Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, "CUSTOMER", oStack), true, "then the 'i' button is visible");
			assert.equal(fnInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
		});
	});

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		beforeEach : function(assert) {
			this.oServer = sinon.fakeServer.create();

			window.bUShellNavigationTriggered = false;
			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = jQuery.extend({}, sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							},
							getHash : function() {
								return "Action-somestring";
							},
							parseShellHash : function() {
								return {
									semanticObject : "Action",
									action : "somestring"
								};
							}
						};
					},
					setDirtyFlag : function() {
						return "";
					}
				}
			});
		},
		afterEach : function(assert) {
			this.oServer.restore();
			sandbox.restore();
			sap.ushell = this.originalUShell;
			delete window.bUShellNavigationTriggered;
		}
	}, function() {

		QUnit.test("when onSaveAsFromOverviewDialog() method is called", function(assert) {
			var done = assert.async();
			var oDescriptor = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				idBaseApp: "BaseAppId",
				idRunningApp: "RunningAppId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			var fnProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").returns(Promise.resolve(oAppVariantData));

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				appVersion: "1.2.3",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns({
				"sap.app": {
					id: "TestId"
				}
			});

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			var onGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").returns(Promise.resolve());

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			var oResponse = {
				"transports": [{
					"transportId": "4711",
					"owner": "TESTUSER",
					"description": "test transport1",
					"locked" : true
				}]
			};

			this.oServer.respondWith("GET", /\/sap\/bc\/lrep\/actions\/gettransports/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse)
			]);

			this.oServer.respondWith("HEAD", /\/sap\/bc\/lrep\/actions\/getcsrftoken/, [
				200,
				{
					"X-CSRF-Token": "0987654321"
				},
				""
			]);

			oResponse = {
				"id": "AppVariantId",
				"reference":"ReferenceAppId",
				"content": []
			};

			this.oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants/, [
				200,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				JSON.stringify(oResponse)
			]);

			oResponse = {
				response: {
					"VariantId" : "customer.TestId",
					"IAMId" : "IAMId",
					"CatalogIds" : ["TEST_CATALOG"]
				}
			};

			var fnTriggerCatalogAssignment = sandbox.stub(AppVariantManager.prototype, "triggerCatalogAssignment").returns(oResponse);

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());

			this.oServer.autoRespond = true;

			var fnCreateDescriptorSpy = sandbox.spy(AppVariantManager.prototype, "createDescriptor");
			var fnSaveAppVariantToLREP = sandbox.spy(AppVariantManager.prototype, "saveAppVariantToLREP");
			var fnCopyUnsavedChangesToLREP = sandbox.stub(AppVariantManager.prototype, "copyUnsavedChangesToLREP").returns(Promise.resolve());
			var fnShowSuccessMessageAndTriggerActionFlow = sandbox.spy(AppVariantManager.prototype, "showSuccessMessageAndTriggerActionFlow");

			var fnNotifyKeyUserWhenTileIsReadySpy = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenTileIsReady").returns(Promise.resolve());

			return RtaAppVariantFeature.onSaveAsFromOverviewDialog(oDescriptor, false).then(function() {
				assert.ok(onGetOverviewSpy.calledOnce, "then the App variant dialog gets opened only once after the new app variant has been saved to LREP");
				assert.ok(fnCreateDescriptorSpy.calledOnce, "then the create descriptor method is called once");
				assert.ok(fnProcessSaveAsDialog.calledOnce, "then the processSaveAsDialog method is called once");
				assert.ok(fnSaveAppVariantToLREP.calledOnce, "then the saveAppVariantToLREP method is called once");
				assert.ok(fnCopyUnsavedChangesToLREP.calledOnce, "then the copyUnsavedChangesToLREP method is called once");
				assert.ok(fnTriggerCatalogAssignment.calledOnce, "then the triggerCatalogAssignment method is called once");
				assert.ok(fnShowSuccessMessageAndTriggerActionFlow.calledOnce, "then the showSuccessMessageAndTriggerActionFlow method is called once");
				assert.ok(fnNotifyKeyUserWhenTileIsReadySpy.calledOnce, "then the notifyKeyUserWhenTileIsReady method is called once");
				done();
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar", function(assert) {
			var done = assert.async();
			var oDescriptor = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				},
				"sap.ui5" : {
					componentName: "TestIdBaseApp"
				}
			};

			var oAppVariantData = {
				idBaseApp: "BaseAppId",
				idRunningApp: "RunningAppId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			var fnProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").returns(Promise.resolve(oAppVariantData));

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				appVersion: "1.2.3",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oDescriptor);

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			var oResponse = {
				"transports": [{
					"transportId": "4711",
					"owner": "TESTUSER",
					"description": "test transport1",
					"locked" : true
				}]
			};

			this.oServer.respondWith("GET", /\/sap\/bc\/lrep\/actions\/gettransports/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse)
			]);

			this.oServer.respondWith("HEAD", /\/sap\/bc\/lrep\/actions\/getcsrftoken/, [
				200,
				{
					"X-CSRF-Token": "0987654321"
				},
				""
			]);

			oResponse = {
				"id": "AppVariantId",
				"reference":"ReferenceAppId",
				"content": []
			};

			this.oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants/, [
				200,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				JSON.stringify(oResponse)
			]);

			oResponse = {
				response: {
					"VariantId" : "customer.TestId",
					"IAMId" : "IAMId",
					"CatalogIds" : ["TEST_CATALOG"]
				}
			};

			var fnTriggerCatalogAssignment = sandbox.stub(AppVariantManager.prototype, "triggerCatalogAssignment").returns(oResponse);

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());

			this.oServer.autoRespond = true;


			var fnCreateDescriptorSpy = sandbox.spy(AppVariantManager.prototype, "createDescriptor");
			var fnSaveAppVariantToLREP = sandbox.spy(AppVariantManager.prototype, "saveAppVariantToLREP");
			var fnCopyUnsavedChangesToLREP = sandbox.stub(AppVariantManager.prototype, "copyUnsavedChangesToLREP").returns(Promise.resolve(true));
			var fnShowSuccessMessageAndTriggerActionFlow = sandbox.spy(AppVariantManager.prototype, "showSuccessMessageAndTriggerActionFlow");
			var fnNavigateToFLPHomepage = sandbox.stub(AppVariantManager.prototype, "_navigateToFLPHomepage").returns(Promise.resolve());

			return RtaAppVariantFeature.onSaveAsFromRtaToolbar(true, true).then(function() {
				assert.ok(fnCreateDescriptorSpy.calledOnce, "then the create descriptor method is called once");
				assert.ok(fnProcessSaveAsDialog.calledOnce, "then the processSaveAsDialog method is called once");
				assert.ok(fnSaveAppVariantToLREP.calledOnce, "then the saveAppVariantToLREP method is called once");
				assert.ok(fnCopyUnsavedChangesToLREP.calledOnce, "then the copyUnsavedChangesToLREP method is called once");
				assert.ok(fnTriggerCatalogAssignment.calledOnce, "then the triggerCatalogAssignment method is called once");
				assert.ok(fnShowSuccessMessageAndTriggerActionFlow.calledOnce, "then the showSuccessMessageAndTriggerActionFlow method is called once");
				assert.ok(fnNavigateToFLPHomepage.calledOnce, "then the _navigateToFLPHomepage method is called once");
				done();
			});
		});
	});
});
