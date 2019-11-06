/* global QUnit*/

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/fl/FlexController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/thirdparty/sinon-4"
],
function(
	RuntimeAuthoring,
	OverlayRegistry,
	FlexUtils,
	FlexController,
	UIComponent,
	View,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var server;

	function before () {
		this.oView = new View({});
		var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
			metadata: {
				manifest: {
					"sap.app": {
						"id": "fixture.application"
					}
				}
			},
			createContent: function() {
				return this.oView;
			}.bind(this)
		});

		this.oComponent = new FixtureComponent();
	}

	function after () {
		this.oView.destroy();
		this.oComponent.destroy();
	}

	QUnit.module("Given that RuntimeAuthoring and ControllerExtension service are created and 'add' is called", {
		before: before,
		after: after,
		beforeEach: function () {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oView
			});
			this.iCreateBaseChangeCounter = 0;
			this.iAddPreparedChangeCounter = 0;
			sandbox.stub(this.oRta, "_getFlexController").returns({
				createBaseChange: function(oChangeSpecificData) {
					this.iCreateBaseChangeCounter ++;
					this.oCreateBaseChangeParameter = oChangeSpecificData;
					return {
						getDefinition: function() {
							return {definition: "definition"};
						}
					};
				}.bind(this),
				addPreparedChange: function() {
					this.iAddPreparedChangeCounter ++;
				}.bind(this),
				getResetAndPublishInfo: function() {
					return Promise.resolve({
						isResetEnabled : false,
						isPublishEnabled : false
					});
				}
			});
			sandbox.stub(FlexUtils, "getAppComponentForControl");
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

			return this.oControllerExtension.add("foo.js", this.oView.getId()).then(function (oDefinition) {
				assert.deepEqual(oDefinition, {definition: "definition"}, "the function returns the definition of the change");
				assert.equal(this.iCreateBaseChangeCounter, 1, "and FlexController.createBaseChange was called once");
				assert.equal(this.iAddPreparedChangeCounter, 1, "and FlexController.addPreparedChange was called once");
				assert.equal(this.oCreateBaseChangeParameter.changeType, "codeExt", "the changeType was set correctly");
				assert.equal(this.oCreateBaseChangeParameter.selector.controllerName, "controllerName", "the controllerName was set correctly");
				assert.equal(this.oCreateBaseChangeParameter.content.codeRef, "foo.js", "the codeRef was set correctly");
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
				assert.equal(this.iCreateBaseChangeCounter, 0, "and FlexController.createBaseChange was not called");
				assert.equal(this.iAddPreparedChangeCounter, 0, "and FlexController.addPreparedChange was not called");
			}.bind(this));
		});

		QUnit.test("with missing codeRef parameter and developer mode = true", function(assert) {
			assert.expect(3);
			return this.oControllerExtension.add().then(function() {
				assert.ok(false, "should never go here");
			})
			.catch(function(oError) {
				assert.equal(oError.message, "can't create controller extension without codeRef", "then ControllerExtension.add throws an error");
				assert.equal(this.iCreateBaseChangeCounter, 0, "and FlexController.createBaseChange was not called");
				assert.equal(this.iAddPreparedChangeCounter, 0, "and FlexController.addPreparedChange was not called");
			}.bind(this));
		});

		QUnit.test("with codeRef parameter not ending with '.js' and developer mode = true", function(assert) {
			assert.expect(3);
			return this.oControllerExtension.add("foo").then(function() {
				assert.ok(false, "should never go here");
			})
			.catch(function(oError) {
				assert.equal(oError.message, "codeRef has to end with 'js'", "then ControllerExtension.add throws an error");
				assert.equal(this.iCreateBaseChangeCounter, 0, "and FlexController.createBaseChange was not called");
				assert.equal(this.iAddPreparedChangeCounter, 0, "and FlexController.addPreparedChange was not called");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring and ControllerExtension service are created and 'getTemplate' is called", {
		before: before,
		after: after,
		beforeEach: function () {
			server = sinon.fakeServer.create();
			server.respondImmediately = true;

			this.oRta = new RuntimeAuthoring({
			showToolbars: false,
			rootControl: this.oView
			});

			sandbox.stub(FlexController.prototype, "getResetAndPublishInfo").resolves({
				isResetEnabled : false,
				isPublishEnabled : false
			});

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