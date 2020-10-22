sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/UIComponent',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/qunit/QUnitUtils'
], function(jQuery, Component, ComponentContainer, UIComponent, Controller, View, XMLView, qutils) {

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

	jQuery.sap.declare("testdata.customizing.another.Component");
	var AnotherComponent = UIComponent.extend("testdata.customizing.another.Component", {});
	jQuery.sap.declare("testdata.customizing.anothersub.Component");
	/*var AnotherSubComponent = */AnotherComponent.extend("testdata.customizing.anothersub.Component", {
		metadata : {
			version : "1.0",
			customizing: {
				"sap.ui.controllerExtensions": {
					"testdata.customizing.sap.Sub2": {
						"controllerName": "testdata.customizing.sap.Sub2"
					}
				}
			}
		}
	});

	var oAnotherCompSub, oCompSub, oCompCont;

	QUnit.module("", {
		before: function() {
			// load and start the customized application
			return Promise.all([
				Component.create({
					name: "testdata.customizing.anothersub",
					id: "anotherComponent",
					manifest: false
				}).then(function(_oComp) {
					oAnotherCompSub = _oComp;
				}),
				Component.create({
					name: "testdata.customizing.customersub",
					id: "customerComponent",
					manifest: false
				}).then(function(_oComp) {
					oCompSub = _oComp;
					oCompCont = new ComponentContainer({
						component: oCompSub
					});
					oCompCont.placeAt("content");
					return oCompSub.getRootControl().loaded();
				}).then(function() {
					sap.ui.getCore().applyChanges();
				})
			]);
		},
		after: function() {
			oCompCont.destroy();
			oCompSub.destroy();
			oAnotherCompSub.destroy();
		}
	});



	// TESTS

	QUnit.test("CustomizingConfiguration available", function(assert) {
		assert.expect(1);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.ok(CustomizingConfiguration, "CustomizingConfiguration should be available now without requiring it");
	});

	QUnit.test("CustomizingConfiguration returning the customizing data", function(assert) {
		assert.expect(8);

		var CustomizingConfiguration = sap.ui.require("sap/ui/core/CustomizingConfiguration");
		assert.equal(CustomizingConfiguration.getViewReplacement("testdata.customizing.sap.Sub1", oCompSub.getId()).viewName,
				"testdata.customizing.customer.CustomSub1",
				"CustomizingConfiguration should return the View replacement data");
		assert.equal(CustomizingConfiguration.getViewExtension("testdata.customizing.sap.Sub2", "extension2", oCompSub.getId()).fragmentName,
				"testdata.customizing.customer.CustomFrag1WithCustomerAction",
				"CustomizingConfiguration should return the View extension data");
		assert.equal(CustomizingConfiguration.getControllerExtension("testdata.customizing.sap.Sub2").controllerName,
				"testdata.customizing.sap.Sub2",
				"CustomizingConfiguration should return the Controller extension data (using the lookup magic)");
		assert.equal(CustomizingConfiguration.getControllerExtension("testdata.customizing.sap.Sub2", oCompSub.getId()),
				"testdata.customizing.customersub.Sub2SubControllerExtension",
				"CustomizingConfiguration should return the Controller extension data");
		assert.equal(CustomizingConfiguration.getControllerExtension("testdata.customizing.sap.Sub2", oAnotherCompSub.getId()).controllerName,
				"testdata.customizing.sap.Sub2",
				"CustomizingConfiguration should return the Controller extension data (using the lookup magic)");
		assert.strictEqual(CustomizingConfiguration.getCustomProperties("testdata.customizing.sap.Sub3", "customizableText", oCompSub.getId()).visible,
				false,
				"CustomizingConfiguration should return the View modification data");
		assert.strictEqual(CustomizingConfiguration.getCustomProperties("testdata.customizing.sap.Sub4", "customizableText1", oCompSub.getId()).visible,
				false,
				"CustomizingConfiguration should return the View modification data");
		assert.strictEqual(CustomizingConfiguration.getCustomProperties("testdata.customizing.sap.Sub5", "Button2", oCompSub.getId()).visible,
				false,
				"CustomizingConfiguration should return the View modification data");
	});


	// View Replacement

	QUnit.test("View Replacement", function(assert) {
		assert.ok(jQuery.sap.domById("customerComponent---mainView--sub1View--customTextInCustomSub1"), "Replacement XMLView should be rendered");
		assert.ok(!jQuery.sap.domById("customerComponent---mainView--sub1View--originalSapTextInSub1"), "Original XMLView should not be rendered");
	});


	// View Extension
	QUnit.test("View Extension", function(assert) {
		assert.ok(jQuery.sap.domById("customerComponent---mainView--sub2View--customFrag1BtnWithCustAction"), "XMLView Extension should be rendered");
		assert.ok(jQuery.sap.domById("buttonWithCustomerAction"), "JSView Extension should be rendered");
		// extension within extension
		assert.ok(jQuery.sap.domById("__jsview1--customerButton1"), "Extension within Extension Point should be rendered");
		assert.ok(jQuery.sap.domById("customerComponent---mainView--frag1--customFrag1Btn"), "Extension within Fragment should be rendered");
	});


	// Controller Replacement

	QUnit.test("Controller Replacement", function(assert) {
		assert.equal(sap.ui.getCore().byId("customerComponent---mainView").getController().getMetadata().getName(), "testdata.customizing.customersub.Main", "The controller has been replaced");
	});

	// Controller Extension

	QUnit.test("Controller Extension", function(assert) {

		// check lifecycle methods
		assert.equal(aLifeCycleCalls.length, 6, "6 lifecycle methods should be called");
		// check calling order
		assert.equal(aLifeCycleCalls[0], "Sub2 Controller onInit()", "1st lifecycle method to be called should be: Sub2 Controller onInit()");
		assert.equal(aLifeCycleCalls[1], "Sub2SubControllerExtension Controller onInit()", "2st lifecycle method to be called should be: Sub2SubControllerExtension Controller onInit()");
		assert.equal(aLifeCycleCalls[2], "Sub2SubControllerExtension Controller onBeforeRendering()", "3st lifecycle method to be called should be: Sub2SubControllerExtension Controller onBeforeRendering()");
		assert.equal(aLifeCycleCalls[3], "Sub2 Controller onBeforeRendering()", "4th lifecycle method to be called should be: Sub2 Controller onBeforeRendering()");
		assert.equal(aLifeCycleCalls[4], "Sub2 Controller onAfterRendering()", "5th lifecycle method to be called should be: Sub2 Controller onAfterRendering()");
		assert.equal(aLifeCycleCalls[5], "Sub2SubControllerExtension Controller onAfterRendering()", "6th lifecycle method to be called should be: Sub2SubControllerExtension Controller onAfterRendering()");

		assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should not have been called yet");
		assert.strictEqual(iCustomSub2ControllerCalled, 0, "Custom Controller should not have been called yet");
		// trigger custom action
		qutils.triggerEvent("click", "customerComponent---mainView--sub2View--customFrag1BtnWithCustAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should still not have been called");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should have been called now");
		// trigger standard action
		qutils.triggerEvent("click", "customerComponent---mainView--sub2View--standardBtnWithStandardAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should not have been called again");

		// check members
		var oController = sap.ui.getCore().byId("customerComponent---mainView--sub2View").getController();
		assert.ok(oController, "Extended Sub2 View should have a Controller");
		assert.ok(oController.originalSAPAction, "Extended Sub2Sub controller should have an originalSAPAction method");
		assert.ok(oController.customerAction, "Extended Sub2Sub controller should have a customerAction method");
		assert.ok(oController.customerSubAction, "Extended Sub2Sub controller should have a customerSubAction method");
		assert.equal(oController.originalSAPAction(), "ext", "originalSAPAction method of extended controller should return 'ext'");
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
		var oControl = sap.ui.getCore().byId("customerComponent---mainView--sub3View--customizableText");
		assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
		assert.strictEqual(oControl.getEnabled(), true, "'enabled' property should not be customizable");
	});


	// ExtensionPoint default content

	QUnit.test("ExtensionPoint default content", function(assert) {
		var oFirstItem = sap.ui.getCore().byId("__item0-customerComponent---mainView--sub2View--lb-0");

		assert.ok(oFirstItem, "First ListItem should exist");
		assert.ok(oFirstItem.getDomRef(), "First ListItem should be rendered");
		assert.equal(oFirstItem.getText(), "(Customer's replacement ListItem)", "First ListItem should be the customized one");
		assert.ok(sap.ui.getCore().byId("__jsview0--defaultContentTextView"), "JS extension point 1 should contain default content");
		assert.ok(sap.ui.getCore().byId("iHaveCausedDestruction"), "JS Extension Point 45 Content has been correctly replaced");
	});

	QUnit.module("Owner-Component Handling (Controller Extension) - synchronous", {
		before: function() {
			sap.ui.predefine("testdata/customizing/synchronous/sap/CompA/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("testdata.customizing.synchronous.sap.CompA.Component", {
					metadata: {
						version : "1.0",
						customizing: {
							"sap.ui.controllerExtensions": {
								"testdata.customizing.synchronous.sap.RootController": {
									controllerName: "testdata.customizing.synchronous.sap.CompA.ext.Controller"
								}
							}
						}
					}
				});
			});

			sap.ui.predefine("testdata/customizing/synchronous/sap/CompB/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("testdata.customizing.synchronous.sap.CompB.Component", {
					metadata: {
						version : "1.0",
						customizing: {
							"sap.ui.controllerExtensions": {
								"testdata.customizing.synchronous.sap.RootController": {
									controllerName: "testdata.customizing.synchronous.sap.CompB.ext.Controller"
								}
							}
						}
					}
				});
			});

			sap.ui.controller("testdata.customizing.synchronous.sap.RootController", {
				getValue: function () {
					return "ControllerRoot";
				}
			});

			sap.ui.controller("testdata.customizing.synchronous.sap.CompA.ext.Controller", {
				getValue: function () {
					return "ControllerA";
				}
			});

			sap.ui.controller("testdata.customizing.synchronous.sap.CompB.ext.Controller", {
				getValue: function () {
					return "ControllerB";
				}
			});
		}
	});

	QUnit.test("Controller Extension of owner component is used", function(assert){
		var oCompA = sap.ui.component({
			id: "componentA",
			name: "testdata.customizing.synchronous.sap.CompA",
			manifest: false,
			async: false
		});

		var oCompB = sap.ui.component({
			id: "componentB",
			name: "testdata.customizing.synchronous.sap.CompB",
			manifest: false,
			async: false
		});

		oCompB.runAsOwner(function() {
			sap.ui.xmlview({
				id: oCompB.createId("rootView"),
				viewContent: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" controllerName="testdata.customizing.synchronous.sap.RootController">'
				+ ' <core:Icon src="sap-icon://doctor"></core:Icon>'
				+ ' </mvc:View>'
			});
		});

		assert.strictEqual(oCompB.byId("rootView").getController().getValue(), "ControllerB", "The correct controller extension is used.");

		oCompB.byId("rootView").destroy();
		oCompA.destroy();
		oCompB.destroy();
	});

	QUnit.test("Controller Extension of component name is used", function(assert){
		var oCompA = sap.ui.component({
			id: "componentA",
			name: "testdata.customizing.synchronous.sap.CompA",
			manifest: false,
			async: false
		});

		var oRootView = sap.ui.xmlview({
			id: "rootView",
			viewContent: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" controllerName="testdata.customizing.synchronous.sap.RootController">'
			+ ' <core:Icon src="sap-icon://doctor"></core:Icon>'
			+ ' </mvc:View>'
		});

		assert.strictEqual(oRootView.getController().getValue(), "ControllerA", "The correct controller extension is used.");

		oRootView.destroy();
		oCompA.destroy();
	});

	QUnit.module("Owner-Component Handling (Controller Extension) - asynchronous", {
		before: function() {
			sap.ui.predefine("testdata/customizing/asynchronous/sap/CompA/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("testdata.customizing.asynchronous.sap.CompA.Component", {
					metadata: {
						version : "1.0",
						customizing: {
							"sap.ui.controllerExtensions": {
								"testdata.customizing.asynchronous.sap.RootController": {
									controllerName: "testdata.customizing.asynchronous.sap.CompA.ext.Controller"
								}
							}
						}
					}
				});
			});

			sap.ui.predefine("testdata/customizing/asynchronous/sap/CompB/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("testdata.customizing.asynchronous.sap.CompB.Component", {
					metadata: {
						version : "1.0",
						customizing: {
							"sap.ui.controllerExtensions": {
								"testdata.customizing.asynchronous.sap.RootController": {
									controllerName: "testdata.customizing.asynchronous.sap.CompB.ext.Controller"
								}
							}
						}
					}
				});
			});


			sap.ui.predefine("testdata/customizing/asynchronous/sap/RootController.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
				return Controller.extend("testdata.customizing.asynchronous.sap.RootController", {
					getValue: function () {
						return "ControllerRoot";
					}
				});
			});

			sap.ui.predefine("testdata/customizing/asynchronous/sap/CompA/ext/Controller.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
				return {
					getValue: function () {
						return "ControllerA";
					}
				};
			});

			sap.ui.predefine("testdata/customizing/asynchronous/sap/CompB/ext/Controller.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
				return {
					getValue: function () {
						return "ControllerB";
					}
				};
			});

		}
	});

	QUnit.test("Controller Extension of owner component is used", function(assert){
		var pCompA = Component.create({
			id: "componentA",
			name: "testdata.customizing.asynchronous.sap.CompA",
			manifest: false
		});

		var pCompB = Component.create({
			id: "componentB",
			name: "testdata.customizing.asynchronous.sap.CompB",
			manifest: false
		});

		return Promise.all([pCompA, pCompB]).then(function(aPromises){
			var oCompA = aPromises[0],
				oCompB = aPromises[1];

			return new Promise(function(fnResolve, fnReject){
				oCompB.runAsOwner(function() {
					XMLView.create({
						id: oCompB.createId("rootView"),
						definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" controllerName="testdata.customizing.asynchronous.sap.RootController">'
							+ ' <core:Icon src="sap-icon://doctor"></core:Icon>'
							+ ' </mvc:View>'
					}).then(function(oView) {
						assert.strictEqual(oView.getController().getValue(), "ControllerB", "The correct controller extension is used.");

						oView.destroy();
						oCompA.destroy();
						oCompB.destroy();
						fnResolve();

					}).catch(function(error){
						fnReject(error);
					});
				});
			});
		});
	});

	QUnit.test("Controller Extension of component name is used", function(assert){
		var pCompA = Component.create({
			id: "componentA",
			name: "testdata.customizing.asynchronous.sap.CompA",
			manifest: false
		});

		return pCompA.then(function(oCompA) {
			return XMLView.create({
				id: "rootView",
				definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" controllerName="testdata.customizing.asynchronous.sap.RootController">'
					+ ' <core:Icon src="sap-icon://doctor"></core:Icon>'
					+ ' </mvc:View>'
			}).then(function(oView) {
				assert.strictEqual(oView.getController().getValue(), "ControllerA", "The correct controller extension is used.");

				oView.destroy();
				oCompA.destroy();
			});
		});

	});

});