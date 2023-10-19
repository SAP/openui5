sap.ui.define([
	"sap/ui/base/Event",
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	"sap/ui/core/Element",
	'sap/ui/core/mvc/XMLView',
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	'sap/ui/qunit/QUnitUtils'
], function(Event, Component, ComponentContainer, Element, XMLView, createAndAppendDiv, nextUIUpdate, qutils) {

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

	QUnit.module("", {
		before: function() {
			// define the custom component classes
			sap.ui.define("testdata/customizing/another/Component", [
				"sap/ui/core/UIComponent"
			], function(UIComponent) {
				return UIComponent.extend("testdata.customizing.another.Component", {});
			});

			sap.ui.define("testdata/customizing/anothersub/Component", [
				"testdata/customizing/another/Component"
			], function(AnotherComponent) {
				return AnotherComponent.extend("testdata.customizing.anothersub.Component", {
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
			});

			// load and start the customized application
			return Promise.all([
				Component.create({
					name: "testdata.customizing.anothersub",
					id: "anotherComponent",
					manifest: false
				}).then(function(_oComp) {
					this.oAnotherCompSub = _oComp;
				}.bind(this)),
				Component.create({
					name: "testdata.customizing.customersub",
					id: "customerComponent",
					manifest: false
				}).then(function(_oComp) {
					this.oCompSub = _oComp;
					this.oCompSubContainer = new ComponentContainer({
						component: this.oCompSub
					}).placeAt("content");
					return this.oCompSub.getRootControl().loaded();
				}.bind(this)).then(nextUIUpdate)
			]);
		},
		after: function() {
			this.oCompSubContainer.destroy();
			this.oCompSub.destroy();
			this.oAnotherCompSub.destroy();
		}
	});

	// View Replacement

	QUnit.test("View Replacement", function(assert) {
		assert.ok(document.getElementById("customerComponent---mainView--sub1View--customTextInCustomSub1"), "Replacement XMLView should be rendered");
		assert.ok(!document.getElementById("customerComponent---mainView--sub1View--originalSapTextInSub1"), "Original XMLView should not be rendered");
	});


	// View Extension
	QUnit.test("View Extension", function(assert) {
		assert.ok(document.getElementById("customerComponent---mainView--sub2View--customFrag1BtnWithCustAction"), "XMLView Extension should be rendered");
		assert.ok(document.getElementById("customerComponent---mainView--frag1--customFrag1Btn"), "Extension within Fragment should be rendered");
	});


	// Controller Replacement

	QUnit.test("Controller Replacement", function(assert) {
		assert.equal(Element.getElementById("customerComponent---mainView").getController().getMetadata().getName(), "testdata.customizing.customersub.Main", "The controller has been replaced");
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
		triggerButtonPress("customerComponent---mainView--sub2View--customFrag1BtnWithCustAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should still not have been called");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should have been called now");
		// trigger standard action
		triggerButtonPress("customerComponent---mainView--sub2View--standardBtnWithStandardAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should not have been called again");

		// check members
		var oController = Element.getElementById("customerComponent---mainView--sub2View").getController();
		assert.ok(oController, "Extended Sub2 View should have a Controller");
		assert.ok(oController.originalSAPAction, "Extended Sub2Sub controller should have an originalSAPAction method");
		assert.ok(oController.extension.testdata.customizing.customersub.Sub2SubControllerExtension.customerAction, "Extended Sub2Sub controller should have a customerAction method");
		assert.ok(oController.extension.testdata.customizing.customersub.Sub2SubControllerExtension.customerSubAction, "Extended Sub2Sub controller should have a customerSubAction method");
		assert.equal(oController.originalSAPAction(), "ext", "originalSAPAction method of extended controller should return 'ext'");
	});


	QUnit.test("Controller Extension (Code Extensibility)", function(assert) {

		// check lifecycle methods
		assert.equal(oLifecycleSpy.callCount, 15, "15 lifecycle methods should be called");
		// check calling order
		assert.equal(oLifecycleSpy.getCall(0).args[0], "Sub6 Controller onInit()", "1st lifecycle method to be called should be: Sub6 Controller onInit()");
		assert.equal(oLifecycleSpy.getCall(1).args[0], "Sub6InstanceSpecificControllerExtension Controller onInit()", "2nd lifecycle method to be called should be: Sub6InstanceSpecificControllerExtension Controller onInit()");

		assert.equal(oLifecycleSpy.getCall(2).args[0], "Sub6 Controller onInit()", "Strich: 3rd lifecycle method to be called should be: Sub6ControllerExtension Controller onInit()");
		assert.equal(oLifecycleSpy.getCall(3).args[0], "Sub6ControllerExtension Controller onInit()", "Strich: 4th lifecycle method to be called should be: Sub6ControllerExtension Controller onInit()");
		assert.equal(oLifecycleSpy.getCall(4).args[0], "Sub6AnotherControllerExtension Controller onInit()", "Strich: 5th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onInit()");

		// on before rendering
		assert.equal(oLifecycleSpy.getCall(5).args[0], "Sub6InstanceSpecificControllerExtension Controller onBeforeRendering()", "6th lifecycle method to be called should be: Sub6InstanceSpecificExtensionController onBeforeRendering()");
		assert.equal(oLifecycleSpy.getCall(6).args[0], "Sub6 Controller onBeforeRendering()", "7th lifecycle method to be called should be: Sub6 Controller onBeforeRendering()");

		assert.equal(oLifecycleSpy.getCall(7).args[0], "Sub6AnotherControllerExtension Controller onBeforeRendering()", "Strich: 8th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onBeforeRendering()");
		assert.equal(oLifecycleSpy.getCall(8).args[0], "Sub6ControllerExtension Controller onBeforeRendering()", "Strich: 9th lifecycle method to be called should be: Sub6ControllerExtension Controller onBeforeRendering()");
		assert.equal(oLifecycleSpy.getCall(9).args[0], "Sub6 Controller onBeforeRendering()", "Strich: 10th lifecycle method to be called should be: Sub6 Controller onBeforeRendering()");

		// on after rendering
		assert.equal(oLifecycleSpy.getCall(10).args[0], "Sub6 Controller onAfterRendering()", "11th lifecycle method to be called should be: Sub6 Controller onAfterRendering()");
		assert.equal(oLifecycleSpy.getCall(11).args[0], "Sub6InstanceSpecificControllerExtension Controller onAfterRendering()", "12th lifecycle method to be called should be: Sub6InstanceSpecificControllerExtension Controller onAfterRendering()");

		assert.equal(oLifecycleSpy.getCall(12).args[0], "Sub6 Controller onAfterRendering()", "Strich: 13th lifecycle method to be called should be: Sub6 Controller onAfterRendering()");
		assert.equal(oLifecycleSpy.getCall(13).args[0], "Sub6ControllerExtension Controller onAfterRendering()", "Strich: 14th lifecycle method to be called should be: Sub6ControllerExtension Controller onAfterRendering()");
		assert.equal(oLifecycleSpy.getCall(14).args[0], "Sub6AnotherControllerExtension Controller onAfterRendering()", "Strich: 15th lifecycle method to be called should be: Sub6AnotherControllerExtension Controller onAfterRendering()");

	});


	// View/Property Modifications

	QUnit.test("Property Modifications", function(assert) {
		var oControl = Element.getElementById("customerComponent---mainView--sub3View--customizableText");
		assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
		assert.strictEqual(oControl.getWrapping(), true, "'wrapping' property should not be customizable");
	});


	// ExtensionPoint default content

	QUnit.test("ExtensionPoint default content", function(assert) {
		var oFirstItem = Element.getElementById("__item0-customerComponent---mainView--sub2View--lb-0");

		assert.ok(oFirstItem, "First ListItem should exist");
		assert.equal(oFirstItem.getText(), "(Customer's replacement ListItem)", "First ListItem should be the customized one");
	});

	QUnit.module("Owner-Component Handling (Controller Extension) - asynchronous", {
		before: function() {
			sap.ui.define("testdata/customizing/asynchronous/sap/CompA/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
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

			sap.ui.define("testdata/customizing/asynchronous/sap/CompB/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
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


			sap.ui.define("testdata/customizing/asynchronous/sap/RootController.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
				return Controller.extend("testdata.customizing.asynchronous.sap.RootController", {
					getValue: function () {
						return "ControllerRoot";
					}
				});
			});

			sap.ui.define("testdata/customizing/asynchronous/sap/CompA/ext/Controller.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
				return {
					getValue: function () {
						return "ControllerA";
					}
				};
			});

			sap.ui.define("testdata/customizing/asynchronous/sap/CompB/ext/Controller.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {
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

});