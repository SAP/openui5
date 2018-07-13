/* global QUnit*/
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/service/ControllerExtension",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/fl/Utils",
	"sap/ui/dt/Util",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/thirdparty/sinon-4"
],
function(
	ControllerExtension,
	RuntimeAuthoring,
	FlexUtils,
	DtUtil,
	UIComponent,
	View,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that RuntimeAuthoring and ControllerExtension service are created and add function is called...", {
		before: function () {
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
		},
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
				}.bind(this)
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

	QUnit.start();
});