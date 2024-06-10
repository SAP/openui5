/* global QUnit  */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/Stack",
	"sap/ui/core/Control",
	"sap/base/Log",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/m/MessageBox",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	sinon,
	RtaAppVariantFeature,
	AppVariantOverviewUtils,
	AppVariantUtils,
	AppVariantManager,
	AppVariantFactory,
	FeaturesAPI,
	Settings,
	Layer,
	FlUtils,
	Stack,
	Control,
	Log,
	AppVariantWriteAPI,
	ChangesWriteAPI,
	MessageBox,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function stubUshellContainer() {
		var oUshellContainerStub = {
			getServiceAsync() {
				return Promise.resolve({
					navigate() {
					},
					getHash() {
						return "Action-somestring";
					},
					parseShellHash() {
						return {
							semanticObject: "Action",
							action: "somestring"
						};
					}
				});
			},
			setDirtyFlag() {
				return false;
			}
		};
		sandbox.stub(FlUtils, "getUshellContainer").returns(oUshellContainerStub);
	}

	function simulateSystemConfig(bIsAtoAvailable, bIsAtoEnabled) {
		sandbox.stub(Settings, "getInstance").resolves(
			new Settings({
				isKeyUser: true,
				isAtoAvailable: bIsAtoAvailable,
				isAtoEnabled: bIsAtoEnabled,
				isProductiveSystem: false
			})
		);
	}

	function handleShowMessageDialog() {
		return sandbox.stub(MessageBox, "show").callsFake(function(_, mParameters) {
			mParameters.onClose("Close");
		});
	}

	function assertCreateAppVariantWithEmptyCatalogsIdDialogFlow(stub, assert) {
		const aCalls = stub.getCalls();
		assert.equal(aCalls.length, 3, "then 3 dialogs are shown");
		assert.equal(aCalls[0].args[1].title, "Information", "then the correct dialog title is shown");
		assert.ok(aCalls[0].args[0].includes("You will be notified when the new tile is available"), "then the correct dialog message is shown");

		assert.equal(aCalls[1].args[1].title, "Information", "then the correct dialog title is shown");
		assert.ok(aCalls[1].args[0].includes("Operation in progress"), "then the correct dialog message is shown");

		assert.equal(aCalls[2].args[1].title, "Error", "then the correct dialog title is shown");
		assert.ok(aCalls[2].args[0].getContent()[0].getText().includes("Please assign the app variant"), "then the correct dialog message is shown");
	}

	function sleep() {
		return new Promise((resolve) => {
			setTimeout(resolve, 200);
		});
	}

	function getAppVariantOverviewAttributesData() {
		return [
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
	}

	QUnit.module("Given that a RtaAppVariantFeature is instantiated", {
		afterEach() {
			sandbox.stub(FlUtils, "getUShellService").withArgs("Navigation").returns(Promise.resolve(undefined));
			sandbox.restore();
		},
		after() {
			if (document.getElementById("sapUiBusyIndicator")) {
				document.getElementById("sapUiBusyIndicator").style.display = "none";
			}
		}
	}, function() {
		QUnit.test("when isManifestSupported() is called,", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			var oGetManifirstSupport = sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves(true);

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
			var oGetManifirstSupport = sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves(false);
			var oDialogSpy = sandbox.spy(AppVariantUtils, "showRelevantDialog");

			return RtaAppVariantFeature.isManifestSupported().then(function(bSuccess) {
				assert.ok(oGetManifirstSupport.calledWith("BaseAppId"), "then getManifirstSupport is called with correct parameters");
				assert.equal(oDialogSpy.notCalled, true, "then the dialog is not opened");
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
			var oLoadAppVariantStub = sandbox.stub(AppVariantFactory, "load").resolves(oDummyAppVarDescr);

			return RtaAppVariantFeature.getAppVariantDescriptor(oRootControl).then(function() {
				assert.equal(oLoadAppVariantStub.callCount, 1, "then the loading app variant is called once");
				assert.deepEqual(oLoadAppVariantStub.firstCall.args[0], {id: "customer.app.var.id"}, "the application id was passed correctly");
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
			var oLoadAppVariantStub = sandbox.stub(AppVariantFactory, "load").resolves(oDummyAppVarDescr);

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

			sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview").resolves(getAppVariantOverviewAttributesData());

			return RtaAppVariantFeature.onGetOverview(true, Layer.CUSTOMER).then(function(oAppVariantOverviewDialog) {
				assert.ok(true, "the the promise got resolved and AppVariant Overview Dialog is opened");
				oAppVariantOverviewDialog.fireCancel();
			});
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is true,", function(assert) {
			var oStub = sandbox.stub(URLSearchParams.prototype, "get");
			oStub.withArgs("sap-ui-xx-app-variant-overview-extended").returns("true");
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), true, "then the app variant overview is shown both for key user and SAP developer");
			oStub.restore();
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is given and is false,", function(assert) {
			var oStub = sandbox.stub(URLSearchParams.prototype, "get");
			oStub.withArgs("sap-ui-xx-app-variant-overview-extended").returns("false");
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), false, "then the app variant overview is shown only for key user");
			oStub.restore();
		});

		QUnit.test("when isOverviewExtended() is called when the query parameter is not given at all,", function(assert) {
			assert.equal(RtaAppVariantFeature.isOverviewExtended(), false, "then the app variant overview is shown only for key user");
		});

		QUnit.test("when isSaveAsAvailable() is called and FeaturesAPI says no", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(FeaturesAPI, "isSaveAsAvailable").resolves(false);

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			simulateSystemConfig(true, true);

			return RtaAppVariantFeature.isSaveAsAvailable(oRootControl, Layer.CUSTOMER, oStack).then(function(bIsSaveAsAvailable) {
				assert.equal(bIsSaveAsAvailable, false, "then the 'i' button is visible");
				assert.equal(oInboundInfoSpy.callCount, 0, "then the getInboundInfo is not called");
			});
		});

		QUnit.test("when isSaveAsAvailable() is called for FLP apps", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(FeaturesAPI, "isSaveAsAvailable").resolves(true);

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			simulateSystemConfig(true, true);

			return RtaAppVariantFeature.isSaveAsAvailable(oRootControl, Layer.CUSTOMER, oStack).then(function(bIsSaveAsAvailable) {
				assert.equal(bIsSaveAsAvailable, true, "then the 'i' button is visible");
				assert.equal(oInboundInfoSpy.callCount, 1, "then the getInboundInfo is called once");
				assert.equal(oInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
			});
		});

		QUnit.test("when isSaveAsAvailable() is called for an FLP app which has no crossNavigation in 'sap.app' property of a descriptor", function(assert) {
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
			sandbox.stub(FeaturesAPI, "isSaveAsAvailable").resolves(true);

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");
			var oRootControl = new Control();
			var oStack = new Stack();

			simulateSystemConfig(true, true);

			return RtaAppVariantFeature.isSaveAsAvailable(oRootControl, Layer.CUSTOMER, oStack).then(function(bIsSaveAsAvailable) {
				assert.equal(bIsSaveAsAvailable, true, "then the 'i' button is visible");
				assert.equal(oInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
			});
		});

		QUnit.test("when isSaveAsAvailable() is called for FLP app which has no 'sap.app' property of a descriptor", function(assert) {
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

			return RtaAppVariantFeature.isSaveAsAvailable(oRootControl, Layer.CUSTOMER, oStack).then(function(bIsSaveAsAvailable) {
				assert.equal(bIsSaveAsAvailable, false, "then the 'i' button is not visible");
				assert.equal(oInboundInfoSpy.callCount, 0, "then the getInboundInfo method is never called");
			});
		});

		QUnit.test("when isSaveAsAvailable() is called and it is an flp app, not a standalone app and no cross navigation property", function(assert) {
			var oMockedDescriptorData = {
				"sap.app": {
					id: "BaseAppId"
				}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(FeaturesAPI, "isSaveAsAvailable").resolves(true);

			var oInboundInfoSpy = sandbox.spy(AppVariantUtils, "getInboundInfo");

			var oRootControl = new Control();
			var oStack = new Stack();

			simulateSystemConfig(true, true);

			return RtaAppVariantFeature.isSaveAsAvailable(oRootControl, Layer.CUSTOMER, oStack).then(function(bIsSaveAsAvailable) {
				assert.equal(bIsSaveAsAvailable, true, "then the 'i' button is visible");
				assert.equal(oInboundInfoSpy.getCall(0).args[0], undefined, "then the parameter passed is correct");
			});
		});
	});

	QUnit.module("Given that the ushell is stubbed", {
		beforeEach() {
			stubUshellContainer();
		},
		afterEach() {
			sandbox.restore();
		},
		after() {
			if (document.getElementById("sapUiBusyIndicator")) {
				document.getElementById("sapUiBusyIndicator").style.display = "none";
			}
		}
	}, function() {
		QUnit.test("when onSaveAs() is bound with null and is triggered from RTA toolbar", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				},
				"sap.ui5": {
					componentName: "TestIdBaseApp"
				}
			};

			var fnTriggerSaveAs = RtaAppVariantFeature.onSaveAs.bind(null, true, false, Layer.CUSTOMER, oSelectedAppVariant);

			assert.throws(function() {
				fnTriggerSaveAs();
			});
		});

		QUnit.test("when onGetOverview() is called while deletion of key user app variant triggered closeOverviewDialog", function(assert) {
			simulateSystemConfig(true, true);

			const oMockedDescriptorData = {
				"sap.app": {
					id: "id1"
				}
			};

			const clock = sandbox.useFakeTimers();
			clock.restore();
			const aAppVariantOverviewAttributes = getAppVariantOverviewAttributesData();

			const oPublishingResponse = {
				response: {
					IAMId: "IAMId",
					inProgress: true
				}
			};

			var oMessageBoxShowStub = handleShowMessageDialog();
			sandbox.stub(FlUtils, "getAppDescriptor").returns(oMockedDescriptorData);
			sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves(oPublishingResponse);
			sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			const deleteAppVariantStub = sandbox.stub(AppVariantManager.prototype, "deleteAppVariant");
			const getAppVariantOverviewStub = sandbox.stub(AppVariantOverviewUtils, "getAppVariantOverview");

			// initial loading of overview dialog
			getAppVariantOverviewStub.onCall(0).resolves(aAppVariantOverviewAttributes);

			// load overview to show progress
			getAppVariantOverviewStub.onCall(1).callsFake(async () => {
				await sleep(200);
				deleteAppVariantStub.resolves();
				await sleep(200);
				return Promise.resolve(aAppVariantOverviewAttributes);
			});

			return RtaAppVariantFeature.onGetOverview(true, Layer.CUSTOMER).then(() => {
				assert.ok(true, "the the promise got resolved and AppVariant Overview Dialog is opened");
				return RtaAppVariantFeature.onDeleteFromOverviewDialog("id3", false, Layer.CUSTOMER);
			}).then(async () => {
				await sleep(200);
				assert.equal(oMessageBoxShowStub.callCount, 2, "no error dialog is called");
			});
		});

		QUnit.test("when onDeleteFromOverviewDialog() method is called and failed", function(assert) {
			simulateSystemConfig(true, true);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(AppVariantFactory, "load").resolves({response: JSON.stringify(oDescriptor)});

			var oPublishingResponse = {
				response: {
					IAMId: "IAMId",
					inProgress: true
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
			simulateSystemConfig(true, true);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(AppVariantFactory, "load").resolves({response: JSON.stringify(oDescriptor)});

			var oPublishingResponse = {
				response: {
					IAMId: "IAMId",
					inProgress: true
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
			simulateSystemConfig(true, true);
			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(AppVariantFactory, "load").resolves({response: JSON.stringify(oDescriptor)});

			var oPublishingResponse = {
				response: {
					IAMId: "IAMId",
					inProgress: false
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
					isKeyUser: true,
					isAtoAvailable: false,
					isAtoEnabled: false,
					isProductiveSystem: false
				})
			);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(AppVariantFactory, "load").resolves({response: JSON.stringify(oDescriptor)});

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
					isKeyUser: true,
					isAtoAvailable: false,
					isAtoEnabled: false,
					isProductiveSystem: false
				})
			);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(AppVariantFactory, "load").resolves({response: JSON.stringify(oDescriptor)});

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
			simulateSystemConfig(true, true);

			var oDescriptor = {reference: "someReference", id: "AppVarId"};
			sandbox.stub(AppVariantFactory, "load").resolves({response: JSON.stringify(oDescriptor)});

			var oPublishingResponse = {
				response: {
					IAMId: "IAMId",
					inProgress: true
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

	QUnit.module("Given that the ushell and an UIComponent is stubbed", {
		beforeEach() {
			stubUshellContainer();
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
		},
		afterEach() {
			sandbox.restore();
			this.oAppComponent.destroy();
		},
		after() {
			if (document.getElementById("sapUiBusyIndicator")) {
				document.getElementById("sapUiBusyIndicator").style.display = "none";
			}
		}
	}, function() {
		QUnit.test("when onSaveAs() method is called and saving an app variant failed", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			simulateSystemConfig(true, true);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");
			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);
			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);

			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").returns(Promise.reject({saveAsFailed: true}));
			var oCatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", {saveAsFailed: true}).returns();

			var oGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();

			return RtaAppVariantFeature.onSaveAs(false, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, "then ChangesWriteAPI.create method is called 6 times");
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oGetOverviewSpy.callCount, 1, "then the overview loads only once after the new app variant has been saved to LREP");
				assert.strictEqual(oCatchErrorDialog.getCall(0).args[1], "MSG_SAVE_APP_VARIANT_FAILED", "then the oCatchErrorDialog method is called with correct message key");
			});
		});

		QUnit.test("when onSaveAs() method is called on S/4HANA on Premise from Overview dialog", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser: true,
					isAtoAvailable: false,
					isAtoEnabled: false,
					isProductiveSystem: false
				})
			);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");
			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);
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

			return RtaAppVariantFeature.onSaveAs(false, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.save method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 1, "then the showSuccessMessage method is called once");
				assert.equal(oGetOverviewSpy.callCount, 1, "then the overview loads only once after the new app variant has been saved to LREP");
				assert.ok(oNavigateToFLPHomepage.notCalled, "then the navigateToFLPHomepage method is not called once");
				assert.ok(oTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is not called once");
				assert.ok(oNotifyKeyUserWhenPublishingIsReadySpy.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
			});
		});

		QUnit.test("when onSaveAs() method is called on S/4HANA Cloud from Overview dialog and no catalogIds in iam response", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			simulateSystemConfig(true, true);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");
			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});
			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oMessageBoxShowStub = handleShowMessageDialog();
			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview");
			oGetOverviewStub.onCall(0).resolves(RtaAppVariantFeature.onGetOverview.call(true, Layer.CUSTOMER));
			oGetOverviewStub.onCall(1).resolves();

			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({
				response: {IAMId: "IAMId", CatalogIds: []}
			});
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			return RtaAppVariantFeature.onSaveAs(false, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assertCreateAppVariantWithEmptyCatalogsIdDialogFlow(oMessageBoxShowStub, assert);
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 1, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 0, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oGetOverviewStub.callCount, 2, "then the overview loads only twice, once after triggering catalog assignment and once tile is created");
			});
		});

		QUnit.test("when onSaveAs() method is called on S/4HANA Cloud from Overview dialog", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			simulateSystemConfig(true, true);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");
			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);

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

			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({
				response: {IAMId: "IAMId", CatalogIds: ["catalogId1"]}
			});
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			return RtaAppVariantFeature.onSaveAs(false, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 2, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oGetOverviewStub.callCount, 2, "then the overview loads only twice, once after triggering catalog assignment and once tile is created");
			});
		});

		QUnit.test("when onSaveAs() method is called on S/4HANA Cloud from Overview dialog and customer closes Overview during Polling no catalogIds in iam response", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			simulateSystemConfig(true, true);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");
			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});
			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();
			var oMessageBoxShowStub = handleShowMessageDialog();

			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({
				response: {IAMId: "IAMId", CatalogIds: []}
			});
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			return RtaAppVariantFeature.onSaveAs(false, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assertCreateAppVariantWithEmptyCatalogsIdDialogFlow(oMessageBoxShowStub, assert);
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 1, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReady.callCount, 0, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oGetOverviewStub.callCount, 1, "then the overview loads only once after triggering catalog assignment, since it is closed it will not open again after success messagef");
			});
		});

		QUnit.test("when onSaveAs() method is called on S/4HANA Cloud from Overview dialog and customer closes Overview during Polling", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			simulateSystemConfig(true, true);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");
			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});
			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessage = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oGetOverviewStub = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();

			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({
				response: {IAMId: "IAMId", CatalogIds: ["catalogId1"]}
			});
			var oNotifyKeyUserWhenPublishingIsReady = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();

			return RtaAppVariantFeature.onSaveAs(false, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
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
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				},
				"sap.ui5": {
					componentName: "TestIdBaseApp"
				}
			};

			var oAppVariantData = {
				referenceAppId: "RunningAppId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			simulateSystemConfig(false, false);
			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IAMId").returns();

			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);

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

			var fnTriggerSaveAs = RtaAppVariantFeature.onSaveAs.bind(RtaAppVariantFeature, true, false, Layer.CUSTOMER, oSelectedAppVariant);

			return fnTriggerSaveAs().then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessage.callCount, 1, "then the showSuccessMessage method is called once");
				assert.ok(oGetOverviewStub.notCalled, "then the overview is not opened");
				assert.equal(oNavigateToFLPHomepage.callCount, 1, "then the _navigateToFLPHomepage method is called once");
				assert.ok(oTriggerCatalogPublishing.notCalled, "then the triggerCatalogPublishing method is not called once");
				assert.ok(oNotifyKeyUserWhenPublishingIsReadySpy.notCalled, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar on S/4HANA Cloud and no catalogIds in iam response", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			simulateSystemConfig(true, true);
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IAMId").returns();

			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});

			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessageStub = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oMessageBoxShowStub = handleShowMessageDialog();

			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({
				response: {IAMId: "IAMId", CatalogIds: []}
			});
			var oNotifyKeyUserWhenPublishingIsReadySpy = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var oNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onSaveAs(true, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assertCreateAppVariantWithEmptyCatalogsIdDialogFlow(oMessageBoxShowStub, assert);
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessageStub.callCount, 1, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReadySpy.callCount, 0, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oNavigateToFLPHomepage.callCount, 1, "then the _navigateToFLPHomepage method is called once");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar on S/4HANA Cloud", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			simulateSystemConfig(true, true);
			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());
			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IAMId").returns();

			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);

			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);
			var oSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves({
				response: {
					id: "customer.TestId.id_123456"
				}
			});

			var oClearRTACommandStack = sandbox.stub(AppVariantManager.prototype, "clearRTACommandStack").resolves();
			var oShowSuccessMessageStub = sandbox.spy(AppVariantManager.prototype, "showSuccessMessage");
			var oTriggerCatalogPublishing = sandbox.stub(AppVariantManager.prototype, "triggerCatalogPublishing").resolves({
				response: {IAMId: "IAMId", CatalogIds: ["catalogId1"]}
			});
			var oNotifyKeyUserWhenPublishingIsReadySpy = sandbox.stub(AppVariantManager.prototype, "notifyKeyUserWhenPublishingIsReady").resolves();
			var oNavigateToFLPHomepage = sandbox.stub(AppVariantUtils, "navigateToFLPHomepage").resolves();

			return RtaAppVariantFeature.onSaveAs(true, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(oCreateChangesSpy.callCount, 6, `then ChangesWriteAPI.create method is called ${oCreateChangesSpy.callCount} times`);
				assert.equal(oSaveAsAppVariantStub.callCount, 1, "then the AppVariantWriteAPI.saveAs method is called once");
				assert.equal(oClearRTACommandStack.callCount, 1, "then the clearRTACommandStack method is called once");
				assert.equal(oShowSuccessMessageStub.callCount, 2, "then the showSuccessMessage method is called twice");
				assert.equal(oTriggerCatalogPublishing.callCount, 1, "then the triggerCatalogPublishing method is not called once");
				assert.equal(oNotifyKeyUserWhenPublishingIsReadySpy.callCount, 1, "then the notifyKeyUserWhenPublishingIsReady method is not called once");
				assert.equal(oNavigateToFLPHomepage.callCount, 1, "then the _navigateToFLPHomepage method is called once");
			});
		});

		QUnit.test("when onSaveAs() is triggered from RTA toolbar on S/4HANA Cloud with an backend status error: 500 during app variant creation", function(assert) {
			var oSelectedAppVariant = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var oAppVariantData = {
				referenceAppId: "TestId",
				title: "Title",
				subTitle: "Subtitle",
				description: "Description",
				icon: "sap-icon://history",
				inbounds: {}
			};

			var oError = {
				status: 500,
				userMessage: "The referenced object does not exist or is not unique\n",
				messageKey: "MSG_SAVE_APP_VARIANT_FAILED"
			};

			simulateSystemConfig(true, true);

			sandbox.stub(FlUtils, "getAppDescriptor").returns({"sap.app": {id: "TestId"}});
			sandbox.stub(RtaAppVariantFeature, "_determineSelector").returns(this.oAppComponent);
			var oProcessSaveAsDialog = sandbox.stub(AppVariantManager.prototype, "processSaveAsDialog").resolves(oAppVariantData);

			var ocreateAppVariantStub = sandbox.stub(AppVariantManager.prototype, "createAppVariant").rejects(oError);
			var oCatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");
			var oGetOverviewSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves();

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				assert.ok(sText.includes(oError.userMessage), "then the correct error message is returned");
				mParameters.onClose("Close");
			});

			return RtaAppVariantFeature.onSaveAs(true, false, Layer.CUSTOMER, oSelectedAppVariant).then(function() {
				assert.equal(oProcessSaveAsDialog.callCount, 1, "then the processSaveAsDialog method is called once");
				assert.equal(ocreateAppVariantStub.callCount, 1, "then the AppVariantManager.createAppVariant method is called once");
				assert.equal(oGetOverviewSpy.callCount, 1, "then the overview loads only once after the new app variant has been saved to LREP");
				assert.strictEqual(oCatchErrorDialog.getCall(0).args[1], "MSG_SAVE_APP_VARIANT_FAILED", "then the oCatchErrorDialog method is called with correct message key");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});