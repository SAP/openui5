sap.ui.define([
	"sap/ui/base/Event",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(Event, Component, ComponentContainer, Controller, View, createAndAppendDiv) {

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

	this.oLifecycleSpy = sinon.spy();

	function triggerButtonPress(sButtonId) {
		var oButton = sap.ui.getCore().byId(sButtonId);
		var oEvent = new Event(sButtonId, oButton, {});
		oButton.firePress(oEvent);
	}

	// UI Construction
	var oComp, oCompCont;

	function destroyComponentAndContainer() {
		oComp.destroy();
		oCompCont.destroy();
	}

	// TESTS
	QUnit.module("Customizing", {
		before: function () {
			// load and start the customized application
			return Component.create({
				name: "testdata.customizing.sync.jsview.customer",
				id: "theComponent",
				manifest: false
			}).then(function(_oComp) {
				oComp = _oComp;
				oCompCont = new ComponentContainer({
					component: oComp
				});
				oCompCont.placeAt("content");
				return oComp.getRootControl().loaded();
			}).then(function() {
				sap.ui.getCore().applyChanges();
			});
		},
		after: destroyComponentAndContainer
	});


	// View Extension
	QUnit.test("View Extension", function(assert) {
		assert.ok(document.getElementById("buttonWithCustomerAction"), "JSView Extension should be rendered");

		// extension within extension
		assert.ok(document.getElementById("__jsview1--customerButton1"), "Extension within Extension Point should be rendered");
	});

	// ExtensionPoint default content

	QUnit.test("ExtensionPoint default content", function(assert) {
		assert.ok(sap.ui.getCore().byId("__jsview0--defaultContentText"), "JS extension point 1 should contain default content");
		assert.ok(sap.ui.getCore().byId("iHaveCausedDestruction"), "JS Extension Point 45 Content has been correctly replaced");
	});

	QUnit.module("Controller Customizing via Hook", {

		beforeEach: function(assert) {

			//First, destroy component, reset call collector array...
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
							triggerButtonPress("theComponent---mainView--sub2View--standardBtnWithStandardAction");
							assert.ok(bOriginalSAPActionCalled, "ControllerExtension custom event handler 'originalSAPAction' called!");
							assert.equal(iStandardSub2ControllerCalled, 0, "Original event handler 'originalSAPAction' is not called!");

							// trigger custom action
							triggerButtonPress("theComponent---mainView--sub2View--customFrag1BtnWithCustAction");
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

		},
		afterEach: destroyComponentAndContainer
	});

	QUnit.test("Register ExtensionProvider (sync)", function(assert) {

		assert.expect(21);

		// test processing will be completed in onExit of the view extension
		this.done = assert.async();

		// Extension Provider module - used for sap.ui.mvc.Controller ExtensionProvider Tests
		var that = this;
		sap.ui.predefine("sap/my/sync/ExtensionProvider", [], function() {
			var ExtensionProvider = function() {};
			ExtensionProvider.prototype.getControllerExtensions = that.getControllerExtensions;
			return ExtensionProvider;
		}, true);

		//...and reinitialize - with registered ExtensionProvider
		Controller.registerExtensionProvider("sap.my.sync.ExtensionProvider");

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
		}).then(function() {
			sap.ui.getCore().applyChanges();
		});
	});

});