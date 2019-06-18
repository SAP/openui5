/* global QUnit  */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/core/Control",
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/Manifest",
	"sap/ui/thirdparty/sinon-4"
],
function (
	jQuery,
	AppVariantManager,
	RtaAppVariantFeature,
	AppVariantUtils,
	Stack,
	LREPSerializer,
	DescriptorVariantFactory,
	DescriptorUtils,
	Settings,
	FlUtils,
	RtaUtils,
	Control,
	S4HanaCloudBackend,
	Log,
	MessageBox,
	Manifest,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an AppVariantManager is instantiated", {
		beforeEach: function () {
			var oRootControl = new Control();
			var oRtaCommandStack = new Stack();
			var oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: oRootControl});
			this.oAppVariantManager = new AppVariantManager({rootControl: oRootControl, commandSerializer: oCommandSerializer});
		},
		afterEach: function () {
			sandbox.restore();
			this.oAppVariantManager.destroy();
		}
	}, function() {
		QUnit.test("When _openDialog() method is called and create event is triggered", function (assert) {
			var bCreate = false;
			var fnCreate = function() {
				bCreate = true;
				this.destroy();
			};
			var fnCancel;

			this.oAppVariantManager._openDialog(fnCreate, fnCancel);
			var oAppVariantDialog = sap.ui.getCore().byId("appVariantDialog");
			oAppVariantDialog.fireCreate();

			assert.equal(bCreate, true, "then the create event is correctly triggered");
		});

		QUnit.test("When _openDialog() method is called and cancel event is triggered", function (assert) {
			var bCancel = false;
			var fnCreate;
			var fnCancel = function() {
				bCancel = true;
				this.destroy();
			};

			this.oAppVariantManager._openDialog(fnCreate, fnCancel);
			var oAppVariantDialog = sap.ui.getCore().byId("appVariantDialog");
			oAppVariantDialog.fireCancel();

			assert.equal(bCancel, true, "then the cancel event is correctly triggered");
		});

		QUnit.test("When processSaveAsDialog() method is called and key user provides the dialog input", function (assert) {
			var oDescriptor = {
				"sap.app" : {
					id : "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			var fnSimulateDialogSelectionAndSave = function (fSave) {
				var oParameters = {
					title: "App Variant Title",
					subTitle: "App Variant Subtitle",
					description: "App Variant Description",
					icon: "App Variant Icon"
				};

				var oResult = {
					getParameters: function () {
						return oParameters;
					}
				};

				fSave(oResult);
			};

			var oOpenDialogStub = sandbox.stub(this.oAppVariantManager, "_openDialog").callsFake(fnSimulateDialogSelectionAndSave);

			return this.oAppVariantManager.processSaveAsDialog(oDescriptor).then(function(oAppVariantData) {
				assert.ok(oOpenDialogStub.calledOnce, "the _openDialog is called only once");
				assert.strictEqual(oAppVariantData.title, "App Variant Title", "then the title is correct");
				assert.strictEqual(oAppVariantData.subTitle, "App Variant Subtitle", "then the subtitle is correct");
				assert.strictEqual(oAppVariantData.description, "App Variant Description", "then the description is correct");
				assert.strictEqual(oAppVariantData.icon, "App Variant Icon", "then the icon is correct");
				assert.strictEqual(oAppVariantData.idRunningApp, "TestId", "then the running app id is correct");
			});
		});
	});

	var oServer;

	QUnit.module("Given an AppVariantManager is instantiated for different platforms", {
		beforeEach: function () {
			var oRootControl = new Control();
			var oRtaCommandStack = new Stack();
			var oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: oRootControl});
			this.oAppVariantManager = new AppVariantManager({rootControl: oRootControl, commandSerializer: oCommandSerializer});

			oServer = sinon.fakeServer.create();

			sandbox.stub(AppVariantUtils, "getInboundInfo").returns({
				currentRunningInbound: "customer.savedAsAppVariant",
				addNewInboundRequired: true
			});

			var oParsedHashStub = {
				semanticObject: "testSemanticObject",
				action: "testAction"
			};
			sandbox.stub(FlUtils, "getParsedURLHash").returns(oParsedHashStub);

			this.oAppVariantData = {
				description: "App Variant Description",
				idRunningApp : "TestId",
				idBaseApp: "TestIdBaseApp",
				title : "App Variant Title",
				subTitle: "App Variant Subtitle",
				icon: "App Variant Icon"
			};
		},

		afterEach: function () {
			sandbox.restore();
			this.oAppVariantManager.destroy();
			oServer.restore();
		}
	}, function() {
		QUnit.test("When createDescriptor() method is called on S4/Hana on premise", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			var fnGetTransportInputSpy = sandbox.stub(AppVariantUtils, "getTransportInput");
			var fnOpenTransportSelection = sandbox.stub(AppVariantUtils, "openTransportSelection");

			var oTransportInfo = {
				packageName: "$TMP",
				transport: ""
			};

			var fnOnTransportInDialogSelectedSpy = sandbox.spy(AppVariantUtils, "onTransportInDialogSelected");

			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).then(function(oAppVariantDescriptor) {
				assert.ok(true, "then the promise has been resolved with an app variant descriptor");
				assert.strictEqual(oAppVariantDescriptor._sTransportRequest, null, "then the transport is correct");
				assert.strictEqual(oAppVariantDescriptor._getMap().packageName, "$TMP", "then the descriptor is created with local object");
				assert.strictEqual(oAppVariantDescriptor.getReference(), "TestId", "then the reference is correct");
				assert.equal(fnGetTransportInputSpy.callCount, 0, "then the getTransportInput() method is never called");
				assert.equal(fnOpenTransportSelection.callCount, 0, "then the openTransportSelection() method is never called");
				assert.ok(fnOnTransportInDialogSelectedSpy.calledOnceWith(oAppVariantDescriptor, oTransportInfo), "then the onTransportInDialogSelected() method is called once with correct parameters");
			});
		});

		QUnit.test("When createDescriptor() method is called on S4/Hana Cloud", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var fnGetTransportInputSpy = sandbox.spy(AppVariantUtils, "getTransportInput");
			var fnOnTransportInDialogSelectedSpy = sandbox.spy(AppVariantUtils, "onTransportInDialogSelected");

			var oTransportInfo = {
				fromDialog: false,
				packageName: "",
				transport: "ATO_NOTIFICATION"
			};

			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).then(function(oAppVariantDescriptor) {
				assert.ok(true, "then the promise has been resolved with an app variant descriptor");
				assert.strictEqual(oAppVariantDescriptor._sTransportRequest, "ATO_NOTIFICATION", "then the transport is correctly set");
				assert.strictEqual(oAppVariantDescriptor.getReference(), "TestId", "then the reference is correct");
				assert.ok(fnGetTransportInputSpy.calledOnceWith("", oAppVariantDescriptor.getNamespace(), "manifest", "appdescr_variant"), "then the getTransportInput() method is called once with correct parameters");
				assert.ok(fnOnTransportInDialogSelectedSpy.calledOnceWith(oAppVariantDescriptor, oTransportInfo), "then the onTransportInDialogSelected() method is called once with correct parameters");
			});
		});

		QUnit.test("When notifyKeyUserWhenPublishingIsReady() method is called during app creation", function (assert) {
			var fnNotifyFlpCustomizingIsReadyStub = sandbox.stub(S4HanaCloudBackend.prototype, "notifyFlpCustomizingIsReady").resolves(true);
			var fncatchErrorDialog = sandbox.stub(AppVariantUtils, "catchErrorDialog");
			return this.oAppVariantManager.notifyKeyUserWhenPublishingIsReady("IamID", "AppvarID", true).then(function() {
				assert.ok(fnNotifyFlpCustomizingIsReadyStub.calledOnceWith("IamID", true), "then the function notifyFlpCustomizingIsReady() is called once and with right parameters");
				assert.ok(fncatchErrorDialog.notCalled, "then the function catchErrorDialog() is not called");
			});
		});

		QUnit.test("When notifyKeyUserWhenPublishingIsReady() method is called during app deletion", function (assert) {
			var fnNotifyFlpCustomizingIsReadyStub = sandbox.stub(S4HanaCloudBackend.prototype, "notifyFlpCustomizingIsReady").resolves(true);
			var fncatchErrorDialog = sandbox.stub(AppVariantUtils, "catchErrorDialog");
			return this.oAppVariantManager.notifyKeyUserWhenPublishingIsReady("IamID", "AppvarID", false).then(function() {
				assert.ok(fnNotifyFlpCustomizingIsReadyStub.calledOnceWith("IamID", false), "then the function notifyFlpCustomizingIsReady() is called once and with right parameters");
				assert.ok(fncatchErrorDialog.notCalled, "then the function catchErrorDialog() is not called");
			});
		});


		QUnit.test("When notifyKeyUserWhenPublishingIsReady() method is failed on S4/Hana Cloud", function (assert) {
			var checkFlpCustomizingIsReadyStub = sandbox.stub(S4HanaCloudBackend.prototype, "notifyFlpCustomizingIsReady").rejects();
			var fncatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");
			//sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());
			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});
			return this.oAppVariantManager.notifyKeyUserWhenPublishingIsReady("IamID", "AppvarID", true).then(
				function() {
					assert.ok(checkFlpCustomizingIsReadyStub.calledOnceWith("IamID", true), "then the method notifyFlpCustomizingIsReady is called once with correct parameters");
					assert.ok(fncatchErrorDialog.calledOnce, "then the function catchErrorDialog() is called once");
					assert.strictEqual(fncatchErrorDialog.getCall(0).args[1], "MSG_TILE_CREATION_FAILED", "then the function catchErrorDialog() is called with correct message key");
					assert.strictEqual(fncatchErrorDialog.getCall(0).args[2], "AppvarID", "then the function catchErrorDialog() is called with correct app var id");
				}
			);
		});

		QUnit.test("When createDescriptor() method is failed on S4/Hana cloud", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Whatever!").returns();

			sandbox.stub(AppVariantUtils, "openTransportSelection").returns(Promise.reject("Whatever!"));

			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));
			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).catch(
				function(bSuccess) {
					assert.equal(bSuccess, false, "Error: An unexpected exception occured");
				}
			);
		});
	});

	QUnit.module("Given an AppVariantManager is instantiated for different platforms", {
		beforeEach: function () {
			var oRootControl = new Control();
			var oRtaCommandStack = new Stack();
			var oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: oRootControl});
			sandbox.stub(oRtaCommandStack, "getAllExecutedCommands").returns(["testCommand"]);

			this.oAppVariantManager = new AppVariantManager({rootControl: oRootControl, commandSerializer: oCommandSerializer});
			oServer = sinon.fakeServer.create();
		},
		afterEach: function () {
			sandbox.restore();
			oServer.restore();
		}
	}, function() {
		QUnit.test("When saveAppVariantToLREP() method is called and response is successful", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			var fnSubmit;
			var fncatchErrorDialog = sandbox.stub(AppVariantUtils, "catchErrorDialog");
			return DescriptorVariantFactory.createNew({id: "customer.TestId", reference: "TestIdBaseApp"})
				.then(function(oDescriptor) {
					fnSubmit = sandbox.stub(oDescriptor, "submit").resolves();
					return this.oAppVariantManager.saveAppVariantToLREP(oDescriptor);
				}.bind(this))
				.then(function() {
					assert.ok(fnSubmit.calledOnce, "then the function submit() is called once");
					assert.ok(fncatchErrorDialog.notCalled, "then the function catchErrorDialog() is not called");
				});
		});

		QUnit.test("When saveAppVariantToLREP() method is called and response is failed", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "error").returns();

			var fnSubmit;
			var fncatchErrorDialog = sandbox.stub(AppVariantUtils, "catchErrorDialog");

			return DescriptorVariantFactory.createNew({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oDescriptor) {
				fnSubmit = sandbox.stub(oDescriptor, "submit").rejects();
				return this.oAppVariantManager.saveAppVariantToLREP(oDescriptor);
			}.bind(this))
			.then(function() {
				assert.ok(fnSubmit.calledOnce, "then the function submit() is called once");
				assert.ok(fncatchErrorDialog.calledOnce, "then the function catchErrorDialog() is called once");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[1], "MSG_SAVE_APP_VARIANT_FAILED", "then the function catchErrorDialog() is called with correct message key");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[2], "customer.TestId", "then the function catchErrorDialog() is called with correct app var id");
			});
		});

		QUnit.test("When copyUnsavedChangesToLREP() method is called without any unsaved changes", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");

			var oDescriptor = {
				"sap.app" : {
					id : "TestId",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};

			var oManifest = new Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oComponent);

			return this.oAppVariantManager.copyUnsavedChangesToLREP("AppVariantId", false).then(function() {
				assert.ok("then the promise is resolved");
			});
		});

		QUnit.test("When copyUnsavedChangesToLREP() method is called, taking over dirty changes failed", function (assert) {
			var fnTakeOverDirtyChanges = sandbox.stub(this.oAppVariantManager, "_takeOverDirtyChangesByAppVariant").returns(Promise.reject("Saving error"));
			var fnDeleteAppVariant = sandbox.stub(this.oAppVariantManager, "_deleteAppVariantFromLREP").resolves();
			var fnShowRelevantDialog = sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject());

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Saving error").returns();

			return new Promise(function(resolve, reject) {
				return this.oAppVariantManager.copyUnsavedChangesToLREP("AppVariantId", true).then(reject, function () {
					assert.ok(true, "a rejection took place");
					assert.equal(fnTakeOverDirtyChanges.callCount, 1, "then the _takeOverDirtyChangesByAppVariant() method is called once");
					assert.equal(fnDeleteAppVariant.callCount, 1, "then the _deleteAppVariantFromLREP() method is called once");
					assert.equal(fnShowRelevantDialog.callCount, 1, "then the showRelevantDialog() method is called once");
					resolve();
				});
			}.bind(this));
		});

		QUnit.test("When copyUnsavedChangesToLREP() method is called, taking over dirty changes failed and then the deleting of app variants is also failed", function (assert) {
			var fnTakeOverDirtyChanges = sandbox.stub(this.oAppVariantManager, "_takeOverDirtyChangesByAppVariant").returns(Promise.reject("Saving error"));
			var fnDeleteAppVariant = sandbox.stub(this.oAppVariantManager, "_deleteAppVariantFromLREP").returns(Promise.reject("Delete Error"));
			var fnShowRelevantDialog = sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject());

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Delete Error").returns();

			return new Promise(function(resolve, reject) {
				return this.oAppVariantManager.copyUnsavedChangesToLREP("AppVariantId", true).then(reject, function () {
					assert.ok(true, "a rejection took place");
					assert.equal(fnTakeOverDirtyChanges.callCount, 1, "then the _takeOverDirtyChangesByAppVariant() method is called once");
					assert.equal(fnDeleteAppVariant.callCount, 1, "then the _deleteAppVariantFromLREP() method is called once");
					assert.equal(fnShowRelevantDialog.callCount, 1, "then the showRelevantDialog() method is called once");
					resolve();
				});
			}.bind(this));
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog assignment", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var oResponse = {
				VariantId : "customer.TestId",
				IAMId : "IAMId",
				CatalogIds : ["TEST_CATALOG"]
			};

			var oDescriptorUtilsStub = sandbox.stub(DescriptorUtils, "sendRequest").resolves(oResponse);
			var fnTriggerCatalogAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogAssignment");

			return DescriptorVariantFactory.createNew({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogPublishing(oDescriptor, true);
			}.bind(this))
			.then(function(oResult) {
				assert.ok(fnTriggerCatalogAssignment.calledOnceWith("customer.TestId", "TestIdBaseApp"), "then the method triggerCatalogAssignment is called once with correct parameters");
				assert.ok(oDescriptorUtilsStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=assignCatalogs&assignFromAppId=TestIdBaseApp", 'POST'), "then the sendRequest() method is called once and with right parameters");
				assert.strictEqual(oResult.IAMId, "IAMId", "then the IAM id is correct");
				assert.strictEqual(oResult.VariantId, "customer.TestId", "then the variant id is correct");
				assert.strictEqual(oResult.CatalogIds[0], "TEST_CATALOG", "then the new app variant has been added to a correct catalog ");
			});
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog unassignment", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var oResponse = {
				IAMId : "IAMId",
				inProgress: true
			};

			var oDescriptorUtilsStub = sandbox.stub(DescriptorUtils, "sendRequest").resolves(oResponse);
			var fnTriggerCatalogUnAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogUnAssignment");

			return DescriptorVariantFactory.createNew({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogPublishing(oDescriptor, false);
			}.bind(this))
			.then(function(oResult) {
				assert.ok(fnTriggerCatalogUnAssignment.calledOnceWith("customer.TestId", "TestIdBaseApp"), "then the method triggerCatalogUnAssignment is called once with correct parameters");
				assert.ok(oDescriptorUtilsStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=unassignCatalogs", 'POST'), "then the sendRequest() method is called once and with right parameters");
				assert.strictEqual(oResult.IAMId, "IAMId", "then the IAM id is correct");
				assert.strictEqual(oResult.inProgress, true, "then the inProgress property is true");
			});
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog assignment and response is failed", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var oDescriptorUtilsStub = sandbox.stub(DescriptorUtils, "sendRequest").returns(Promise.reject("Error"));

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "error").returns();

			var fnShowRelevantDialog = sandbox.spy(AppVariantUtils, "showRelevantDialog");
			var oErrorInfo = {appVariantId:  "customer.TestId"};
			var fnBuildErrorInfoStub = sandbox.stub(AppVariantUtils, "buildErrorInfo").returns(oErrorInfo);
			var fncatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");
			var fnTriggerCatalogAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogAssignment");

			return DescriptorVariantFactory.createNew({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogPublishing(oDescriptor, true);
			}.bind(this))
			.then(function() {
				assert.ok(fnTriggerCatalogAssignment.calledOnceWith("customer.TestId", "TestIdBaseApp"), "then the method triggerCatalogAssignment is called once with correct parameters");
				assert.ok(oDescriptorUtilsStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=assignCatalogs&assignFromAppId=TestIdBaseApp", 'POST'), "then the sendRequest() method is called once and with right parameters");
				assert.ok(fncatchErrorDialog.calledOnce, "then the fncatchErrorDialog method is called once");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[1], "MSG_CATALOG_ASSIGNMENT_FAILED", "then the fncatchErrorDialog method is called with correct message key");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[2], "customer.TestId", "then the fncatchErrorDialog method is called with correct app var id");
				assert.ok(fnBuildErrorInfoStub.calledOnce, "then the buildErrorInfo method is called once");
				assert.ok(fnShowRelevantDialog.calledOnceWith(oErrorInfo, false), "then the showRelevantDialog method is called once and with correct parameters");
			});
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog unassignment and response is failed", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var oDescriptorUtilsStub = sandbox.stub(DescriptorUtils, "sendRequest").returns(Promise.reject("Error"));

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "error").returns();

			var fnShowRelevantDialog = sandbox.spy(AppVariantUtils, "showRelevantDialog");
			var oErrorInfo = {appVariantId:  "customer.TestId"};
			var fnBuildErrorInfoStub = sandbox.stub(AppVariantUtils, "buildErrorInfo").returns(oErrorInfo);
			var fncatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");
			var fnTriggerCatalogUnAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogUnAssignment");

			return DescriptorVariantFactory.createNew({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogPublishing(oDescriptor, false);
			}.bind(this))
			.then(function() {
				assert.ok(fnTriggerCatalogUnAssignment.calledOnceWith("customer.TestId", "TestIdBaseApp"), "then the method triggerCatalogUnAssignment is called once with correct parameters");
				assert.ok(oDescriptorUtilsStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=unassignCatalogs", 'POST'), "then the sendRequest() method is called once and with right parameters");
				assert.ok(fncatchErrorDialog.calledOnce, "then the fncatchErrorDialog method is called once");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[1], "MSG_DELETE_APP_VARIANT_FAILED", "then the fncatchErrorDialog method is called with correct message key");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[2], "customer.TestId", "then the fncatchErrorDialog method is called with correct app var id");
				assert.ok(fnBuildErrorInfoStub.calledOnce, "then the buildErrorInfo method is called once");
				assert.ok(fnShowRelevantDialog.calledOnceWith(oErrorInfo, false), "then the showRelevantDialog method is called once and with correct parameters");
			});
		});


		QUnit.test("When showSuccessMessage() method is called on S4/Hana Cloud ('Save As' is triggered from RTA Toolbar)", function (assert) {
			window.bUShellNavigationTriggered = false;
			var originalUShell = sap.ushell;

			sap.ushell = Object.assign({}, sap.ushell, {
				Container : {
					getService : function() {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							}
						};
					}
				},
				services : {
					AppConfiguration: {
						getCurrentApplication: function() {
							return {
								componentHandle: {
									getInstance: function() {
										return "testInstance";
									}
								}
							};
						}
					}
				}
			});

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessage(oDescriptor, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
					sap.ushell = originalUShell;
					delete window.bUShellNavigationTriggered;
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessage() method is called on S4/Hana on premise ('Save As' is triggered from RTA Toolbar)", function (assert) {
			window.bUShellNavigationTriggered = false;
			var originalUShell = sap.ushell;

			sap.ushell = Object.assign({}, sap.ushell, {
				Container : {
					getService : function() {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							}
						};
					}
				},
				services : {
					AppConfiguration: {
						getCurrentApplication: function() {
							return {
								componentHandle: {
									getInstance: function() {
										return "testInstance";
									}
								}
							};
						}
					}
				}
			});

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessage(oDescriptor, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
					sap.ushell = originalUShell;
					delete window.bUShellNavigationTriggered;
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessage() method is called on S4/Hana Cloud ('Save As' is triggered from app variant overview list)", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves(true);

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessage(oDescriptor, false).then(function() {
					assert.ok(fnAppVariantFeatureSpy.notCalled, "then the onGetOverview() method is called once");
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessage() method is called on S4/Hana on premise ('Save As' is triggered from app variant overview list)", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves(true);

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessage(oDescriptor, false).then(function() {
					assert.ok(fnAppVariantFeatureSpy.notCalled, "then the onGetOverview() method is called once");
				});
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});