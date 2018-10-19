/* global QUnit*/

sap.ui.define([
	'sap/m/Button',
	'sap/m/Page',
	'sap/f/DynamicPageTitle',
	'sap/ui/core/util/reflection/JsControlTreeModifier',
	"sap/ui/core/StashedControlSupport",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Button,
	Page,
	DynamicPageTitle,
	JsControlTreeModifier,
	StashedControlSupport,
	UIComponent,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Using the JsControlTreeModifier...", {
		beforeEach: function () {
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});
		},

		afterEach: function () {
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {

		QUnit.test("the constructor processes parameters", function (assert) {
			var sButtonText = "ButtonText";
			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText});
			assert.equal(this.oControl.getText(), sButtonText);
		});

		QUnit.test("the createControl is called asynchronously", function (assert) {
			var sButtonText = "ButtonText";
			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText}, true)
				.then(function(oButton) {
					this.oControl = oButton;
					assert.equal(oButton.getText(), sButtonText);
				}.bind(this));
		});

		QUnit.test("the createControl is called asynchronously, expecting an error after loading", function (assert) {
			var sButtonText = "ButtonText";
			sandbox.stub(sap.ui, "require").callThrough().withArgs(["sap/m/Button"]).callsArgWithAsync(2);
			return JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText}, true)
				.then(function() {
					assert.notOk(true, "then the promise shouldn't be resolved");
				})
				.catch(function(oError) {
					assert.equal(oError.message,
						"Required control 'sap.m.Button' couldn't be created asynchronously",
						"then the promise is rejected with the expected message");
				});
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 1 - no overwritten methods in parent control", function (assert) {
			// arrange
			this.oControl = JsControlTreeModifier.createControl('sap.m.Page', this.oComponent, undefined, "myPage");

			for (var i = 0; i < 3; i++) {
				this["oButton" + i] = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + i, {'text' : 'ButtonText' + i});
				JsControlTreeModifier.insertAggregation(this.oControl, 'content', this["oButton" + i], i);
			}

			// assert
			assert.strictEqual(this.oControl.getContent().length, 3, "There are exactly 3 buttons inside of the page");
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButton2), 2, "then the index of the most recently created button is found correctly");
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 2 - with overwritten methods in parent control", function (assert) {
			// arrange
			this.oControl = JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle");
			this.oButtonOutsideAggregation = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myActionNotUsed", {'text' : 'This is not used'});

			for (var i = 0; i < 3; i++) {
				this["oButton" + i] = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + i, {'text' : 'ButtonText' + i});
				JsControlTreeModifier.insertAggregation(this.oControl, 'actions', this["oButton" + i], i);
			}

			// assert
			assert.strictEqual(this.oControl.getActions().length, 3, "There are exactly 3 actions inside of the dynamic page title");
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButton2), 2, "then the index of the most recently created button is found correctly");
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButtonOutsideAggregation), -1, "The action is not in this aggregation and is not found.");

			this.oButtonOutsideAggregation.destroy();
		});

		QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 3 - singular aggregation", function (assert) {
			// arrange
			this.oControl = JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle");
			this.oButton = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButtonInHeading", {'text' : 'ButtonInHeading'});

			JsControlTreeModifier.insertAggregation(this.oControl, 'heading', this.oButton);

			// assert
			assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButton), 0, "then the index of the most recently created button is found correctly");
		});
	});

	QUnit.module("Given the JsControlTreeModifier...", {
		beforeEach: function () {
			sap.ui.loader.config({paths:{"sap/ui/test":"../../component/testdata"}});
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});
		},
		afterEach: function () {
			this.oComponent.destroy();
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function () {

		QUnit.test("when the modifier retrieves the change handler module for a control with instance-specific change handler module", function(assert){
			var sDummyModulePath = '/dummy/path/to/dummy/file.flexibility';

			var mCustomData = {
					'key' : 'sap-ui-custom-settings',
					'value' : {
						'sap.ui.fl' : {
							'flexibility' : sDummyModulePath
						}
					}
				};

			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton",
					{'text' : 'ButtonInHeading', 'customData' : mCustomData});

			var sChangeHandlerModulePath = JsControlTreeModifier.getChangeHandlerModulePath(this.oControl);

			assert.equal(sChangeHandlerModulePath, sDummyModulePath, "then the correct module is returned");
		});

		QUnit.test("when the modifier tries to retrieve the change handler module for a control without instance-specific change handler module", function(assert){
			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton",
					{'text' : 'ButtonInHeading'});

			var sChangeHandlerModulePath = JsControlTreeModifier.getChangeHandlerModulePath(this.oControl);

			assert.equal(sChangeHandlerModulePath, undefined, "then 'undefined' is returned");
		});

		QUnit.test("applySettings", function(assert){
			this.oControl = new Button();

			JsControlTreeModifier.applySettings(this.oControl, { text: "Test", enabled: false});

			assert.equal(JsControlTreeModifier.getProperty(this.oControl, "enabled"), false, "the button is not enabled from applySettings");
			assert.equal(JsControlTreeModifier.getProperty(this.oControl, "text"), "Test", "the buttons text is set from applySettings");
		});

		QUnit.test("isPropertyInitial", function(assert){
			this.oControl = new Button( { text: "Test"  });
			assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "enabled"), true, "the enabled property of the button is initial");
			assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "text"), false, "the text property of the button is not initial");
		});

		QUnit.test("when getStashed is called for non-stash control with visible property true", function(assert){
			this.oControl = new Button({ text: "Test"  });
			this.oControl.getStashed = function () { };
			var fnGetVisibleSpy = sandbox.spy(this.oControl, "getVisible");
			assert.strictEqual(JsControlTreeModifier.getStashed(this.oControl), false, "then false is returned");
			assert.ok(fnGetVisibleSpy.calledOnce, "then getVisible is called once");
		});

		QUnit.test("when getStashed is called for a stashed control", function(assert){
			this.oControl = new Button({ text: "Test"  });
			this.oControl.getStashed = function () {
				return true;
			};
			var fnGetVisibleSpy = sandbox.spy(this.oControl, "getVisible");
			assert.strictEqual(JsControlTreeModifier.getStashed(this.oControl), true, "then true is returned");
			assert.strictEqual(fnGetVisibleSpy.callCount, 0, "then getVisible is not called");
		});

		QUnit.test("when setStashed is called for an already unstashed control", function(assert){
			this.oControl = new Button({ text: "Test"  });
			this.oControl.getStashed = function () { };
			this.oControl.setStashed = function () {
				assert.ok(false, "then setStashed() should not be called on a non-stash control");
			};
			var fnSetVisibleSpy = sandbox.spy(JsControlTreeModifier, "setVisible");
			JsControlTreeModifier.setStashed(this.oControl, true);

			assert.ok(fnSetVisibleSpy.calledOnce, "then modifier's setVisible() is called once");
			assert.ok(fnSetVisibleSpy.calledWith(this.oControl, false), "then modifier's setVisible() is called with the correct arguments");
			assert.strictEqual(this.oControl.getVisible(), false, "then visible property of control is set to false");
		});

		QUnit.test("when setStashed is called for stash control and no new control is created", function(assert){
			var done = assert.async();
			this.oControl = new Page("pageId");
			var oStashedControl = StashedControlSupport.createStashedControl("stashedControlId", { sParentId: "pageId" });

			sandbox.stub(JsControlTreeModifier, "setVisible");
			sandbox.stub(oStashedControl, "setStashed").callsFake(function (bValue) {
				assert.ok(!bValue, "then setStashed() called on control");
				done();
			});
			JsControlTreeModifier.setStashed(oStashedControl, false);
			assert.strictEqual(JsControlTreeModifier.setVisible.callCount, 0, "then JsControlTreeModifier setVisible() not called");
			oStashedControl.destroy();
		});

		QUnit.test("when setStashed is called for stash control and a new control is created", function(assert){
			this.oControl = new Page("pageId");
			var oStashedControl = StashedControlSupport.createStashedControl("stashedControlId", { sParentId: "pageId" });

			sandbox.stub(JsControlTreeModifier, "setVisible");

			sandbox.stub(oStashedControl, "setStashed").callsFake(function (bValue) {
				oStashedControl.destroy();
				// new control replaces stashed control
				new Button("stashedControlId");
				assert.ok(!bValue, "then setStashed() called on control");
			});

			var oUnstashedControl = JsControlTreeModifier.setStashed(oStashedControl, false, new UIComponent("mockComponent"));
			assert.ok(oUnstashedControl instanceof Button, "then the returned control is the unstashed control");
			assert.ok(JsControlTreeModifier.setVisible.calledWith(oUnstashedControl, true), "then JsControlTreeModifier setVisible() called for the unstashed control");
			oUnstashedControl.destroy();
		});
	});

});