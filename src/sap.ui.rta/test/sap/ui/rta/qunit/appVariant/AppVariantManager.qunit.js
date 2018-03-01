/* global QUnit  */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/thirdparty/sinon",
	"sap/ui/fl/registry/Settings",
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/command/LREPSerializer"
],
function(
	AppVariantManager,
	RtaAppVariantFeature,
	DescriptorVariantFactory,
	sinon,
	Settings,
	S4HanaCloudBackend,
	Stack,
	LREPSerializer
) {

	"use strict";

	QUnit.start();
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an AppVariantManager is instantiated", {
		beforeEach: function () {
			var oRootControl = new sap.ui.core.Control();
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
			var done = assert.async();
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

			var oOpenDialogStub = sandbox.stub(this.oAppVariantManager, "_openDialog", fnSimulateDialogSelectionAndSave);

			return this.oAppVariantManager.processSaveAsDialog(oDescriptor).then(function(oAppVariantData){
				assert.ok(oOpenDialogStub.calledOnce, "the _openDialog is called only once");
				assert.strictEqual(oAppVariantData.title, "App Variant Title", "then the title is correct");
				assert.strictEqual(oAppVariantData.subTitle, "App Variant Subtitle", "then the subtitle is correct");
				assert.strictEqual(oAppVariantData.description, "App Variant Description", "then the description is correct");
				assert.strictEqual(oAppVariantData.icon, "App Variant Icon", "then the icon is correct");
				assert.strictEqual(oAppVariantData.idRunningApp, "TestId", "then the running app id is correct");
				done();
			});
		});
	});

	var oServer;

	QUnit.module("Given an AppVariantManager is instantiated for different platforms", {
		beforeEach: function () {
			var oRootControl = new sap.ui.core.Control();
			var oRtaCommandStack = new Stack();
			var oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: oRootControl});
			this.oAppVariantManager = new AppVariantManager({rootControl: oRootControl, commandSerializer: oCommandSerializer});

			oServer = sinon.fakeServer.create();

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "getInboundInfo").returns({
				currentRunningInbound: "customer.savedAsAppVariant",
				addNewInboundRequired: true
			});

			var oParsedHashStub = {
				semanticObject: "testSemanticObject",
				action: "testAction"
			};
			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "getURLParsedHash").returns(oParsedHashStub);

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
			var done = assert.async();

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

			oServer.respondWith("GET", /\/sap\/bc\/lrep\/actions\/gettransports/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse)
			]);

			oServer.autoRespond = true;

			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).then(function(oAppVariantDescriptor) {
				assert.ok(true, "then the promise has been resolved with an app variant descriptor");
				assert.strictEqual(oAppVariantDescriptor._sTransportRequest, "4711", "then the transport is correctly set");
				done();
			});
		});

		QUnit.test("When createDescriptor() method is called on S4/Hana Cloud", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			));

			var oResponse = {
				"transports": [{
					"locked" : true
				}]
			};

			oServer.respondWith("GET", /\/sap\/bc\/lrep\/actions\/gettransports/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse)
			]);

			oServer.autoRespond = true;

			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).then(function(oAppVariantDescriptor) {
				assert.ok(true, "then the promise has been resolved with an app variant descriptor");
				assert.strictEqual(oAppVariantDescriptor._sTransportRequest, "ATO_NOTIFICATION", "then the transport is correctly set");
				done();
			});
		});

		QUnit.test("When createDescriptor() method is called on S4/Hana on premise with no transport info", function (assert) {
			var done = assert.async();

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
					"locked" : true
				}]
			};

			oServer.respondWith("GET", /\/sap\/bc\/lrep\/actions\/gettransports/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oResponse)
			]);

			oServer.autoRespond = true;

			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).then(function(oAppVariantDescriptor) {
				assert.ok(true, "then the promise has been resolved with an app variant descriptor");
				done();
			});
		});

		QUnit.test("When createDescriptor() method is failed", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			oServer.respondWith("GET", /\/sap\/bc\/lrep\/actions\/gettransports/, [
				404,
				{
					"Content-Type": "application/json"
				},
				"Backend error"
			]);

			oServer.autoRespond = true;

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));
			return this.oAppVariantManager.createDescriptor(this.oAppVariantData).catch(
				function(bSuccess) {
					assert.equal(bSuccess, false, "Error: An unexpected exception occured" );
					done();
				}
			);
		});
	});

	QUnit.module("Given an AppVariantManager is instantiated for different platforms", {
		beforeEach: function () {
			var oRootControl = new sap.ui.core.Control();
			var oRtaCommandStack = new Stack();
			var oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: oRootControl});
			this.oAppVariantManager = new AppVariantManager({rootControl: oRootControl, commandSerializer: oCommandSerializer});
			oServer = sinon.fakeServer.create();
		},
		afterEach: function () {
			sandbox.restore();
			oServer.restore();
		}
	}, function() {

		QUnit.test("When saveAppVariantToLREP() method is called and response is successful", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

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
					done();
				});
			}.bind(this));
		});

		QUnit.test("When saveAppVariantToLREP() method is called and response is failed", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants/, [
				400,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				"Backend Error"
			]);

			oServer.autoRespond = true;

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.saveAppVariantToLREP(oDescriptor).catch(
					function(bSuccess) {
						assert.equal(bSuccess, false, "Error: An unexpected exception occured" );
						done();
					}
				);
			}.bind(this));
		});

		QUnit.test("When copyUnsavedChangesToLREP() method is called without any unsaved changes", function (assert) {
			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oDescriptor = {
				"sap.app" : {
					id : "TestId",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

			return this.oAppVariantManager.copyUnsavedChangesToLREP("AppVariantId", true).then(function() {
				assert.ok("then the promise is resolved");
			});
		});

		QUnit.test("When triggerCatalogAssignment() method is called on S4/Hana Cloud", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			));

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
					done();
				});
			}.bind(this));
		});

		QUnit.test("When triggerCatalogAssignment() method is called on S4/Hana on premise", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogAssignment(oDescriptor).then(function(oResult) {
					assert.ok(true, "then the promise is resolved");
					done();
				});
			}.bind(this));
		});

		QUnit.test("When triggerCatalogAssignment() method is called and response is failed", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			));

			oServer.respondWith("POST", /\/sap\/bc\/lrep\/appdescr_variants\/customer.TestId/, [
				400,
				{
					"Content-Type": "application/json",
					"X-CSRF-Token": "0987654321"
				},
				"Backend Error"
			]);

			oServer.autoRespond = true;

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.reject(false));

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.triggerCatalogAssignment(oDescriptor).catch(
					function(bSuccess) {
						assert.equal(bSuccess, false, "Error: An unexpected exception occured" );
						done();
					}
				);
			}.bind(this));
		});


		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana Cloud ('Save As' is triggered from RTA Toolbar)", function (assert) {
			var done = assert.async();

			window.bUShellNavigationTriggered = false;
			var originalUShell = sap.ushell;

			sap.ushell = jQuery.extend({}, sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							}
						};
					}
				},
				services : {
					AppConfiguration: {
						getCurrentApplication: function(oApplication) {
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

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			));

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
					sap.ushell = originalUShell;
					delete window.bUShellNavigationTriggered;
					done();
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana on premise ('Save As' is triggered from RTA Toolbar)", function (assert) {
			var done = assert.async();

			window.bUShellNavigationTriggered = false;
			var originalUShell = sap.ushell;

			sap.ushell = jQuery.extend({}, sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							toExternal : function() {
								window.bUShellNavigationTriggered = true;
							}
						};
					}
				},
				services : {
					AppConfiguration: {
						getCurrentApplication: function(oApplication) {
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

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
					sap.ushell = originalUShell;
					delete window.bUShellNavigationTriggered;
					done();
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana Cloud ('Save As' is triggered from app variant overview list)", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			));

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").returns(Promise.resolve(true));

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, false).then(function(bSuccess) {
					assert.ok(bSuccess, "then the app variant overview list gets opened");
					assert.ok(fnAppVariantFeatureSpy.calledOnce, "then the onGetOverview() method is called once");
					done();
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessageAndTriggerActionFlow() method is called on S4/Hana on premise ('Save As' is triggered from app variant overview list)", function (assert) {
			var done = assert.async();

			sandbox.stub(Settings, "getInstance").returns(Promise.resolve(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			));

			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "showRelevantDialog").returns(Promise.resolve());

			var fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").returns(Promise.resolve(true));

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.showSuccessMessageAndTriggerActionFlow(oDescriptor, false).then(function(bSuccess) {
					assert.ok(bSuccess, "then the app variant overview list gets opened");
					assert.ok(fnAppVariantFeatureSpy.calledOnce, "then the onGetOverview() method is called once");
					done();
				});
			}.bind(this));
		});
	});
});