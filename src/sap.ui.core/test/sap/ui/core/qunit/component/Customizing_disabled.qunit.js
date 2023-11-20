sap.ui.define([
	"sap/ui/base/Event",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Event, Component, ComponentContainer, Element, Controller, createAndAppendDiv, nextUIUpdate) {

	"use strict";
	/*global QUnit, sinon */

	// create content div
	createAndAppendDiv("content");

	// Event handler functions
	var iStandardSub2ControllerCalled = 0;
	this.standardSub2ControllerCalled = function() {
		iStandardSub2ControllerCalled++;
	};

	var iCustomSub2ControllerCalled = 0;
	this.customSub2ControllerCalled = function() {
		iCustomSub2ControllerCalled++;
	};

	var aLifeCycleCalls = this.aLifeCycleCalls = [];

	var oLifecycleSpy = this.oLifecycleSpy = sinon.spy();

	function triggerButtonPress(sButtonId) {
		var oButton = Element.getElementById(sButtonId);
		var oEvent = new Event(sButtonId, oButton, {});
		oButton.firePress(oEvent);
	}


	// UI Construction

	var oComp, oCompCont;

	QUnit.module("", {
		before: function() {
			// load and start the customized application
			return Component.create({
				name: "testdata.customizing.customer",
				id: "theComponent",
				manifest: false
			}).then(function(_oComp) {
				oComp = _oComp;
				oCompCont = new ComponentContainer({
					component: oComp
				});
				oCompCont.placeAt("content");

				// now wait for the root view to load
				return oComp.getRootControl().loaded();
			}).then(nextUIUpdate);
		},
		after: function() {
			oCompCont.destroy();
			oComp.destroy();
		}
	});

	// View Replacement

	QUnit.test("View Replacement", function(assert) {
		assert.ok(!document.getElementById("theComponent---mainView--sub1View--customTextInCustomSub1"), "Replacement View should not be rendered");
		assert.ok(document.getElementById("theComponent---mainView--sub1View--originalSapTextInSub1"), "Original View should be rendered");
	});


	// View Extension

	QUnit.test("View Extension", function(assert) {
		assert.ok(!document.getElementById("theComponent---mainView--sub2View--customFrag1BtnWithCustAction"), "View Extension should not be rendered");
	});


	// Controller Extension

	QUnit.test("Controller Extension", function(assert) {

		// check lifecycle methods
		assert.equal(aLifeCycleCalls.length, 3, "3 lifecycle methods should be called");
		// check calling order
		assert.equal(aLifeCycleCalls[0], "Sub2 Controller onInit()", "1st lifecycle method to be called should be: Sub2 Controller onInit()");
		assert.equal(aLifeCycleCalls[1], "Sub2 Controller onBeforeRendering()", "1st lifecycle method to be called should be: Sub2 Controller onBeforeRendering()");
		assert.equal(aLifeCycleCalls[2], "Sub2 Controller onAfterRendering()", "2nd lifecycle method to be called should be: Sub2 Controller onAfterRendering()");

		assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should not have been called yet");
		assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should not have been called yet");
		// trigger standard action
		triggerButtonPress("theComponent---mainView--sub2View--standardBtnWithStandardAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
		assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should still not have been called");

		// check members
		var oController = Element.getElementById("theComponent---mainView--sub2View").getController();
		assert.ok(oController, "Extended Sub2 View should have a Controller");
		assert.ok(oController.originalSAPAction, "Extended Sub2 controller should have an originalSAPAction method");
		assert.ok(!oController.customerAction, "Extended Sub2 controller should have no customerAction method");
		assert.equal(oController.originalSAPAction(), "ori", "originalSAPAction method of extended controller should return 'ori'");
	});

	QUnit.test("Controller Extension (New Controller.create factory)", function(assert) {
		return oComp.runAsOwner(function() {
			return Controller.create({
				name: "testdata.customizing.sap.Sub2"
			}).then(function(oController) {
				assert.ok(oController.isExtended === undefined, "Controller has not been extended with sap.ui.controller factory function!");
			});
		});
	});

	QUnit.test("Controller Extension (Code Extensibility)", function(assert) {

		// check lifecycle methods
		assert.equal(oLifecycleSpy.callCount, 6, "6 lifecycle methods should be called");
		// check calling order
		assert.equal(oLifecycleSpy.getCall(0).args[0], "Sub6 Controller onInit()", "1st lifecycle method to be called should be: Sub6 Controller onInit()");
		assert.equal(oLifecycleSpy.getCall(1).args[0], "Sub6 Controller onInit()", "2nd lifecycle method to be called should be: Sub6 Controller onInit() - View included 2nd time");

		assert.equal(oLifecycleSpy.getCall(2).args[0], "Sub6 Controller onBeforeRendering()", "3rd lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering()");
		assert.equal(oLifecycleSpy.getCall(3).args[0], "Sub6 Controller onBeforeRendering()", "4th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering() - View included 2nd time");

		assert.equal(oLifecycleSpy.getCall(4).args[0], "Sub6 Controller onAfterRendering()", "5th lifecycle method to be called should be: Sub6 Controller onAfterRendering()");
		assert.equal(oLifecycleSpy.getCall(5).args[0], "Sub6 Controller onAfterRendering()", "6th lifecycle method to be called should be: Sub6 Controller onAfterRendering() - View included 2nd time");

	});


	// View/Property Modifications

	QUnit.test("Property Modifications", function(assert) {
		var oControl = Element.getElementById("theComponent---mainView--sub3View--customizableText");
		assert.strictEqual(oControl.getVisible(), true, "'visible' property should not be customized");
		assert.strictEqual(oControl.getWrapping(), true, "'wrapping' property should not be customized");
	});


	// ExtensionPoint default content

	QUnit.test("ExtensionPoint default content", function(assert) {
		var oFirstItem = Element.getElementById("__item0-theComponent---mainView--sub2View--lb-0");

		assert.ok(oFirstItem, "First ListItem should exist");
		assert.equal(oFirstItem.getAdditionalText(), "(Original SAP ListItem)", "First ListItem should be the default one");
	});

});