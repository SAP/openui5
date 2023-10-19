sap.ui.define([
	"sap/ui/base/Event",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	'sap/ui/core/XMLTemplateProcessor',
	'sap/ui/core/mvc/XMLProcessingMode'
], function (Event, Component, ComponentContainer, Element, Controller, View, createAndAppendDiv, nextUIUpdate, XMLTemplateProcessor, XMLProcessingMode) {

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
	var bCustomerActionCalled = false;
	this.customSub2ControllerCalled = function() {
		iCustomSub2ControllerCalled++;
		bCustomerActionCalled = true;
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

	function createComponentAndContainer() {
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
			return oComp.getRootControl().loaded();
		}).then(nextUIUpdate);
	}

	function destroyComponentAndContainer() {
		oComp.destroy();
		oCompCont.destroy();
	}

	// TESTS
	QUnit.module("Customizing", {
		before: createComponentAndContainer,
		after: destroyComponentAndContainer
	});


	// View Replacement

	QUnit.test("View Replacement", function(assert) {
		assert.ok(document.getElementById("theComponent---mainView--sub1View--customTextInCustomSub1"), "Replacement XMLView should be rendered");
		assert.ok(!document.getElementById("theComponent---mainView--sub1View--originalSapTextInSub1"), "Original XMLView should not be rendered");
	});


	// View Extension
	QUnit.test("View Extension", function(assert) {
		assert.ok(document.getElementById("theComponent---mainView--sub2View--customFrag1BtnWithCustAction"), "XMLView Extension should be rendered");

		// extension withing fragment
		assert.ok(document.getElementById("theComponent---mainView--customFrag1Btn"), "Extension within Fragment without id should be rendered");
		assert.ok(document.getElementById("theComponent---mainView--frag1--customFrag1Btn"), "Extension within Fragment should be rendered");

		// check ID prefixing of views in extensions by checking their existence
		assert.ok(document.getElementById("theComponent---mainView--sub2View--customSubSubView1"), "XMLView Extension should be rendered");
		assert.ok(document.getElementById("theComponent---mainView--sub2View--customSubSubView1--customFrag1Btn"), "Button of XMLView Extension should be rendered");

		// extension within html Control
		assert.ok(document.getElementById("theComponent---mainView--sub2View--customFrag21Btn"), "Button of XMLView Extension inside html Control should be rendered");
	});


	// Controller Replacement

	QUnit.test("Controller Replacement", function(assert) {
		assert.equal(Element.getElementById("theComponent---mainView").getController().getMetadata().getName(), "testdata.customizing.customer.Main", "The controller has been replaced");
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
		triggerButtonPress("theComponent---mainView--sub2View--customFrag1BtnWithCustAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 0, "Standard Controller should still not have been called");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should have been called now");
		// trigger standard action
		triggerButtonPress("theComponent---mainView--sub2View--standardBtnWithStandardAction");
		assert.strictEqual(iStandardSub2ControllerCalled, 1, "Standard Controller should have been called now");
		assert.strictEqual(iCustomSub2ControllerCalled, 1, "Custom Controller should not have been called again");

		// check members
		var oController = Element.getElementById("theComponent---mainView--sub2View").getController();
		assert.ok(oController, "Extended Sub2 View should have a Controller");
		assert.ok(oController.originalSAPAction, "Extended Sub2 controller should have an originalSAPAction method");
		assert.ok(oController.extension.testdata.customizing.customer.Sub2ControllerExtension.customerAction, "Extended Sub2 controller should have a customerAction method");
		assert.equal(oController.originalSAPAction(), "ext", "originalSAPAction method of extended controller should return 'ext'");
	});

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("Legacy Controller Extension applied with sap.ui.controller()", function (assert) {
		oComp.runAsOwner(function () {
			var oController = sap.ui.controller("testdata.customizing.sap.Sub2_legacyAPIs");
			assert.ok(oController.isExtended, "Controller has been extended with sap.ui.controller factory function!");
		});
	});

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("Legacy Controller Extension applied with Controller.create()", function(assert) {
		return oComp.runAsOwner(function() {
			return Controller.create({
				name: "testdata.customizing.sap.Sub2_legacyAPIs"
			}).then(function(oController) {
				assert.ok(oController.isExtended, "Controller has been extended correctly!");
			});
		});
	});

	QUnit.test("Controller Extension applied with Controller.create()", function(assert) {
		return oComp.runAsOwner(function() {
			return Controller.create({
				name: "testdata.customizing.sap.Sub2"
			}).then(function(oController) {
				// Note: Properties can't be extended via ControllerExtension as they are not part of the interface
				assert.ok(oController._sapui_isExtended, "Controller has been extended correctly!");
			});
		});
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
		var oControl = Element.getElementById("theComponent---mainView--sub3View--customizableText");
		assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
		assert.strictEqual(oControl.getWrapping(), true, "'wrapping' property should not be customizable");

		oControl = Element.getElementById("theComponent---mainView--sub2View--btnToHide");
		assert.strictEqual(oControl.getVisible(), false, "'visible' property should be customizable");
	});


	// ExtensionPoint default content

	QUnit.test("ExtensionPoint default content", function(assert) {
		var oFirstItem = Element.getElementById("__item0-theComponent---mainView--sub2View--lb-0");

		assert.ok(oFirstItem, "First ListItem should exist");
		assert.equal(oFirstItem.getText(), "(Customer's replacement ListItem)", "First ListItem should be the customized one");
	});

	QUnit.module("Controller Customizing via Hook", {

		beforeEach: function(assert) {

			//First, destroy component, reset call collector array...
			iStandardSub2ControllerCalled = 0;
			iCustomSub2ControllerCalled = 0;
			aLifeCycleCalls.length = 0; // clear call collection

			var bOriginalSAPActionCalled = false;
			bCustomerActionCalled = false;
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
							triggerButtonPress("theComponent---mainView--sub2View--standardBtnWithStandardAction");
							assert.ok(bOriginalSAPActionCalled, "ControllerExtension custom event handler 'originalSAPAction' called!");
							assert.equal(iStandardSub2ControllerCalled, 0, "Original event handler 'originalSAPAction' is not called!");

							// trigger custom action
							triggerButtonPress("theComponent---mainView--sub2View--customFrag1BtnWithCustAction");
							assert.ok(bCustomerActionCalled, "ControllerExtension custom event handler 'customerAction' called!");

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

		},
		afterEach: destroyComponentAndContainer
	});

	QUnit.test("Register ExtensionProvider (async)", function(assert) {

		assert.expect(20);

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
		sap.ui.define("sap/my/async/ExtensionProvider", [], function() {
			var ExtensionProvider = function() {};
			ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId) {
				if ( !(sControllerName == "testdata.customizing.sap.Sub2") ){
					return [];
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

		return  createComponentAndContainer();

	});

	QUnit.module("No interface", {

		before: function () {
			this.oXMLTPSpy = sinon.spy(XMLTemplateProcessor, "parseTemplatePromise");
		},
		beforeEach: function () {
			this.oXMLTPSpy.resetHistory();
		},
		after: function () {
			this.oXMLTPSpy.restore();
		}
	});

	QUnit.test("SequentialLegacy - ExtensionPoint contains async View/Fragment", function (assert) {
		// var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/customizing/async/noInterface/customer/manifest.json");
		var oRootComponent, oManualCreatedView;

		return Component.create({
			id: "myCustomerComponent",
			name: "testdata.customizing.async.noInterface.customer",
			manifest: true
		})
			.then(function (oComponent) {
				oRootComponent = oComponent;
				assert.ok(oComponent, "Component created successfully.");

				return oRootComponent.getRootControl().loaded();

			}).then(function () {
				// manually create a view with legacy factory
				return oRootComponent.runAsOwner(function () {
					return sap.ui.xmlview({
						id: "manualView",
						async: true,
						viewName: "testdata.customizing.async.noInterface.sap.views.Main"
					}).loaded();
				});
			})
			.then(function (oManuallyCreatedView) {
				oManualCreatedView = oManuallyCreatedView;

				assert.equal(oManuallyCreatedView._sProcessingMode, XMLProcessingMode.SequentialLegacy, "Root view should be processed 'SequentialLegacy'");

				var aViewContent = oManuallyCreatedView.getContent();
				assert.equal(aViewContent.length, 6, "Correct amount of top-level controls.");

				assert.equal(aViewContent[0], oManuallyCreatedView.byId("outerView_button_before"), "Button before ExtensionPoint is at the correct position.");
				assert.equal(aViewContent[1], oManuallyCreatedView.byId("extPoint1View"), "View from ExtensionPoint is at the correct position.");
				assert.equal(aViewContent[2], oManuallyCreatedView.byId("manualView--extPoint2Fragment--buttonExtPoint2_1"), "Button from ExtensionPoint2 is at the correct position.");
				assert.equal(aViewContent[3], oManuallyCreatedView.byId("manualView--extPoint2Fragment--buttonExtPoint2_2"), "Button from ExtensionPoint2 is at the correct position.");
				assert.equal(aViewContent[4], oManuallyCreatedView.byId("manualView--extPoint2Fragment--extPoint3View"), "View from ExtensionPoint3 is at the correct position.");
				assert.equal(aViewContent[5], oManuallyCreatedView.byId("outerView_button_after"), "Button after ExtensionPoint is at the correct position.");

				var oExtPoint1View = oManuallyCreatedView.byId("extPoint1View");

				return oExtPoint1View.loaded();
			})
			.then(function (oExtensionView) {
				assert.equal(oExtensionView._sProcessingMode, XMLProcessingMode.SequentialLegacy, "ExtPoint1View should be processed 'SequentialLegacy'");

				var aExtPoint1Content = oExtensionView.getContent();
				assert.equal(aExtPoint1Content.length, 2, "Correct amount controls inside ExtensionPoint View.");
				assert.equal(aExtPoint1Content[0], oExtensionView.byId("buttonExtPoint1_1"), "Button1 inside ExtensionPoint View is at the correct position.");
				assert.equal(aExtPoint1Content[1], oExtensionView.byId("buttonExtPoint1_2"), "Button2 inside ExtensionPoint View is at the correct position.");

				return oManualCreatedView.byId("manualView--extPoint2Fragment--extPoint3View").loaded();
			}).then(function (oExtPoint3View) {
				assert.equal(oExtPoint3View._sProcessingMode, XMLProcessingMode.SequentialLegacy, "ExtPoint3View should be processed 'Sequential'");

				var aExtPoint3Content = oExtPoint3View.getContent();
				assert.equal(aExtPoint3Content[0],
					oExtPoint3View.byId("extPoint4Fragment--buttonExtPoint4_1"),
					"Button1 inside ExtensionPoint View is at the correct position.");
				assert.equal(aExtPoint3Content[1],
					oExtPoint3View.byId("extPoint4Fragment--buttonExtPoint4_2"),
					"Button2 inside ExtensionPoint View is at the correct position.");


				// cleanup
				oManualCreatedView.destroy();
				oRootComponent.destroy();
			});
	});

});