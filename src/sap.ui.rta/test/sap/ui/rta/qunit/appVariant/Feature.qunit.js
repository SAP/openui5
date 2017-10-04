/* global QUnit  */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/thirdparty/sinon",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/AppVariantManager"
], function(
	sinon,
	RtaAppVariantFeature,
	AppVariantOverviewUtils,
	AppVariantUtils,
	AppVariantManager) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		afterEach : function(assert) {
			sandbox.restore();
		}
	}, function() {

		QUnit.test("when onGetOverview() is called,", function(assert) {
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
					referenceId : "referenceId1",
					isReference : true,
					typeOfApp : "Reference",
					descriptorUrl : "url1"
				},
				{
					appId : "id2",
					title : "title2",
					subTitle : "subTitle2",
					description : "description2",
					icon : "sap-icon://history",
					referenceId : "referenceId2",
					isReference : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url2"
				},
				{
					appId : "id3",
					title : "title3",
					subTitle : "subTitle3",
					description : "description3",
					icon : "sap-icon://history",
					referenceId : "referenceId3",
					isReference : false,
					typeOfApp : "App Variant",
					descriptorUrl : "url3"
				}
			];

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").returns(Promise.resolve(aAppVariantOverviewAttributes));

			var oRootControl = new sap.ui.core.Control();
			return RtaAppVariantFeature.onGetOverview(oRootControl).then(function(oManageAppsDialog) {
				assert.ok(true, "the the promise got resolved and manageAppsDialog is opened");
				oManageAppsDialog.fireCancel();
			});
		});

		QUnit.test("when isPlatFormEnabled() is called for FLP apps on S/4 Hana platform with feature flag 'sap-ui-xx-rta-save-as' equal to true", function(assert) {
			var oMockedDescriptorData = {
				"sap.ui5": {
					componentName: "BaseAppId"
				},
				"sap.app": {
					title: "BaseAppTitle",
					subTitle: "BaseAppSubtitle",
					description: "BaseAppDescription",
					id: "BaseAppId",
					crossNavigation: {
						inbounds: {}
					}
				},
				"sap.ui": {
					icons: {
						icon: "sap-icon://history"
					}
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			var oMockedUriParams = {
				mParams: {
					"sap-ui-xx-rta-save-as": ["true"]
				}
			};

			sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

			sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});

			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
				assert.equal(bResult, true, "then the 'i' button is visible");
			});
		});

		QUnit.test("when isPlatFormEnabled() is called for non FLP apps on S/4 Hana platform", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(false);
			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

			return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
				assert.equal(bResult, false, "then the 'i' button is not visible");
			});
		});

		QUnit.test("when isPlatFormEnabled() is called for scaffolding apps", function(assert) {

			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: false}));

			return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
				assert.equal(bResult, false, "then the 'i' button is not visible");
			});
		});

		QUnit.test("when isPlatFormEnabled() is called for non FLP apps on S/4 Hana platform with feature flag 'sap-ui-xx-rta-save-as' equal to false", function(assert) {
			var oMockedDescriptorData = {
				"sap.ui5": {
					componentName: "BaseAppId"
				},
				"sap.app": {
					title: "BaseAppTitle",
					subTitle: "BaseAppSubtitle",
					description: "BaseAppDescription",
					id: "BaseAppId",
					crossNavigation: {
						inbounds: {}
					}
				},
				"sap.ui": {
					icons: {
						icon: "sap-icon://history"
					}
				}
			};

			var oMockedUriParams = {
				mParams: {
					"sap-ui-xx-rta-save-as": ["false"]
				}
			};

			sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

			sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});
			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
				assert.equal(bResult, false, "then the 'i' button is not visible");
			});
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

			var oMockedUriParams = {
				mParams: {
					"sap-ui-xx-rta-save-as": ["true"]
				}
			};

			sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

			sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});
			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
				assert.equal(bResult, false, "then the 'i' button is not visible");
			});
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

			var oMockedUriParams = {
				mParams: {
					"sap-ui-xx-rta-save-as": ["true"]
				}
			};

			sandbox.stub(jQuery.sap, "getUriParameters").returns(oMockedUriParams);

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

			sandbox.stub(AppVariantUtils, "getInboundInfo").returns({currentRunningInbound: "testInboundId", addNewInboundRequired: true});
			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);

			return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", true).then(function(bResult) {
				assert.equal(bResult, false, "then the 'i' button is not visible");
			});
		});

		QUnit.test("when isPlatFormEnabled() is called with no isPlatFormEnabled support (NON S/4 Hana Cloud systems)", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(sap.ui.rta.Utils,"getUshellContainer").returns(true);
			sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.resolve({response: true}));

			return RtaAppVariantFeature.isPlatFormEnabled("CUSTOMER", false).then(function(bResult) {
				assert.equal(bResult, false, "then the 'i' button is not visible");
			});
		});
	});

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		beforeEach : function(assert) {
			this.oServer = sinon.fakeServer.create();

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoAvailable\":\"true\",\"isKeyUser\":\"true\",\"isProductiveSystem\":\"false\",\"localonly\":false} }"
			]);

			this.oServer.autoRespond = true;

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

		QUnit.test("when onSaveAs() is triggered from App variant overview list", function(assert) {
			var oRootControl = new sap.ui.core.Control();

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

			sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").returns(Promise.resolve(oAppVariantData));

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				appVersion: "1.2.3",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			var onGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").returns(Promise.resolve(true));

			return RtaAppVariantFeature.onSaveAs(oRootControl, oDescriptor).then(function() {
				assert.ok(onGetOverviewSpy.calledOnce, "then the App variant dialog gets opened only once after the new app variant has been saved to LREP");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar and user passed no information on 'Save As' dialog", function(assert) {
			var oRootControl = new sap.ui.core.Control();

			sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").returns(Promise.resolve(false));

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var createDescriptorSpy = sandbox.stub(AppVariantManager.prototype, "createDescriptor");

			return RtaAppVariantFeature.onSaveAs(oRootControl).then(function() {
				assert.ok(createDescriptorSpy.notCalled, "then the app variant was never created");
			});
		});
	});
});
