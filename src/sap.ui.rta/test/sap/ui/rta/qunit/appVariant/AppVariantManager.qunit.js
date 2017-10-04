/* global QUnit  */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/thirdparty/sinon"
],
function(
	AppVariantManager,
	RtaAppVariantFeature,
	DescriptorVariantFactory,
	sinon) {

	"use strict";

	QUnit.start();
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an AppVariantManager is instantiated", {
		beforeEach: function () {
			this.oAppVariantManager = new AppVariantManager();
		},

		afterEach: function () {
			sandbox.restore();
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
				},
				"sap.ui5" : {
					componentName: "TestIdBaseApp"
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
				assert.strictEqual(oAppVariantData.idBaseApp, "TestIdBaseApp", "then the base app id is correct");
			});
		});
	});

	QUnit.module("Given an AppVariantManager is instantiated", {
		beforeEach: function () {
			this.oAppVariantManager = new AppVariantManager();

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
		},

		afterEach: function () {
			this.oServer.restore();
			sandbox.restore();
			sap.ushell = this.originalUShell;
			delete window.bUShellNavigationTriggered;
		}
	}, function() {

		QUnit.test("When createDescriptor() method is called", function (assert) {
			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "getInboundInfo").returns({
				currentRunningInbound: "customer.savedAsAppVariant",
				addNewInboundRequired: true
			});

			var oParsedHashStub = {
				semanticObject: "testSemanticObject",
				action: "testAction"
			};
			sandbox.stub(sap.ui.rta.appVariant.AppVariantUtils, "getURLParsedHash").returns(oParsedHashStub);

			var oAppVariantData = {
				description: "App Variant Description",
				idRunningApp : "TestId",
				idBaseApp: "TestIdBaseApp",
				title : "App Variant Title",
				subTitle: "App Variant Subtitle",
				icon: "App Variant Icon"
			};

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

			return this.oAppVariantManager.createDescriptor(oAppVariantData).then(function(oAppVariantDescriptor) {
				assert.ok(true, "then the promise has been resolved with an app variant descriptor");
			});
		});

		QUnit.test("When 'SaveAs' button is pressed from RTA toolbar, saveAppVariantDescriptorAndDirtyChangesToLREP() method is called and server response is successful", function (assert) {

			var oRootControl = new sap.ui.core.Control();

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oDescriptor = {
				"sap.app" : {
					id : "TestId"
				}
			};

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				appVersion: "1.2.3",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

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

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.saveDescriptorAndFlexChangesToLREP(oDescriptor, oRootControl, true).then(function() {
					assert.ok(true, "then the descriptor changes and dirty UI changes have been saved to LREP and it navigates to FLP homepage");
				});
			}.bind(this));
		});

		QUnit.test("When 'SaveAs' button is pressed from the app variant overview dialog, saveAppVariantDescriptorAndDirtyChangesToLREP() method is called and server response is successful", function (assert) {

			var oRootControl = new sap.ui.core.Control();

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oDescriptor = {
				"sap.app" : {
					id : "TestId"
				}
			};

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				appVersion: "1.2.3",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

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

			sandbox.stub(RtaAppVariantFeature, "onGetOverview").returns(Promise.resolve(true));

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				return this.oAppVariantManager.saveDescriptorAndFlexChangesToLREP(oDescriptor, oRootControl, false).then(function() {
					assert.ok(true, "then the app variant overview list opens again");
				});
			}.bind(this));
		});

		QUnit.test("When saveAppVariantDescriptorAndDirtyChangesToLREP() method is called and promise is rejected with an error (string)", function (assert) {

			var oRootControl = new sap.ui.core.Control();

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oDescriptor = {
				"sap.app" : {
					id : "TestId"
				}
			};

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				appVersion: "1.2.3",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

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

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				sandbox.stub(oDescriptor, "submit").returns(Promise.reject("Backend error"));

				return this.oAppVariantManager.saveDescriptorAndFlexChangesToLREP(oDescriptor, oRootControl, false).then(function() {
					assert.ok(true, "then the error handling is called");
				});
			}.bind(this));

		});

		QUnit.test("When saveAppVariantDescriptorAndDirtyChangesToLREP() method is called and promise is rejected with an error (object)", function (assert) {

			var oRootControl = new sap.ui.core.Control();

			sandbox.stub(sap.ui.fl.Utils, "getComponentClassName").returns("testComponent");

			var oDescriptor = {
				"sap.app" : {
					id : "TestId"
				}
			};

			var oManifest = new sap.ui.core.Manifest(oDescriptor);
			var oComponent = {
				name: "testComponent",
				appVersion: "1.2.3",
				getManifest : function() {
					return oManifest;
				}
			};

			sandbox.stub(sap.ui.fl.Utils, "getAppComponentForControl").returns(oComponent);

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

			var oError = {
				messages: [{
					text: "Backend error"
				}]
			};

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oDescriptor) {
				sandbox.stub(oDescriptor, "submit").returns(Promise.reject(oError));

				return this.oAppVariantManager.saveDescriptorAndFlexChangesToLREP(oDescriptor, oRootControl, false).then(function() {
					assert.ok(true, "then the error handling is called");
				});
			}.bind(this));
		});
	});
});