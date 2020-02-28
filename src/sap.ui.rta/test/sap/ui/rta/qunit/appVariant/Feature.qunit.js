/* global QUnit  */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/Stack",
	"sap/ui/core/Control",
	"sap/base/Log",
	"sap/base/util/UriParameters",
	"sap/ui/core/Manifest",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/m/MessageBox"
], function (
	jQuery,
	sinon,
	RtaAppVariantFeature,
	AppVariantOverviewUtils,
	AppVariantUtils,
	AppVariantManager,
	DescriptorVariantFactory,
	Settings,
	Layer,
	FlUtils,
	Stack,
	Control,
	Log,
	UriParameters,
	Manifest,
	AppVariantWriteAPI,
	ChangesWriteAPI,
	MessageBox
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
			var oGetManifirstSupport = sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves({response: true});

			return RtaAppVariantFeature.isManifestSupported().then(function(bSuccess) {
				assert.ok(oGetManifirstSupport.calledWith("BaseAppId"), "then getManifirstSupport is called with correct parameters");
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
			var oGetManifirstSupport = sandbox.stub(AppVariantUtils, "getManifirstSupport").returns(Promise.reject("Server error"));
			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Server error").returns();

			return RtaAppVariantFeature.isManifestSupported().catch(function(bSuccess) {
				assert.ok(oGetManifirstSupport.calledWith("BaseAppId"), "then getManifirstSupport is called with correct parameters");
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
			var oLoadAppVariantStub = sandbox.stub(DescriptorVariantFactory, "loadAppVariant").resolves(oDummyAppVarDescr);

			return RtaAppVariantFeature.getAppVariantDescriptor(oRootControl).then(function() {
				assert.equal(oLoadAppVariantStub.callCount, 1, "then the loadAppVariant is called once");
				assert.equal(oLoadAppVariantStub.firstCall.args[0], "customer.app.var.id", "the application id was passed correctly");
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
			var oLoadAppVariantStub = sandbox.stub(DescriptorVariantFactory, "loadAppVariant").resolves(oDummyAppVarDescr);

			return RtaAppVariantFeature.getAppVariantDescriptor(oRootControl).then(function(oAppVarDescr) {
				assert.ok(oLoadAppVariantStub.notCalled, "then the getDescriptorFromLREP is not called");
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

			return RtaAppVariantFeature.onGetOverview(true, Layer.CUSTOMER).then(function(oAppVariantOverviewDialog) {
				assert.ok(true, "the the promise got resolved and AppVariant Overview Dialog is opened");
				oAppVariantOverviewDialog.fireCancel();
			});
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is true,", function(assert) {
			var oStub = sandbox.stub(UriParameters.prototype, "get");
			oStub.withArgs("sap-ui-xx-app-variant-overview-extended").returns("true");
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), true, "then the app variant overview is shown both for key user and SAP developer");
			oStub.restore();
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is false,", function(assert) {
			var oStub = sandbox.stub(UriParameters.prototype, "get");
			oStub.withArgs("sap-ui-xx-app-variant-overview-extended").returns("false");
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

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, Layer.CUSTOMER, oStack), false, "then the 'i' button is not visible");
			assert.equal(oInboundInfoSpy.callCount, 0, "then the getInboundInfo is never called");
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

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, Layer.CUSTOMER, oStack), true, "then the 'i' button is visible");
			assert.equal(oInboundInfoSpy.callCount, 1, "then the getInboundInfo is called once");
			assert.equal(oInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
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

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, Layer.CUSTOMER, oStack), false, "then the 'i' button is not visible");
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

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");
			var oRootControl = new Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, Layer.CUSTOMER, oStack), true, "then the 'i' button is visible");
			assert.equal(oInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
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
			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, Layer.CUSTOMER, oStack), false, "then the 'i' button is not visible");
			assert.equal(oInboundInfoSpy.callCount, 0, "then the getInboundInfo method is never called");
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

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			assert.equal(RtaAppVariantFeature.isPlatFormEnabled(oRootControl, Layer.CUSTOMER, oStack), true, "then the 'i' button is visible");
			assert.equal(oInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
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
						return false;
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
		var fnCreateAppComponent = function() {
			var oDescriptor = {
				"sap.app" : {
					id : "TestId",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};

			var oManifest = new Manifest(oDescriptor);
			var oAppComponent = {
				name: "testComponent",
				getManifest : function() {
					return oManifest;
				}
			};

			return oAppComponent;
		};

		QUnit.test("when onSaveAs() method is called and saving an app variant failed", function(assert) {
			var oSelectedAppVariant = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				idRunningApp: "TestId",
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

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(AppVariantManager.prototype, "getRootControl").returns(oAppComponent);
			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);

			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").returns(Promise.reject({saveAsFailed: true}));
			var oCatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", {saveAsFailed: true}).returns();

			var oGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();

			return RtaAppVariantFeature.onSaveAs(false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 10, "then ChangesWriteAPI.create method is called 10 times");
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oGetOverviewSpy.callCount, 1, "then the overview loads only once after the new app variant has been saved to LREP");
				assert.strictEqual(oCatchErrorDialog.getCall(0).args[1], "MSG_SAVE_APP_VARIANT_FAILED", "then the oCatchErrorDialog method is called with correct message key");
			});
		});

		QUnit.test("when onSaveAs() method is called on S/4HANA on Premise from Overview dialog", function(assert) {
			var oSelectedAppVariant = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				idRunningApp: "TestId",
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

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(AppVariantManager.prototype, "getRootControl").returns(oAppComponent);
			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});
			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessage = sandbox.stub(AppVariantManager.prototype, "showSuccessMessage").resolves();
			var oGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var oTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var oNotifyKeyUserWhenPublishingIsReadySpy = sandbox.spy(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");
			var oNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onSaveAs(false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 10, "then ChangesWriteAPI.create method is called " + oCreateChangesSpy.callCount + " times");
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.save method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 1, "then the showSuccessMessage method is called once");
				assert.equal(oGetOverviewSpy.callCount, 1, "then the overview loads only once after the new app variant has been saved to LREP");
				assert.ok(oNavigateToFLPHomepage.notCalled, "then the navigateToFLPHomepage method is not called once");
				assert.ok(oTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is not called once");
				assert.ok(oNotifyKeyUserWhenPublishingIsReadySpy.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
			});
		});

		QUnit.test("when onSaveAs() method is called on S/4HANA Cloud from Overview dialog", function(assert) {
			var oSelectedAppVariant = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				idRunningApp: "TestId",
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

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(AppVariantManager.prototype, "getRootControl").returns(oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});
			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview");
			oGetOverviewStub.onCall(0).resolves(RtaAppVariantFeature.onGetOverview.call(true, Layer.CUSTOMER));
			oGetOverviewStub.onCall(1).resolves();

			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({response : {IAMId : "IAMId"}});
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			return RtaAppVariantFeature.onSaveAs(false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 10, "then ChangesWriteAPI.create method is called " + oCreateChangesSpy.callCount + " times");
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 2, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oGetOverviewStub.callCount, 2, "then the overview loads only twice, once after triggering catalog assignment and once tile is created");
			});
		});


		QUnit.test("when onSaveAs() method is called on S/4HANA Cloud from Overview dialog and customer closes Overview during Polling", function(assert) {
			var oSelectedAppVariant = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				idRunningApp: "TestId",
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

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(AppVariantManager.prototype, "getRootControl").returns(oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});
			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();

			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({response : {IAMId : "IAMId"}});
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			return RtaAppVariantFeature.onSaveAs(false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 10, "then ChangesWriteAPI.create method is called " + oCreateChangesSpy.callCount + " times");
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 2, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oGetOverviewStub.callCount, 1, "then the overview loads only once after triggering catalog assignment, since it is closed it will not open again after success messagef");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar on S/4HANA on Premise", function(assert) {
			var oSelectedAppVariant = {
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
				idRunningApp: "RunningAppId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IAMId").returns();

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(AppVariantManager.prototype, "getRootControl").returns(oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});

			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();
			var oTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var oNotifyKeyUserWhenPublishingIsReadySpy = sandbox.spy(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");
			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();

			return RtaAppVariantFeature.onSaveAs(true, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 10, "then ChangesWriteAPI.create method is called " + oCreateChangesSpy.callCount + " times");
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 1, "then the showSuccessMessage method is called once");
				assert.ok(oGetOverviewStub.notCalled, "then the overview is not opened");
				assert.equal(oNavigateToFLPHomepage.callCount, 1, "then the _navigateToFLPHomepage method is called once");
				assert.ok(oTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is not called once");
				assert.ok(oNotifyKeyUserWhenPublishingIsReadySpy.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar on S/4HANA Cloud", function(assert) {
			var oSelectedAppVariant = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				idRunningApp: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});

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

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(AppVariantManager.prototype, "getRootControl").returns(oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});

			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessageStub = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({response : {IAMId : "IAMId"}});
			var oNotifyKeyUserWhenPublishingIsReadySpy = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var oNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onSaveAs(true, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 10, "then ChangesWriteAPI.create method is called " + oCreateChangesSpy.callCount + " times");
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessageStub.callCount, 2, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReadySpy.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oNavigateToFLPHomepage.callCount, 1, "then the _navigateToFLPHomepage method is called once");
			});
		});

		QUnit.test("when onDeleteFromOverviewDialog() method is called and failed", function(assert) {
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
			var oShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves(oPublishingResponse);
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var oDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").returns(Promise.reject("Delete Error"));

			var oCatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Delete Error").returns();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", false, Layer.CUSTOMER).then(function() {
				assert.equal(oDeleteAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.deleteAppVariant method is called once");
				assert.equal(oShowMessageStub.callCount, 1, "then the showMessage method is called once");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is called once");
				assert.strictEqual(oCatchErrorDialog.getCall(0).args[1], "MSG_DELETE_APP_VARIANT_FAILED", "then the oCatchErrorDialog method is called with correct message key");
				assert.strictEqual(oCatchErrorDialog.getCall(0).args[2], "AppVarId", "then the oCatchErrorDialog method is called with correct app var id");
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
			var oShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var oShowSuccessMessageStub = sandbox.stub(AppVariantManager.prototype, "showSuccessMessage").resolves();
			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves(oPublishingResponse);
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var oDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();

			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview");
			oGetOverviewStub.onCall(0).resolves(RtaAppVariantFeature.onGetOverview.call(true, Layer.CUSTOMER));
			oGetOverviewStub.onCall(1).resolves();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", false, Layer.CUSTOMER).then(function() {
				assert.equal(oDeleteAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.deleteAppVariant method is called once");
				assert.equal(oShowMessageStub.callCount, 1, "then the showMessage method is called once");
				assert.equal(oShowSuccessMessageStub.callCount, 1, "then the showSuccessMessage method is called once");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is called once");
				assert.equal(oGetOverviewStub.callCount, 2, "then the overview loads twice, once after triggering catalog unassignment and once deletion is done");
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
			var oShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var oShowSuccessMessageStub = sandbox.stub(AppVariantManager.prototype, "showSuccessMessage").resolves();
			var oDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();
			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves(oPublishingResponse);
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview");
			oGetOverviewStub.onCall(0).resolves(RtaAppVariantFeature.onGetOverview.call(true, Layer.CUSTOMER));
			oGetOverviewStub.onCall(1).resolves();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", false, Layer.CUSTOMER).then(function() {
				assert.equal(oDeleteAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.deleteAppVariant method is called once");
				assert.equal(oShowMessageStub.callCount, 1, "then the showMessage method is called once");
				assert.equal(oShowSuccessMessageStub.callCount, 1, "then the showSuccessMessage method is called once");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is called once");
				assert.ok(oNotifyKeyUserWhenPublishingIsReady.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called");
				assert.equal(oGetOverviewStub.callCount, 2, "then the overview loads twice, once after triggering catalog unassignment and once after the error message");
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

			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var oShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var oShowSuccessMessageStub = sandbox.stub(AppVariantManager.prototype, "showSuccessMessage").resolves();
			var oDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();
			var oTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", false, Layer.CUSTOMER).then(function() {
				assert.equal(oDeleteAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.deleteAppVariant method is called once");
				assert.ok(oShowMessageStub.notCalled, "then the showMessage method is called once");
				assert.equal(oShowSuccessMessageStub.callCount, 1, "then the showSuccessMessage method is called once");
				assert.ok(oTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is called once");
				assert.ok(oNotifyKeyUserWhenPublishingIsReady.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called");
				assert.equal(oGetOverviewStub.callCount, 1, "then the overview loads once after deletion is done");
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

			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var oShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage");
			var oShowSuccessMessageStub = sandbox.stub(AppVariantManager.prototype, "showSuccessMessage").resolves();
			var oDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();
			var oTriggerCatalogPublishing = sandbox.spy(AppVariantManager.prototype, "triggerCatalogPublishing");
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady");
			var oNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", true, Layer.CUSTOMER).then(function() {
				assert.equal(oDeleteAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.deleteAppVariant method is called once");
				assert.ok(oShowMessageStub.notCalled, "then the showMessage method is not called");
				assert.equal(oShowSuccessMessageStub.callCount, 1, "then the showSuccessMessage method is called once");
				assert.ok(oTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is called once");
				assert.ok(oNotifyKeyUserWhenPublishingIsReady.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called");
				assert.equal(oNavigateToFLPHomepage.callCount, 1, "then the navigateToFLPHomepage() method is called once");
				assert.ok(oGetOverviewStub.notCalled, "then the overview is not reloaded");
			});
		});

		QUnit.test("when onDeleteFromOverviewDialog() method is called on S4/Hana Cloud from currently adapting app variant", function(assert) {
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

			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var oShowMessageStub = sandbox.stub(AppVariantUtils, "showMessage").resolves();
			var oShowSuccessMessageStub = sandbox.stub(AppVariantManager.prototype, "showSuccessMessage").resolves();
			var oDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();
			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves(oPublishingResponse);
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var oNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onDeleteFromOverviewDialog("AppVarId", true, Layer.CUSTOMER).then(function() {
				assert.equal(oDeleteAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.deleteAppVariant method is called once");
				assert.equal(oShowMessageStub.callCount, 1, "then the showMessage method is called once");
				assert.equal(oShowSuccessMessageStub.callCount, 1, "then the showSuccessMessage method is called once");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is not called");
				assert.equal(oNavigateToFLPHomepage.callCount, 1, "then the navigateToFLPHomepage() method is called once");
				assert.ok(oGetOverviewStub.notCalled, "then the overview is not reloaded");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
