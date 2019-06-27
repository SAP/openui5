/* global QUnit  */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/ui/rta/appVariant/AppVariantOverviewDialog",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/Stack",
	"sap/ui/core/Control",
	"sap/ui/core/Manifest",
	"sap/base/Log",
	"sap/base/util/UriParameters"
], function (
	jQuery,
	sinon,
	RtaAppVariantFeature,
	AppVariantOverviewUtils,
	AppVariantUtils,
	AppVariantManager,
	S4HanaCloudBackend,
	AppVariantOverviewDialog,
	DescriptorVariantFactory,
	Settings,
	FlUtils,
	Stack,
	Control,
	Manifest,
	Log,
	UriParameters
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		afterEach : function () {
			sandbox.restore();
		},
		after: function() {
			jQuery("#sapUiBusyIndicator").hide();
		}
	}, function () {
		QUnit.test("when isManifestSupported() is called,", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			var fnGetManifirstSupport = sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves({response: true});

			return RtaAppVariantFeature.isManifestSupported().then(function(bSuccess) {
				assert.ok(fnGetManifirstSupport.calledWith("BaseAppId"), "then getManifirstSupport is called with correct parameters");
				assert.equal(bSuccess, true, "then the manifirst is supported");
			});
		});

		QUnit.test("when isManifestSupported() is called and failed", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			var fnGetManifirstSupport = sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.reject("Server error"));
			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Server error").returns();

			return RtaAppVariantFeature.isManifestSupported().catch(function(bSuccess) {
				assert.ok(fnGetManifirstSupport.calledWith("BaseAppId"), "then getManifirstSupport is called with correct parameters");
				assert.equal(bSuccess, false, "then the error happened");
			});
		});

		QUnit.test("when getAppVariantDescriptor() is called and promise resolved with an app variant descriptor", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "customer.app.var.id"
				}
			};

			var oRootControl = new Control();

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			var oDummyAppVarDescr = {
				hugo: "foo"
			};
			var oAppVarDescrStub = sandbox.stub(AppVariantUtils, "getDescriptorFromLREP").resolves(oDummyAppVarDescr);

			return RtaAppVariantFeature.getAppVariantDescriptor(oRootControl).then(function() {
				assert.ok(oAppVarDescrStub.calledOnce, "then the getDescriptorFromLREP is called once");
				assert.equal(oAppVarDescrStub.firstCall.args[0], "customer.app.var.id", "the application id was passed correctly");
			});
		});

		QUnit.test("when getAppVariantDescriptor() is called and promise resolved", function(assert) {
			var oMockedDescriptorData = {
				id: "customer.app.var.id"
			};

			var oRootControl = new Control();

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			var oDummyAppVarDescr = {
				hugo: "foo"
			};
			var oAppVarDescrStub = sandbox.stub(AppVariantUtils, "getDescriptorFromLREP").resolves(oDummyAppVarDescr);

			return RtaAppVariantFeature.getAppVariantDescriptor(oRootControl).then(function(oAppVarDescr) {
				assert.ok(oAppVarDescrStub.notCalled, "then the getDescriptorFromLREP is not called");
				assert.equal(oAppVarDescr, false, "then the app variant descriptor is false");
			});
		});

		QUnit.test("when onGetOverview() is called,", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "id1"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);

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

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(aAppVariantOverviewAttributes);

			return RtaAppVariantFeature.onGetOverview(true).then(function(oAppVariantOverviewDialog) {
				assert.ok(true, "the the promise got resolved and AppVariant Overview Dialog is opened");
				oAppVariantOverviewDialog.fireCancel();
			});
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is true,", function(assert) {
			var oStub = sandbox.stub(UriParameters.prototype, "get");
			oStub.withArgs("sap-ui-xx-app-variant-overview-extended").returns(["true"]);
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), true, "then the app variant overview is shown both for key user and SAP developer");
			oStub.restore();
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is false,", function(assert) {
			var oStub = sandbox.stub(UriParameters.prototype, "get");
			oStub.withArgs("sap-ui-xx-app-variant-overview-extended").returns(["false"]);
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), false, "then the app variant overview is shown only for key user");
			oStub.restore();
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(FlUtils, "getUshellContainer").returns(false);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(FlUtils, "getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(FlUtils, "getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(true);

			var oRootControl = new Control();
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);

			sandbox.stub(FlUtils, "getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");
			var oRootControl = new Control();
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(FlUtils, "getUshellContainer").returns(true);

			sandbox.stub(AppVariantUtils, "isStandAloneApp").returns(false);

			var fnInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, "CUSTOMER", oStack), true, "then the 'i' button is visible");
			assert.equal(fnInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
		});
	});

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		beforeEach : function() {
			this.oServer = sinon.fakeServer.create();

			window.bUShellNavigationTriggered = false;
			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = Object.assign({}, sap.ushell, {
				Container : {
					getService : function() {
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
		afterEach : function() {
			this.oServer.restore();
			sandbox.restore();
			sap.ushell = this.originalUShell;
			delete window.bUShellNavigationTriggered;
		},
		after: function() {
			jQuery("#sapUiBusyIndicator").hide();
		}
	}, function() {
		QUnit.test("when onSaveAsFromOverviewDialog() method is called on S/4HANA on Premise", function(assert) {
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

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			var fnProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var fnCreateDescriptorSpy = sandbox.spy(AppVariantManager.prototype, "createDescriptor");
			var fnSaveAppVariantToLREP = sandbox.stub(AppVariantManager.prototype, "saveAppVariantToLREP").resolves();
			var fnCopyUnsavedChangesToLREP = sandbox.stub(AppVariantManager.prototype, "copyUnsavedChangesToLREP").resolves();
			var fnshowSuccessMessage = sandbox.stub(AppVariantManager.prototype, "showSuccessMessage").resolves();
			var fnOnGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var fnTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var fnNotifyKeyUserWhenPublishingIsReadySpy = sandbox.spy(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");
			var fnNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onSaveAsFromOverviewDialog(oDescriptor, false).then(function() {
				assert.ok(fnProcessSaveAsDialog.calledOnce, "then the processSaveAsDialog method is called once");
				assert.ok(fnCreateDescriptorSpy.calledOnce, "then the create descriptor method is called once");
				assert.ok(fnSaveAppVariantToLREP.calledOnce, "then the saveAppVariantToLREP method is called once");
				assert.ok(fnCopyUnsavedChangesToLREP.calledOnce, "then the copyUnsavedChangesToLREP method is called once");
				assert.ok(fnshowSuccessMessage.calledOnce, "then the showSuccessMessage method is called once");
				assert.ok(fnOnGetOverviewSpy.calledOnce, "then the overview opens only once after the new app variant has been saved to LREP");
				assert.ok(fnNavigateToFLPHomepage.notCalled, "then the navigateToFLPHomepage method is not called once");
				assert.ok(fnTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is not called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReadySpy.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
			});
		});

		QUnit.test("when onSaveAsFromOverviewDialog() method is called on S/4HANA Cloud", function(assert) {
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

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			var fnProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var fnCreateDescriptorSpy = sandbox.spy(AppVariantManager.prototype, "createDescriptor");
			var fnSaveAppVariantToLREP = sandbox.stub(AppVariantManager.prototype, "saveAppVariantToLREP").resolves();
			var fnCopyUnsavedChangesToLREP = sandbox.stub(AppVariantManager.prototype, "copyUnsavedChangesToLREP").resolves();
			var fnshowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			//var onGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var fnTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({response : {IAMId : "IAMId"}});
			var fnNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			return RtaAppVariantFeature.onSaveAsFromOverviewDialog(oDescriptor, false).then(function() {
				assert.ok(fnProcessSaveAsDialog.calledOnce, "then the processSaveAsDialog method is called once");
				assert.ok(fnCreateDescriptorSpy.calledOnce, "then the create descriptor method is called once");
				assert.ok(fnSaveAppVariantToLREP.calledOnce, "then the saveAppVariantToLREP method is called once");
				assert.ok(fnCopyUnsavedChangesToLREP.calledOnce, "then the copyUnsavedChangesToLREP method is called once");
				assert.ok(fnshowSuccessMessage.calledTwice, "then the showSuccessMessage method is called twice");
				assert.ok(fnTriggerCatalogPublishing.calledOnce, "then the triggerCatalogPublishing method is not called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReady.calledOnce, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				//assert.ok(onGetOverviewSpy.calledTwice, "then the overview opens once after the new app variant has been saved to LREP, and once after the publishing is finished");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar on S/4HANA on Premise", function(assert) {
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oDescriptor);

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IAMId").returns();

			var fnProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var fnCreateDescriptorSpy = sandbox.spy(AppVariantManager.prototype, "createDescriptor");
			var fnSaveAppVariantToLREP = sandbox.stub(AppVariantManager.prototype, "saveAppVariantToLREP").resolves();
			var fnCopyUnsavedChangesToLREP = sandbox.stub(AppVariantManager.prototype, "copyUnsavedChangesToLREP").resolves();
			var fnshowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var fnNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();
			var fnTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var fnNotifyKeyUserWhenPublishingIsReadySpy = sandbox.spy(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");
			var onGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();

			return RtaAppVariantFeature.onSaveAsFromRtaToolbar(true, true).then(function() {
				assert.ok(fnProcessSaveAsDialog.calledOnce, "then the processSaveAsDialog method is called once");
				assert.ok(fnCreateDescriptorSpy.calledOnce, "then the create descriptor method is called once");
				assert.ok(fnSaveAppVariantToLREP.calledOnce, "then the saveAppVariantToLREP method is called once");
				assert.ok(fnCopyUnsavedChangesToLREP.calledOnce, "then the copyUnsavedChangesToLREP method is called once");
				assert.ok(fnshowSuccessMessage.calledOnce, "then the showSuccessMessage method is called once");
				assert.ok(onGetOverviewSpy.notCalled, "then the overview is not opened");
				assert.ok(fnNavigateToFLPHomepage.calledOnce, "then the _navigateToFLPHomepage method is called once");
				assert.ok(fnTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is not called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReadySpy.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar on S/4HANA Cloud", function(assert) {
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

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oDescriptor);

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IAMId").returns();

			var fnProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var fnCreateDescriptorSpy = sandbox.spy(AppVariantManager.prototype, "createDescriptor");
			var fnSaveAppVariantToLREP = sandbox.stub(AppVariantManager.prototype, "saveAppVariantToLREP").resolves();
			var fnCopyUnsavedChangesToLREP = sandbox.stub(AppVariantManager.prototype, "copyUnsavedChangesToLREP").resolves();
			var fnshowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var fnTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({response : {IAMId : "IAMId"}});
			var fnNotifyKeyUserWhenPublishingIsReadySpy = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var fnNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onSaveAsFromRtaToolbar(true, true).then(function() {
				assert.ok(fnProcessSaveAsDialog.calledOnce, "then the processSaveAsDialog method is called once");
				assert.ok(fnCreateDescriptorSpy.calledOnce, "then the create descriptor method is called once");
				assert.ok(fnSaveAppVariantToLREP.calledOnce, "then the saveAppVariantToLREP method is called once");
				assert.ok(fnCopyUnsavedChangesToLREP.calledOnce, "then the copyUnsavedChangesToLREP method is called once");
				assert.ok(fnshowSuccessMessage.calledTwice, "then the showSuccessMessage method is called twice");
				assert.ok(fnTriggerCatalogPublishing.calledOnce, "then the triggerCatalogPublishing method is not called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReadySpy.calledOnce, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.ok(fnNavigateToFLPHomepage.calledOnce, "then the _navigateToFLPHomepage method is called once");
			});
		});

		QUnit.test("when onDeleteFromOverviewDialog() method is called on S4/Hana Cloud with published catalogs", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(DescriptorVariantFactory, "_getDescriptorVariant").resolves({response: JSON.stringify(oDescriptor)});

			var oPublishingResponse = {
				response: {
					IAMId : "IAMId",
					inProgress : true
				}
			};
			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "testId"}});
			sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var fnShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var fnCreateDeletionSpy = sandbox.spy(AppVariantUtils, "createDeletion");
			var fnTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves(oPublishingResponse);
			var fnNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var fnTriggerDeleteAppVariantFromLREP = sandbox.stub(AppVariantUtils, "triggerDeleteAppVariantFromLREP").resolves();



			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", false).then(function() {
				//assert.ok(onGetOverviewSpy.calledOnce, "then the App variant dialog gets opened when the polling starts");
				assert.ok(fnCreateDeletionSpy.calledOnce, "then the create deletion method is called once");
				assert.ok(fnShowMessageStub.calledOnce, "then the showMessage method is called once");
				assert.ok(fnTriggerCatalogPublishing.calledOnce, "then the triggerCatalogPublishing method is called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReady.calledOnce, "then the notifyKeyUserWhenPublishingIsReady method is called once");
				assert.ok(fnTriggerDeleteAppVariantFromLREP.calledOnce, "then the triggerDeleteAppVariantFromLREP method is called once");
			});
		});

		QUnit.test("when onDeleteFromOverviewDialog() method is called on S4/Hana Cloud with unpublished catalogs", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(DescriptorVariantFactory, "_getDescriptorVariant").resolves({response: JSON.stringify(oDescriptor)});

			var oPublishingResponse = {
				response: {
					IAMId : "IAMId",
					inProgress : false
				}
			};
			sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var fnShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var fnCreateDeletionSpy = sandbox.spy(AppVariantUtils, "createDeletion");
			var fnTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves(oPublishingResponse);
			var fnNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var fnTriggerDeleteAppVariantFromLREP = sandbox.stub(AppVariantUtils, "triggerDeleteAppVariantFromLREP").resolves();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", false).then(function() {
				//assert.ok(onGetOverviewSpy.calledOnce, "then the App variant dialog gets opened when the polling starts");
				assert.ok(fnCreateDeletionSpy.calledOnce, "then the create deletion method is called once");
				assert.ok(fnShowMessageStub.calledOnce, "then the showMessage method is called once");
				assert.ok(fnTriggerCatalogPublishing.calledOnce, "then the triggerCatalogPublishing method is called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReady.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called");
				assert.ok(fnTriggerDeleteAppVariantFromLREP.calledOnce, "then the triggerDeleteAppVariantFromLREP method is called once");
			});
		});

		QUnit.test("when onDeleteFromOverviewDialog() method is called on S4/Hana on Premise", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(DescriptorVariantFactory, "_getDescriptorVariant").resolves({response: JSON.stringify(oDescriptor)});

			sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var fnShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var fnCreateDeletionSpy = sandbox.spy(AppVariantUtils, "createDeletion");
			var fnTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var fnNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");
			var fnTriggerDeleteAppVariantFromLREP = sandbox.stub(AppVariantUtils, "triggerDeleteAppVariantFromLREP").resolves();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", false).then(function() {
				//assert.ok(onGetOverviewSpy.calledOnce, "then the App variant dialog gets opened when the polling starts");
				assert.ok(fnCreateDeletionSpy.calledOnce, "then the create deletion method is called once");
				assert.ok(fnShowMessageStub.notCalled, "then the showMessage method is called once");
				assert.ok(fnTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReady.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called");
				assert.ok(fnTriggerDeleteAppVariantFromLREP.calledOnce, "then the triggerDeleteAppVariantFromLREP method is called once");
			});
		});

		QUnit.test("when onDeleteFromOverviewDialog() method is called on S4/Hana on Premise from currently adapting app variant", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(DescriptorVariantFactory, "_getDescriptorVariant").resolves({response: JSON.stringify(oDescriptor)});

			sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var fnShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage");
			var fnCreateDeletionSpy = sandbox.spy(AppVariantUtils, "createDeletion");
			var fnTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var fnNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");
			var fnTriggerDeleteAppVariantFromLREP = sandbox.stub(AppVariantUtils, "triggerDeleteAppVariantFromLREP").resolves();
			var fnNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", true).then(function() {
				//assert.ok(onGetOverviewSpy.calledOnce, "then the App variant dialog gets opened when the polling starts");
				assert.ok(fnCreateDeletionSpy.calledOnce, "then the create deletion method is called once");
				assert.ok(fnShowMessageStub.notCalled, "then the showMessage method is called once");
				assert.ok(fnTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is called once");
				assert.ok(fnNotifyKeyUserWhenPublishingIsReady.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called");
				assert.ok(fnTriggerDeleteAppVariantFromLREP.calledOnce, "then the triggerDeleteAppVariantFromLREP method is called once");
				assert.ok(fnNavigateToFLPHomepage.calledOnce, "then the navigateToFLPHomepage() method is called once");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
