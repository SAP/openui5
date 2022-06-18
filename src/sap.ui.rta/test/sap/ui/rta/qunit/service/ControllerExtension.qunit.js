/* global QUnit*/

sap.ui.define([
	"sap/m/App",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	App,
	XMLView,
	ComponentContainer,
	UIComponent,
	OverlayRegistry,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	FlexUtils,
	ReloadManager,
	RuntimeAuthoring,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var server;

	function before() {
		QUnit.config.fixture = null;
		var oViewContent = '<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core"><Button text="foo" /></mvc:View>';
		var oView;
		var oViewPromise;
		var FixtureComponent = UIComponent.extend("sap.ui.rta.service.controllerExtension", {
			metadata: {
				manifest: {
					"sap.app": {
						id: "sap.ui.rta.service.controllerExtension"
					}
				}
			},
			createContent: function() {
				var oApp = new App(this.createId("mockapp"));
				oViewPromise = XMLView.create({
					id: this.createId("mockview"),
					definition: oViewContent
				}).then(function(oCreatedView) {
					oView = oCreatedView;
					oApp.addPage(oCreatedView);
					return oCreatedView.loaded();
				});
				return oApp;
			}
		});
		this.oComponent = new FixtureComponent("sap.ui.rta.service.controllerExtension");
		return oViewPromise.then(function() {
			this.oView = oView;
			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComponent
			}).placeAt("qunit-fixture");
		}.bind(this));
	}

	function after() {
		QUnit.config.fixture = '';
		this.oComponentContainer.destroy();
	}

	QUnit.module("Given that RuntimeAuthoring and ControllerExtension service are created and 'add' is called", {
		before: before,
		after: after,
		beforeEach: function () {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});
			this.iCreateChangeCounter = 0;
			this.iAddChangeCounter = 0;
			sandbox.stub(ChangesWriteAPI, "create").callsFake(function (mPropertyBag) {
				this.iCreateChangeCounter++;
				this.oCreateChangeParameter = mPropertyBag.changeSpecificData;
				return {
					getDefinition: function () {
						return {definition: "definition"};
					}
				};
			}.bind(this));

			sandbox.stub(PersistenceWriteAPI, "add").callsFake(function() {
				this.iAddChangeCounter++;
			}.bind(this));
			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfoFromSession").returns({
				isResetEnabled: true,
				isPublishEnabled: true
			});
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves(false);
			return this.oRta.start().then(function () {
				return this.oRta.getService("controllerExtension").then(function(oService) {
					this.oControllerExtension = oService;
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with correct parameters and developer mode = true", function(assert) {
			sandbox.stub(this.oView, "getController").returns({
				getMetadata: function() {
					return {
						getName: function() {
							return "controllerName";
						}
					};
				}
			});
			sandbox.stub(FlexUtils, "buildLrepRootNamespace");
			this.oRta.setFlexSettings({
				developerMode: true,
				scenario: "scenario"
			});

			return this.oControllerExtension.add("coding/foo.js", this.oView.getId()).then(function (oDefinition) {
				assert.deepEqual(oDefinition, {definition: "definition"}, "the function returns the definition of the change");
				assert.equal(this.iCreateChangeCounter, 1, "and ChangesWriteAPI.create was called once");
				assert.equal(this.iAddChangeCounter, 1, "and PersistenceWriteAPI.add was called once");
				assert.equal(this.oCreateChangeParameter.changeType, "codeExt", "the changeType was set correctly");
				assert.equal(this.oCreateChangeParameter.selector.controllerName, "controllerName", "the controllerName was set correctly");
				assert.equal(this.oCreateChangeParameter.content.codeRef, "coding/foo.js", "the codeRef was set correctly");
				assert.equal(this.oCreateChangeParameter.moduleName, "sap/ui/rta/service/controllerExtension/changes/coding/foo", "the moduleName was set correctly");
			}.bind(this));
		});

		QUnit.test("with correct parameters and developer mode = false", function(assert) {
			this.oRta.setFlexSettings({developerMode: false});
			assert.expect(3);

			return this.oControllerExtension.add("foo.js").then(function() {
				assert.ok(false, "should never go here");
			})
			.catch(function(oError) {
				assert.equal(oError.message, "code extensions can only be created in developer mode", "then ControllerExtension.add throws an error");
				assert.equal(this.iCreateChangeCounter, 0, "and ChangesWriteAPI.create was not called");
				assert.equal(this.iAddChangeCounter, 0, "and PersistenceWriteAPI.add was not called");
			}.bind(this));
		});

		QUnit.test("with missing codeRef parameter and developer mode = true", function(assert) {
			assert.expect(3);
			return this.oControllerExtension.add().then(function() {
				assert.ok(false, "should never go here");
			})
			.catch(function(oError) {
				assert.equal(oError.message, "can't create controller extension without codeRef", "then ControllerExtension.add throws an error");
				assert.equal(this.iCreateChangeCounter, 0, "and ChangesWriteAPI.create was not called");
				assert.equal(this.iAddChangeCounter, 0, "and PersistenceWriteAPI.add was not called");
			}.bind(this));
		});

		QUnit.test("with codeRef parameter not ending with '.js' and developer mode = true", function(assert) {
			assert.expect(3);
			return this.oControllerExtension.add("foo").then(function() {
				assert.ok(false, "should never go here");
			})
			.catch(function(oError) {
				assert.equal(oError.message, "codeRef has to end with 'js'", "then ControllerExtension.add throws an error");
				assert.equal(this.iCreateChangeCounter, 0, "and ChangesWriteAPI.create was not called");
				assert.equal(this.iAddChangeCounter, 0, "and PersistenceWriteAPI.add was not called");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring and ControllerExtension service are created and 'getTemplate' is called", {
		before: before,
		after: after,
		beforeEach: function () {
			server = sinon.fakeServer.create();
			server.respondImmediately = true;

			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfoFromSession").returns({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves(false);
			return this.oRta.start().then(function () {
				return this.oRta.getService("controllerExtension").then(function(oService) {
					this.oControllerExtension = oService;
					this.oViewOverlay = OverlayRegistry.getOverlay(this.oView);
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
			server.restore();
		}
	}, function () {
		QUnit.test("with a template available in debug sources", function(assert) {
			var sPath = "sap/ui/rta/service/ControllerExtension";
			sandbox.stub(this.oViewOverlay.getDesignTimeMetadata(), "getControllerExtensionTemplate").returns(sPath);

			server.respondWith(sap.ui.require.toUrl(sPath) + "-dbg.js", [200, {"Content-Type": "html/text"}, "abc"]);
			return this.oControllerExtension.getTemplate(this.oView.getId()).then(function(sTemplate) {
				assert.equal(sTemplate, "abc", "the service returned the template");
			});
		});

		QUnit.test("with a template available, but no debug sources", function(assert) {
			var sPath = "sap/ui/rta/service/ControllerExtension";
			sandbox.stub(this.oViewOverlay.getDesignTimeMetadata(), "getControllerExtensionTemplate").returns(sPath);
			server.respondWith(sap.ui.require.toUrl(sPath) + "-dbg.js", [404, {}, ""]);
			server.respondWith(sap.ui.require.toUrl(sPath) + ".js", [200, {"Content-Type": "html/text"}, "def"]);

			return this.oControllerExtension.getTemplate(this.oView.getId()).then(function(sTemplate) {
				assert.equal(sTemplate, "def", "the service returned the template");
			});
		});

		QUnit.test("with no overlay for the given view ID", function(assert) {
			return this.oControllerExtension.getTemplate("invalidID").then(function() {
				assert.ok(false, "should never go here");
			})
			.catch(function(oError) {
				assert.equal(oError.message, "no overlay found for the given view ID", "then ControllerExtension.getTemplate throws an error");
			});
		});

		QUnit.test("with template available that can't be found", function(assert) {
			sandbox.stub(this.oViewOverlay.getDesignTimeMetadata(), "getControllerExtensionTemplate").returns("undefined");
			server.respondWith(sap.ui.require.toUrl("undefined") + "-dbg.js", [404, {}, ""]);
			server.respondWith(sap.ui.require.toUrl("undefined") + ".js", [404, {}, ""]);

			return this.oControllerExtension.getTemplate(this.oView.getId())
			.then(function() {
				assert.ok(false, "should not go in here");
			})
			.catch(function(oError) {
				assert.ok(oError, "an error was thrown");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});