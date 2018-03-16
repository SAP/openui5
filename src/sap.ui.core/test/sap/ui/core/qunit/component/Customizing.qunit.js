sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/View'
], function(jQuery, Component, ComponentContainer, Controller, View) {

	"use strict";
	/*global QUnit, sinon, qutils */

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

	// load and start the customized application
	var oComp = sap.ui.component({
		name: "testdata.customizing.customer",
		id: "theComponent"
	});
	var oCompCont = new ComponentContainer({
		component: oComp
	});
	oCompCont.placeAt("content");


	// TESTS
	QUnit.module("CustomizingConfiguration");

	QUnit.test("CustomizingConfiguration available", function(assert) {
		assert.expect(1);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.ok(CustomizingConfiguration, "CustomizingConfiguration should be available now without requiring it");
	});

	QUnit.test("CustomizingConfiguration returning the customizing data", function(assert) {
		assert.expect(8);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.equal(CustomizingConfiguration.getViewReplacement("testdata.customizing.sap.Sub1").viewName,
				"testdata.customizing.customer.CustomSub1",
				"CustomizingConfiguration should return the View replacement data");
		assert.equal(CustomizingConfiguration.getViewExtension("testdata.customizing.sap.Sub2", "extension2").fragmentName,
				"testdata.customizing.customer.CustomFrag1WithCustomerAction",
				"CustomizingConfiguration should return the View extension data");
		assert.equal(CustomizingConfiguration.getViewExtension("testdata.customizing.sap.Frag1", "extensionPointInFragment").fragmentName,
				"testdata.customizing.customer.CustomFrag1",
				"CustomizingConfiguration should return the Fragment extension data");
		assert.equal(CustomizingConfiguration.getControllerReplacement("testdata.customizing.sap.Main"),
				"testdata.customizing.customer.Main",
				"CustomizingConfiguration should return the Controller replacement data");
		assert.equal(CustomizingConfiguration.getControllerExtension("testdata.customizing.sap.Sub2").controllerName,
				"testdata.customizing.customer.Sub2ControllerExtension",
				"CustomizingConfiguration should return the Controller extension data");
		assert.strictEqual(CustomizingConfiguration.getCustomProperties("testdata.customizing.sap.Sub3", "customizableText").visible,
				false,
				"CustomizingConfiguration should return the View modification data");
		assert.strictEqual(CustomizingConfiguration.getCustomProperties("testdata.customizing.sap.Sub4", "customizableText1").visible,
				false,
				"CustomizingConfiguration should return the View modification data");
		assert.strictEqual(CustomizingConfiguration.getCustomProperties("testdata.customizing.sap.Sub5", "Button2").visible,
				false,
				"CustomizingConfiguration should return the View modification data");
	});


	// View Replacement

	QUnit.test("View Replacement", function(assert) {
		assert.ok(jQuery.sap.domById("theComponent---mainView--sub1View--customTextInCustomSub1"), "Replacement XMLView should be rendered");
		assert.ok(!jQuery.sap.domById("theComponent---mainView--sub1View--originalSapTextInSub1"), "Original XMLView should not be rendered");
	});


	// View Extension
	QUnit.test("View Extension", function(assert) {
		assert.ok(jQuery.sap.domById("theComponent---mainView--sub2View--customFrag1BtnWithCustAction"), "XMLView Extension should be rendered");
		assert.ok(jQuery.sap.domById("buttonWithCustomerAction"), "JSView Extension should be rendered");

		// extension within extension
		assert.ok(jQuery.sap.domById("__jsview1--customerButton1"), "Extension within Extension Point should be rendered");

		// extension withing fragment
		assert.ok(jQuery.sap.domById("theComponent---mainView--customFrag1Btn"), "Extension within Fragment without id should be rendered");
		assert.ok(jQuery.sap.domById("theComponent---mainView--frag1--customFrag1Btn"), "Extension within Fragment should be rendered");

		// check ID prefixing of views in extensions by checking their existence
		assert.ok(jQuery.sap.domById("theComponent---mainView--sub2View--customSubSubView1"), "XMLView Extension should be rendered");
		assert.ok(jQuery.sap.domById("theComponent---mainView--sub2View--customSubSubView1--customFrag1Btn"), "Button of XMLView Extension should be rendered");

		// extension within html Control
		assert.ok(jQuery.sap.domById("theComponent---mainView--sub2View--customFrag21Btn"), "Button of XMLView Extension inside html Control should be rendered");
	});


	// Controller Replacement

	QUnit.test("Controller Replacement", function(assert) {
		assert.equal(sap.ui.getCore().byId("theComponent---mainView").getController().getMetadata().getName(), "testdata.customizing.customer.Main", "The controller has been replaced");
	});

	// Controller Extension

	QUnit.test("Controller Extension", function(assert) {

		// check lifecycle methods
		assert.equal(aLifeCycleCalls.length, 6, "6 lifecycle methods should be called");
		// check calling order
		assert.equal(aLifeCycleCalls[0], "Sub2 Controller onInit()", "1st lifecycle method to be called should be: Sub2 Controller onInit()");
		assert.equal(aLifeCycleCalls[1], "Sub2ControllerExtension Controller onInit()", "2nd lifecycle method to be called should be: Sub2ControllerExtension Controller onInit()");
		assert.equal(aLifeCycleCalls[2], "Sub2ControllerExtension Controller onBeforeRendering()", "3rd lifecycle method to be called should be: Sub2ControllerExtension Controller onBeforeRendering()");
		assert.equal(aLifeCycleCalls[3], "Sub2 Controller onBeforeRendering()", "4th lifecycle method to be called should be: Sub2 Controller onBeforeRendering()");
		assert.equal(aLifeCycleCalls[4], "Sub2 Controller onAfterRendering()", "5th lifecycle method to be called should be: Sub2 Controller onAfterRendering()");
		assert.equal(aLifeCycleCalls[5], "Sub2ControllerExtension Controller onAfterRendering()", "6th lifecycle method to be called should be: Sub2ControllerExtension Controller onAfterRendering()");

		assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should not have been called yet");
		assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should not have been called yet");
		// trigger custom action
		qutils.triggerEvent("click", "theComponent---mainView--sub2View--customFrag1BtnWithCustAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should still not have been called");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should have been called now");
		// trigger standard action
		qutils.triggerEvent("click", "theComponent---mainView--sub2View--standardBtnWithStandardAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should not have been called again");

		// check members
		var oController = sap.ui.getCore().byId("theComponent---mainView--sub2View").getController();
		assert.ok(oController, "Extended Sub2 View should have a Controller");
		assert.ok(oController.originalSAPAction, "Extended Sub2 controller should have an originalSAPAction method");
		assert.ok(oController.customerAction, "Extended Sub2 controller should have a customerAction method");
		assert.equal(oController.originalSAPAction(), "ext", "originalSAPAction method of extended controller should return 'ext'");
	});

	QUnit.test("Controller Extension (sap.ui.controller)", function(assert) {
		oComp.runAsOwner(function() {
			var oController = sap.ui.controller("testdata.customizing.sap.Sub2");
			assert.ok(oController.isExtended, "Controller has been extended with sap.ui.controller factory function!");
		});
	});

	QUnit.test("Controller Extension (Code Extensibility)", function(assert) {

		// check lifecycle methods
		assert.equal(oLifecycleSpy.callCount, 9, "9 lifecycle methods should be called");
		// check calling order
		assert.equal(oLifecycleSpy.getCall(0).args[0], "Sub6 Controller onInit()", "1st lifecycle method to be called should be: Sub6 Controller onInit()");
		assert.equal(oLifecycleSpy.getCall(1).args[0], "Sub6ControllerExtension Controller onInit()", "2nd lifecycle method to be called should be: Sub6ControllerExtension Controller onInit()");
		assert.equal(oLifecycleSpy.getCall(2).args[0], "Sub6AnotherControllerExtension Controller onInit()", "3rd lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onInit()");

		assert.equal(oLifecycleSpy.getCall(3).args[0], "Sub6AnotherControllerExtension Controller onBeforeRendering()", "4th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering()");
		assert.equal(oLifecycleSpy.getCall(4).args[0], "Sub6ControllerExtension Controller onBeforeRendering()", "5th lifecycle method to be called should be: Sub6ControllerExtension Controller onBeforeRendering()");
		assert.equal(oLifecycleSpy.getCall(5).args[0], "Sub6 Controller onBeforeRendering()", "6th lifecycle method to be called should be: Sub6 Controller onBeforeRendering()");

		assert.equal(oLifecycleSpy.getCall(6).args[0], "Sub6 Controller onAfterRendering()", "7th lifecycle method to be called should be: Sub6 Controller onAfterRendering()");
		assert.equal(oLifecycleSpy.getCall(7).args[0], "Sub6ControllerExtension Controller onAfterRendering()", "8th lifecycle method to be called should be: Sub6ControllerExtension Controller onAfterRendering()");
		assert.equal(oLifecycleSpy.getCall(8).args[0], "Sub6AnotherControllerExtension Controller onAfterRendering()", "9th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onAfterRendering()");

	});


	// View/Property Modifications

	QUnit.test("Property Modifications", function(assert) {
		var oControl = sap.ui.getCore().byId("theComponent---mainView--sub3View--customizableText");
		assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
		assert.strictEqual(oControl.getEnabled(), true, "'enabled' property should not be customizable");

		oControl = sap.ui.getCore().byId("theComponent---mainView--sub2View--btnToHide");
		assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
	});


	// ExtensionPoint default content

	QUnit.test("ExtensionPoint default content", function(assert) {
		var oFirstItem = sap.ui.getCore().byId("__item0-theComponent---mainView--sub2View--lb-0");

		assert.ok(oFirstItem, "First ListItem should exist");
		assert.ok(oFirstItem.getDomRef(), "First ListItem should be rendered");
		assert.equal(oFirstItem.getText(), "(Customer's replacement ListItem)", "First ListItem should be the customized one");
		assert.ok(sap.ui.getCore().byId("__jsview0--defaultContentTextView"), "JS extension point 1 should contain default content");
		assert.ok(sap.ui.getCore().byId("iHaveCausedDestruction"), "JS Extension Point 45 Content has been correctly replaced");
	});

	QUnit.module("Controller Customizing via Hook", {

		beforeEach: function(assert) {

			//First, destroy component, reset call collector array...
			oComp.destroy();
			oCompCont.destroy();
			iStandardSub2ControllerCalled = 0;
			iCustomSub2ControllerCalled = 0;
			aLifeCycleCalls.length = 0; // clear call collection

			var bOriginalSAPActionCalled = false;
			var bCustomerActionCalled = false;
			var that = this;

			this.getControllerExtensions = function(sControllerName, sComponentId) {

				// we want to extend an original Controller...
				if ( !(sControllerName == "testdata.customizing.sap.Sub2") ){
					return [];
				} else {
					return [{
						onInit: function() {
							assert.equal(aLifeCycleCalls[0], "Sub2 Controller onInit()", "1st lifecycle method to be called should be: Sub2 Controller onInit()");
							assert.equal(aLifeCycleCalls[1], "Sub2ControllerExtension Controller onInit()", "2nd lifecycle method to be called should be: Sub2ControllerExtension Controller onInit()");
							aLifeCycleCalls.push("ControllerExtension onInit()");
							assert.equal(Component.getOwnerIdFor(this.byId("standardBtnWithStandardAction")), this.getOwnerComponent().getId(), "Propagation of owner component to view creation works!");
						},
						onBeforeRendering: function() {
							assert.equal(aLifeCycleCalls.length, 3, "ControllerExtension lifecycle method execution count is correct!");
							assert.equal(aLifeCycleCalls[2], "ControllerExtension onInit()", "3nd lifecycle method to be called should be: ControllerExtension onInit()");
							aLifeCycleCalls.push("ControllerExtension onBeforeRendering()");
						},
						onAfterRendering: function() {
							assert.equal(aLifeCycleCalls.length, 8, "ControllerExtension lifecycle method execution count is correct!");
							assert.equal(aLifeCycleCalls[3], "ControllerExtension onBeforeRendering()", "4th lifecycle method to be called should be: ControllerExtension onBeforeRendering()");
							assert.equal(aLifeCycleCalls[4], "Sub2ControllerExtension Controller onBeforeRendering()", "5th lifecycle method to be called should be: Sub2ControllerExtension Controller onBeforeRendering()");
							assert.equal(aLifeCycleCalls[5], "Sub2 Controller onBeforeRendering()", "6th lifecycle method to be called should be: Sub2 Controller onBeforeRendering()");
							assert.equal(aLifeCycleCalls[6], "Sub2 Controller onAfterRendering()", "7th lifecycle method to be called should be: Sub2 Controller onAfterRendering()");
							assert.equal(aLifeCycleCalls[7], "Sub2ControllerExtension Controller onAfterRendering()", "8th lifecycle method to be called should be: Sub2ControllerExtension Controller onAfterRendering()");
							aLifeCycleCalls.push("ControllerExtension onAfterRendering()");

							// trigger original action
							qutils.triggerEvent("click", "theComponent---mainView--sub2View--standardBtnWithStandardAction");
							assert.ok(bOriginalSAPActionCalled, "ControllerExtension custom event handler 'originalSAPAction' called!");
							assert.equal(iStandardSub2ControllerCalled, 0, "Original event handler 'originalSAPAction' is not called!");

							// trigger custom action
							qutils.triggerEvent("click", "theComponent---mainView--sub2View--customFrag1BtnWithCustAction");
							assert.ok(bCustomerActionCalled, "ControllerExtension custom event handler 'customerAction' called!");
							assert.equal(iCustomSub2ControllerCalled, 0, "Original event handler 'customerAction' is not called!");

							setTimeout(function() {
								oComp.destroy();
							}, 100);
						},
						onExit: function() {
							assert.equal(aLifeCycleCalls.length, 9, "ControllerExtension lifecycle method execution count is correct!");
							assert.equal(aLifeCycleCalls[8], "ControllerExtension onAfterRendering()", "9th lifecycle method to be called should be: ControllerExtension onAfterRendering()");
							aLifeCycleCalls.push("ControllerExtension onExit()");
							setTimeout(function() {
								assert.equal(aLifeCycleCalls.length, 12, "ControllerExtension lifecycle method execution count is correct!");
								assert.equal(aLifeCycleCalls[9], "ControllerExtension onExit()", "9th lifecycle method to be called should be: ControllerExtension onExit()");
								assert.equal(aLifeCycleCalls[10], "Sub2ControllerExtension Controller onExit()", "10th lifecycle method to be called should be: Sub2ControllerExtension Controller onExit()");
								assert.equal(aLifeCycleCalls[11], "Sub2 Controller onExit()", "11th lifecycle method to be called should be: Sub2 Controller onExit()");
								that.done();
							}, 100);
						},
						originalSAPAction: function() {
							bOriginalSAPActionCalled = true;
						},
						customerAction: function() {
							bCustomerActionCalled = true;
						}
					}];

				}

			};

		}


	});

	QUnit.test("Register ExtensionProvider (sync)", function(assert) {

		assert.expect(21);

		// test processing will be completed in onExit of the view extension
		this.done = assert.async();

		// Extension Provider module - used for sap.ui.mvc.Controller ExtensionProvider Tests
		var that = this;
		sap.ui.define("sap/my/sync/ExtensionProvider", ['jquery.sap.global'], function(jQuery) {
			var ExtensionProvider = function() {};
			ExtensionProvider.prototype.getControllerExtensions = that.getControllerExtensions;
			return ExtensionProvider;
		}, true);

		//...and reinitialize - with registered ExtensionProvider
		Controller.registerExtensionProvider("sap.my.sync.ExtensionProvider");

		oComp = sap.ui.component({
			name: "testdata.customizing.customer",
			id: "theComponent"
		});

		oCompCont = new ComponentContainer({
			component: oComp
		});
		oCompCont.placeAt("content");

	});

	QUnit.test("Register ExtensionProvider (async)", function(assert) {

		assert.expect(21);

		// test processing will be completed in onExit of the view extension
		this.done = assert.async();

		// make all views async
		var fnOrg = View.prototype._initCompositeSupport;

		View.prototype._initCompositeSupport = function(mSettings) {
			if (mSettings.viewName == "testdata.customizing.sap.Sub2") {
				mSettings.async = true;
			}
			return fnOrg.call(this, mSettings);
		};

		// Extension Provider module - used for sap.ui.mvc.Controller ExtensionProvider Tests
		var that = this;
		sap.ui.define("sap/my/async/ExtensionProvider", ['jquery.sap.global'], function(jQuery) {
			var ExtensionProvider = function() {};
			ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId) {
				if ( !(sControllerName == "testdata.customizing.sap.Sub2") ){
					return;
				} else {
					return new Promise(function(fnResolve, fnReject) {
						setTimeout(function() {
							fnResolve(that.getControllerExtensions(sControllerName, sComponentId));
						}, 500);
					});
				}
			};
			return ExtensionProvider;
		}, true);

		//...and reinitialize - with registered ExtensionProvider
		Controller.registerExtensionProvider("sap.my.async.ExtensionProvider");

		oComp = sap.ui.component({
			name: "testdata.customizing.customer",
			id: "theComponent"
		});

		oCompCont = new ComponentContainer({
			component: oComp
		});
		oCompCont.placeAt("content");

	});

});