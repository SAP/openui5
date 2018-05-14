/* global QUnit */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

// Restrict coverage to sap/ui/core/util/reflection/
if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/core/util/reflection/]");
}
QUnit.config.autostart = false;

sap.ui.define([
	'sap/m/Button',
	'sap/m/Page',
	'sap/f/DynamicPageTitle',
	'sap/ui/core/util/reflection/JsControlTreeModifier'
],
function(
	Button,
	Page,
	DynamicPageTitle,
	JsControlTreeModifier
) {
	"use strict";

	QUnit.module("Using the JsControlTreeModifier...", {
		beforeEach: function () {

			jQuery.sap.registerModulePath("sap.ui.test", "../../component/testdata");
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});

		},

		afterEach: function () {
			this.oComponent.destroy();
		}
	});

	QUnit.test("the constructor processes parameters", function (assert) {
		var sButtonText = "ButtonText";
		this.oButton = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText});
		assert.equal(this.oButton.getText(), sButtonText);

		// clean
		this.oButton.destroy();
		this.oButton = null;
	});

	QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 1 - no overwritten methods in parent control", function (assert) {
		// arrange
		this.oPage = JsControlTreeModifier.createControl('sap.m.Page', this.oComponent, undefined, "myPage");

		for (var i = 0; i < 3; i++) {
			this.oButton = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton" + i, {'text' : 'ButtonText' + i});
			JsControlTreeModifier.insertAggregation(this.oPage, 'content', this.oButton, i);
		}

		// assert
		assert.strictEqual(this.oPage.getContent().length, 3, "There are exactly 3 buttons inside of the page");
		assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButton), 2, "The index of the lastly created button is corrctly found");

		// clean
		this.oPage.destroy();
		this.oPage = null;
	});

	QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 2 - with overwritten methods in parent control", function (assert) {
		// arrange
		this.oDynamicPageTitle = JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle");
		this.oButtonOutsideAggregation = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myActionNotUsed", {'text' : 'This is not used'});

		for (var i = 0; i < 3; i++) {
			this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myAction" + i, {'text' : 'ButtonText' + i});
			JsControlTreeModifier.insertAggregation(this.oDynamicPageTitle, 'actions', this.oControl, i);
		}

		// assert
		assert.strictEqual(this.oDynamicPageTitle.getActions().length, 3, "There are exactly 3 actions inside of the dynamic page title");
		assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oControl), 2, "The index of the lastly created button is corrctly found");
		assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oButtonOutsideAggregation), -1, "The action is not in this aggregation and is not found.");

		// clean
		this.oDynamicPageTitle.destroy();
		this.oButtonOutsideAggregation.destroy();

		this.oDynamicPageTitle = null;
		this.oButtonOutsideAggregation = null;
	});

	QUnit.test("the modifier finds the index of the control in its parent aggregation correctly, case 3 - singular aggregation", function (assert) {
		// arrange
		this.oDynamicPageTitle = JsControlTreeModifier.createControl('sap.f.DynamicPageTitle', this.oComponent, undefined, "myDynamicPageTitle1");
		this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButtonInHeading", {'text' : 'ButtonInHeading'});

		JsControlTreeModifier.insertAggregation(this.oDynamicPageTitle, 'heading', this.oControl);

		// assert
		assert.strictEqual(JsControlTreeModifier.findIndexInParentAggregation(this.oControl), 0, "The index of the lastly created button is correctly found");

		// clean
		this.oDynamicPageTitle.destroy();
		this.oDynamicPageTitle = null;
	});

	QUnit.module("Given the JsControlTreeModifier...", {
		beforeEach: function () {

			jQuery.sap.registerModulePath("sap.ui.test", "../../component/testdata");
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.other",
				id: "testComponent"
			});

		},

		afterEach: function () {
			this.oComponent.destroy();
			this.oControl.destroy();
		}
	});

	QUnit.test("when the modifier retrieves the change handler module for a control with instance specific change handler module", function(assert){
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

	QUnit.test("when the modifier tries to retrieve the change handler module for a control without instance specific change handler module", function(assert){
		this.oControl = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton",
				{'text' : 'ButtonInHeading'});

		var sChangeHandlerModulePath = JsControlTreeModifier.getChangeHandlerModulePath(this.oControl);

		assert.equal(sChangeHandlerModulePath, undefined, "then 'undefined' is returned");
	});

	QUnit.test("applySettings", function(assert){
		this.oControl= new Button();

		JsControlTreeModifier.applySettings(this.oControl, { text: "Test", enabled: false});		
		
		assert.equal(JsControlTreeModifier.getProperty(this.oControl, "enabled"), false, "the button is not enabled from applySettings");
		assert.equal(JsControlTreeModifier.getProperty(this.oControl, "text"), "Test", "the buttons text is set from applySettings");
	});

	QUnit.test("isPropertyInitial", function(assert){
		this.oControl= new Button( { text: "Test"  });
		
		assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "enabled"), true, "the enabled property of the button is initial");
		assert.equal(JsControlTreeModifier.isPropertyInitial(this.oControl, "text"), false, "the text property of the button is not initial");
	});

	QUnit.start();
});