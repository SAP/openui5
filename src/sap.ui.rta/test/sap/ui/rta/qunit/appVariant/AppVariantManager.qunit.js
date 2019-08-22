/* global QUnit  */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
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

			return this.oAppVariantManager.processSaveAsDialog(oDescriptor).then(function(oAppVariantData){
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
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
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
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
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

		QUnit.test("When notifyKeyUserWhenTileIsReady() method is called on S4/Hana Cloud", function (assert) {
			sandbox.stub(S4HanaCloudBackend.prototype, "checkFlpCustomizingIsReady").resolves(true);
			sandbox.stub(RtaUtils, "_showMessageBox").resolves(true);
			return this.oAppVariantManager.notifyKeyUserWhenTileIsReady("IamID", "AppvarID").then(function(oResult) {
				assert.strictEqual(oResult.iamAppId, "IamID", "then the IAM Id is correct");
				assert.equal(oResult.flpCustomizingIsReady, true, "then the FLP customizing for app variant is done and FLP tile is ready");
			});
		});

		QUnit.test("When notifyKeyUserWhenTileIsReady() method is failed on S4/Hana Cloud", function (assert) {
			var checkFlpCustomizingIsReadyStub = sandbox.stub(S4HanaCloudBackend.prototype, "notifyFlpCustomizingIsReady").callsFake(function(sIamAppId) {
				return Promise.reject({
					iamAppId : sIamAppId
				});
			});

			sandbox.stub(Log,"error").callThrough().withArgs("App variant error: ", "IAM App Id: IamID").returns();

			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));
			return this.oAppVariantManager.notifyKeyUserWhenTileIsReady("IamID", "AppvarID").catch(
				function(bSuccess) {
					assert.equal(bSuccess, false, "Error: An unexpected exception occured" );
					assert.ok(checkFlpCustomizingIsReadyStub.calledOnceWith("IamID"), "then the method notifyFlpCustomizingIsReady is called once with correct parameters");
				}
			);
		});

		QUnit.test("When createDescriptor() method is failed on S4/Hana cloud", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			sandbox.stub(Log,"error").callThrough().withArgs("App variant error: ", "Whatever!").returns();

			sandbox.stub(AppVariantUtils, "openTransportSelection").returns(Promise.reject("Whatever!"));

			sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));
			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).catch(
				function(bSuccess) {
					assert.equal(bSuccess, false, "Error: An unexpected exception occured" );
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
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			oServer.respondWith("HEAD", /\/sap\/bc\/lrep\/actions\/getcsrftoken/, [
				200,
				{
					"X-CSRF-Token": "0987654321"
				},
				""
			]);

			var oResponse = {
				"id": "AppVariantId",
				"reference":"ReferenceAppId",
				"content": []
			};

			oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants/, [
				200,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				JSON.stringify(oResponse)
			]);

			oServer.autoRespond = true;

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.saveAppVariantToLREP(oDescriptor).then(function(oResult) {
					assert.strictEqual(oResult.response.id, "AppVariantId", "then the id of app variant descriptor is correct");
					assert.strictEqual(oResult.response.reference, "ReferenceAppId", "then the id of reference app is correct");
				});
			}.bind(this));
		});

		QUnit.test("When saveAppVariantToLREP() method is called and response is failed", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants/, [
				400,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				"Backend Error"
			]);

			oServer.autoRespond = true;

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log,"error").callThrough().withArgs("App variant error: ", "error").returns();

			var fnShowRelevantDialog = sandbox.spy(AppVariantUtils, "showRelevantDialog");

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.saveAppVariantToLREP(oDescriptor).catch(
					function() {
						assert.ok("then the promise got rejected");
						assert.ok(fnShowRelevantDialog.calledOnce, "then the showRelevantDialog method is called once");
					}
				);
			}.bind(this));
		});

		QUnit.test("When copyUnsavedChangesToLREP() method is called without any unsaved changes", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
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

			return this.oAppVariantManager.copyUnsavedChangesToLREP("AppVariantId", false, "1.0.0").then(function() {
				assert.ok("then the promise is resolved");
			});
		});

		QUnit.test("When copyUnsavedChangesToLREP() method is called, taking over dirty changes failed", function (assert) {
			sandbox.stub(this.oAppVariantManager.getCommandSerializer(), "saveAsCommands").returns(Promise.reject("Saving error"));
			var fnTakeOverDirtyChangesStub = sandbox.spy(this.oAppVariantManager, "_takeOverDirtyChangesByAppVariant");
			var fnDeleteAppVariant = sandbox.stub(this.oAppVariantManager, "_deleteAppVariantFromLREP").resolves();
			var fnShowRelevantDialog = sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject());

			sandbox.stub(Log,"error").callThrough().withArgs("App variant error: ", "Saving error").returns();

			return new Promise(function(resolve, reject) {
				return this.oAppVariantManager.copyUnsavedChangesToLREP("AppVariantId", true, "1.0.0").then(reject, function () {
					assert.ok(true, "a rejection took place");
					assert.equal(fnTakeOverDirtyChangesStub.callCount, 1, "then the _takeOverDirtyChangesByAppVariant() method is called once");
					assert.equal(fnDeleteAppVariant.callCount, 1, "then the _deleteAppVariantFromLREP() method is called once");
					assert.equal(fnShowRelevantDialog.callCount, 1, "then the showRelevantDialog() method is called once");
					assert.ok(fnTakeOverDirtyChangesStub.calledWithExactly("AppVariantId", "1.0.0"), "then _takeOverDirtyChangesByAppVariant is called with right parameters");
					resolve();
				});
			}.bind(this));
		});

		QUnit.test("When copyUnsavedChangesToLREP() method is called, taking over dirty changes failed and then the deleting of app variants is also failed", function (assert) {
			var fnSaveAsCommandsStub = sandbox.stub(this.oAppVariantManager.getCommandSerializer(), "saveAsCommands").returns(Promise.reject("Saving error"));
			var fnDeleteAppVariant = sandbox.stub(this.oAppVariantManager, "_deleteAppVariantFromLREP").returns(Promise.reject("Delete Error"));
			var fnShowRelevantDialog = sandbox.stub(AppVariantUtils, "showRelevantDialog").returns(Promise.reject());

			sandbox.stub(Log,"error").callThrough().withArgs("App variant error: ", "Delete Error").returns();

			return new Promise(function(resolve, reject) {
				return this.oAppVariantManager.copyUnsavedChangesToLREP("AppVariantId", true, "1.0.0").then(reject, function () {
					assert.ok(true, "a rejection took place");
					assert.equal(fnSaveAsCommandsStub.callCount, 1, "then the saveAsCommands() method is called once");
					assert.equal(fnDeleteAppVariant.callCount, 1, "then the _deleteAppVariantFromLREP() method is called once");
					assert.equal(fnShowRelevantDialog.callCount, 1, "then the showRelevantDialog() method is called once");
					assert.ok(fnSaveAsCommandsStub.calledWithExactly("AppVariantId", "1.0.0"), "then saveAsCommands is called with right parameters");
					resolve();
				});
			}.bind(this));
		});

		QUnit.test("When triggerCatalogAssignment() method is called on S4/Hana Cloud", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			oServer.respondWith("HEAD", /\/sap\/bc\/lrep\/actions\/getcsrftoken/, [
				200,
				{
					"X-CSRF-Token": "0987654321"
				},
				""
			]);

			var oResponse = {
				"VariantId" : "customer.TestId",
				"IAMId" : "IAMId",
				"CatalogIds" : ["TEST_CATALOG"]
			};

			oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants\/customer.TestId/, [
				200,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				JSON.stringify(oResponse)
			]);

			oServer.autoRespond = true;

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogAssignment(oDescriptor).then(function(oResult) {
					assert.strictEqual(oResult.response.IAMId, "IAMId", "then the IAM id is correct");
					assert.strictEqual(oResult.response.VariantId, "customer.TestId", "then the variant id is correct");
					assert.strictEqual(oResult.response.CatalogIds[0], "TEST_CATALOG", "then the new app variant has been added to a correct catalog ");
				});
			}.bind(this));
		});

		QUnit.test("When triggerCatalogAssignment() method is called on S4/Hana on premise", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogAssignment(oDescriptor).then(function(oResult) {
					assert.ok(true, "then the promise is resolved");
				});
			}.bind(this));
		});

		QUnit.test("When triggerCatalogAssignment() method is called and response is failed", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants\/customer.TestId/, [
				400,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				"Backend Error"
			]);

			oServer.autoRespond = true;

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log,"error").callThrough().withArgs("App variant error: ", "error").returns();

			var fnShowRelevantDialog = sandbox.spy(AppVariantUtils, "showRelevantDialog");

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogAssignment(oDescriptor).catch(
					function() {
						assert.ok("then the promise got rejected");
						assert.ok(fnShowRelevantDialog.calledOnce, "then the showRelevantDialog method is called once");
					}
				);
			}.bind(this));
		});


		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana Cloud ('Save As' is triggered from RTA Toolbar)", function (assert) {
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
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
					sap.ushell = originalUShell;
					delete window.bUShellNavigationTriggered;
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana on premise ('Save As' is triggered from RTA Toolbar)", function (assert) {
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
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
					sap.ushell = originalUShell;
					delete window.bUShellNavigationTriggered;
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana Cloud ('Save As' is triggered from app variant overview list)", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves(true);

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, false).then(function(bSuccess) {
					assert.ok(bSuccess, "then the app variant overview list gets opened");
					assert.ok(fnAppVariantFeatureSpy.calledOnce, "then the onGetOverview() method is called once");
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana on premise ('Save As' is triggered from app variant overview list)", function (assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves(true);

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, false).then(function(bSuccess) {
					assert.ok(bSuccess, "then the app variant overview list gets opened");
					assert.ok(fnAppVariantFeatureSpy.calledOnce, "then the onGetOverview() method is called once");
				});
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});

});