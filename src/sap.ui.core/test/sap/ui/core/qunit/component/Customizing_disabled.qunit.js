sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/View',
	'sap/ui/qunit/QUnitUtils'
], function(Component, ComponentContainer, Controller, View, qutils) {

	"use strict";
	/*global QUnit, sinon */

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

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
			}).then(function() {
				sap.ui.getCore().applyChanges();
			});
		},
		after: function() {
			oCompCont.destroy();
			oComp.destroy();
		}
	});


	// TESTS

	QUnit.test("CustomizingConfiguration available", function(assert) {
		assert.expect(1);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.ok(CustomizingConfiguration, "CustomizingConfiguration should be available now without requiring it");
	});

	QUnit.test("CustomizingConfiguration returning no customizing data", function(assert) {
		assert.expect(4);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.strictEqual(CustomizingConfiguration.getViewReplacement("samples.components.ext.sap.Sub1"),
				undefined,
				"CustomizingConfiguration should return no View replacement data");
		assert.strictEqual(CustomizingConfiguration.getViewExtension("testdata.customizing.sap.Sub2", "extension2"),
				undefined,
				"CustomizingConfiguration should return no View extension data");
		assert.strictEqual(CustomizingConfiguration.getControllerExtension("testdata.customizing.sap.Sub2"),
				undefined,
				"CustomizingConfiguration should return no Controller extension data");
		assert.strictEqual(CustomizingConfiguration.getCustomProperties("testdata.customizing.sap.Sub3", "customizableText"),
				undefined,
				"CustomizingConfiguration should return no View modification data");
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
		qutils.triggerEvent("click", "theComponent---mainView--sub2View--standardBtnWithStandardAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
		assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should still not have been called");

		// check members
		var oController = sap.ui.getCore().byId("theComponent---mainView--sub2View").getController();
		assert.ok(oController, "Extended Sub2 View should have a Controller");
		assert.ok(oController.originalSAPAction, "Extended Sub2 controller should have an originalSAPAction method");
		assert.ok(!oController.customerAction, "Extended Sub2 controller should have no customerAction method");
		assert.equal(oController.originalSAPAction(), "ori", "originalSAPAction method of extended controller should return 'ori'");
	});


	QUnit.test("Controller Extension (sap.ui.controller)", function(assert) {
		oComp.runAsOwner(function() {
			var oController = sap.ui.controller("testdata.customizing.sap.Sub2");
			assert.ok(oController.isExtended === undefined, "Controller has not been extended with sap.ui.controller factory function!");
		});
	});

	QUnit.test("Controller Extension (Code Extensibility)", function(assert) {

		// check lifecycle methods
		assert.equal(oLifecycleSpy.callCount, 3, "3 lifecycle methods should be called");
		// check calling order
		assert.equal(oLifecycleSpy.getCall(0).args[0], "Sub6 Controller onInit()", "1st lifecycle method to be called should be: Sub6 Controller onInit()");

		assert.equal(oLifecycleSpy.getCall(1).args[0], "Sub6 Controller onBeforeRendering()", "2nd lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering()");

		assert.equal(oLifecycleSpy.getCall(2).args[0], "Sub6 Controller onAfterRendering()", "3rd lifecycle method to be called should be: Sub6 Controller onAfterRendering()");

	});


	// View/Property Modifications

	QUnit.test("Property Modifications", function(assert) {
		var oControl = sap.ui.getCore().byId("theComponent---mainView--sub3View--customizableText");
		assert.strictEqual(oControl.getVisible(), true, "'visible' property should not be customized");
		assert.strictEqual(oControl.getEnabled(), true, "'enabled' property should not be customized");
	});


	// ExtensionPoint default content

	QUnit.test("ExtensionPoint default content", function(assert) {
		var oFirstItem = sap.ui.getCore().byId("__item0-theComponent---mainView--sub2View--lb-0");

		assert.ok(oFirstItem, "First ListItem should exist");
		assert.ok(oFirstItem.getDomRef(), "First ListItem should be rendered");
		assert.equal(oFirstItem.getAdditionalText(), "(Original SAP ListItem)", "First ListItem should be the default one");
	});

});