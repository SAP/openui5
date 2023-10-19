/*global QUnit */
sap.ui.define([
	"sap/base/util/ObjectPath",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/JSONView",
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/HTMLView",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(ObjectPath, Device, Controller, JSONView, JSView, XMLView, HTMLView, qutils, nextUIUpdate) {
	"use strict";

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	/*
	 * an initial check to be executed before other MVC tests start
	 */
	QUnit.test("InitialCheck", function (assert) {
		assert.expect(6);
		assert.ok(Controller, "sap.ui.core.mvc.Controller must be defined");
		assert.ok(JSONView, "sap.ui.core.mvc.JSONView must be defined");
		assert.ok(JSView, "sap.ui.core.mvc.JSView must be defined");
		assert.ok(XMLView, "sap.ui.core.mvc.XMLView must be defined");
		assert.ok(HTMLView, "sap.ui.core.mvc.HTMLView must be defined");
		assert.ok(sap.ui.controller, "sap.ui.controller must be defined");
	});

	function testsuite(oConfig, sCaption, fnViewFactory, bCheckViewData) {

		var view;

		QUnit.module(sCaption);

		QUnit.test("View Instantiation: default controller instantiation", function(assert) {
			assert.expect(7);
			// define View and place it onto the page
			window.onInitCalled = false;
			view = fnViewFactory();
			assert.ok(view, "view must exist after creation");
			var fnClass = ObjectPath.get(oConfig.viewClassName);
			assert.ok(view instanceof fnClass, "view must be instance of " + oConfig.viewClassName);
		});

		QUnit.test("View Instantiation: default controller instantiation - async", function(assert) {
			assert.expect(7);
			// define View and place it onto the page
			window.onInitCalled = false;
			view = fnViewFactory({async: true});
			assert.ok(view, "view must exist after creation");
			var fnClass = ObjectPath.get(oConfig.viewClassName);
			assert.ok(view instanceof fnClass, "view must be instance of " + oConfig.viewClassName);
		});

		QUnit.test("Controller Instantiation", function(assert) {
			assert.expect(2);
			var controller = view.getController();
			assert.ok(controller, "controller must exist after creation");
			assert.ok(controller instanceof Controller, "controller must be instanceof sap.ui.core.mvc.Controller");
		});

		QUnit.test("Lifecycle: onInit", function(assert) {
			assert.expect(1);
			assert.ok(window.onInitCalled, "controller.onInit should be called by now");
			window.onInitCalled = false;
		});

		QUnit.test("Lifecycle: onAfterRendering", async function(assert) {
			assert.expect(6);
			window.onAfterRenderingCalled = false;
			view.placeAt("content");
			await nextUIUpdate();

			function doCheck() {
				assert.ok(window.onAfterRenderingCalled, "controller.onAfterRendering should be called by now");
				window.onAfterRenderingCalled = false;
			}

			if (Device.browser.safari) {
				var done = assert.async();
				setTimeout(function() {
					doCheck();
					done();
				}, 1000);
			} else {
				doCheck();
			}
		});

		QUnit.test("SAPUI5 Rendering", function(assert) {
			assert.expect(oConfig.idsToBeChecked.length);
			for (var i = 0; i < oConfig.idsToBeChecked.length; i++) {
				var oDomRef = document.getElementById(view.createId(oConfig.idsToBeChecked[i]));
				assert.ok(oDomRef,  "Element " + oConfig.idsToBeChecked[i] + " rendered");
			}
		});

		QUnit.test("Aggregation", function(assert) {
			assert.expect(1);
			assert.expect(1);
			var oDomRef = document.getElementById(view.createId("Button2"));
			assert.ok(oDomRef,  "SAPUI5 Button rendered in aggregation");
		});

		QUnit.test("Child Views exists", function(assert) {
			assert.expect(3);
			var oJSONView = document.getElementById(view.createId("MyJSONView"));
			assert.ok(oJSONView, "Child View (JSONView) should be rendered");
			var oJSView = document.getElementById(view.createId("MyJSView"));
			assert.ok(oJSView, "Child View (JSView) should be rendered");
			var oXMLView = document.getElementById(view.createId("MyXMLView"));
			assert.ok(oXMLView, "Child View (XMLView) should be rendered");
		});

		QUnit.test("Child Views content rendered", function(assert) {
			assert.expect(9);
			var oJSONView = view.byId("MyJSONView");
			var oButton = document.getElementById(oJSONView.createId("Button1"));
			assert.ok(oButton, "Content of Child View (JSONView) should be rendered");
			var oLabel1 = oJSONView.byId("Label1");
			assert.ok(oLabel1, "exists");
			assert.equal(oLabel1.getLabelFor(), oJSONView.createId("Button1"), "assocation has been fixed");

			var oJSView = view.byId("MyJSView");
			oButton = document.getElementById(oJSView.createId("Button1"));
			assert.ok(oButton, "Content of Child View (JSView) should be rendered");
			var oLabel = oJSView.byId("Label1");
			assert.ok(!!oLabel, "Label exists");
			assert.equal(oLabel.getLabelFor(), oJSView.createId("Button1"), "Association has been adapted");

			var oXMLView = view.byId("MyXMLView");
			var oButton2 = document.getElementById(oXMLView.createId("Button1"));
			assert.ok(oButton2, "Content of Child View (XMLView) should be rendered");
			oLabel = oXMLView.byId("Label1");
			assert.ok(!!oLabel, "Label exists");
			assert.equal(oLabel.getLabelFor(), oXMLView.createId("Button1"), "Association has been adapted");
		});

		QUnit.test("Eventhandling", function(assert) {
			assert.expect(4);
			var done = assert.async();
			var oButton1 = view.byId("Button1");
			qutils.triggerMouseEvent(oButton1.getDomRef(), "mousedown", 1, 1, 1, 1);
			qutils.triggerMouseEvent(oButton1.getDomRef(), "mouseup", 1, 1, 1, 1);
			qutils.triggerMouseEvent(oButton1.getDomRef(), "click", 1, 1, 1, 1);
			var oButtonX = view.byId("ButtonX");
			qutils.triggerMouseEvent(oButtonX.getDomRef(), "mousedown", 1, 1, 1, 1);
			qutils.triggerMouseEvent(oButtonX.getDomRef(), "mouseup", 1, 1, 1, 1);
			qutils.triggerMouseEvent(oButtonX.getDomRef(), "click", 1, 1, 1, 1);
			setTimeout(function() {
				done();
			}, 500);

		});

		QUnit.test("Re-Rendering", async function(assert) {
			assert.expect(5 + oConfig.idsToBeChecked.length);
			window.onBeforeRenderingCalled = false;
			window.onAfterRenderingCalled = false;
			view.invalidate();
			await nextUIUpdate();

			function doCheck() {
				for (var i = 0; i < oConfig.idsToBeChecked.length; i++) {
					var oDomRef = document.getElementById(view.createId(oConfig.idsToBeChecked[i]));
					assert.ok(oDomRef, "Element " + oConfig.idsToBeChecked[i] + " rendered again");
				}
			}

			if (Device.browser.safari) {
				var done = assert.async();
				setTimeout(function() {
					doCheck();
					done();
				}, 1000);
			} else {
				doCheck();
			}
		});

		QUnit.test("Lifecycle: onBeforeRendering", function(assert) {
			assert.expect(1);
			assert.ok(window.onBeforeRenderingCalled, "controller.onBeforeRendering should be called by now");
			window.onBeforeRenderingCalled = false;
		});

		QUnit.test("Lifecycle: onAfterRendering (re-rendering)", function(assert) {
			assert.expect(1);
			assert.ok(window.onAfterRenderingCalled, "controller.onAfterRendering should be called again by now");
			window.onAfterRenderingCalled = false;
		});

		// execute additional tests, when specified
		if ( bCheckViewData ) {
			QUnit.test("View Data available in controller hooks", function(assert) {
				assert.expect(4);
				assert.equal(window.dataOnInit, "testdata", "View Data should be available in onInit of controller");
				window.dataOnInit = null;
				assert.equal(window.dataAfterRendering, "testdata", "View Data should be available in onAfterRendering of controller");
				window.dataAfterRendering = null;
				assert.equal(window.dataBeforeRendering, "testdata", "View Data should be available in onBeforeRendering of controller");
				window.dataBeforeRendering = null;
				assert.equal(window.dataEventHandler, "testdata", "View Data should be available in event handlers of controller");
				window.dataEventHandler = null;
			});
		}

		QUnit.test("Lifecycle: onExit", function(assert) {
			assert.expect(1);
			window.onExitCalled = false;
			view.destroy();
			assert.ok(window.onExitCalled, "onExit should have been called");
			window.onExitCalled = false;
		});

		QUnit.test("Lifecycle: NO onBeforeRendering when exiting", function(assert) {
			assert.expect(1);
			assert.ok(!window.onBeforeRenderingCalled, "controller.onBeforeRendering should not be called when exiting");
			window.onBeforeRenderingCalled = false;
		});

		QUnit.test("Lifecycle: NO onAfterRendering when exiting", function(assert) {
			assert.expect(1);
			assert.ok(!window.onAfterRenderingCalled, "controller.onAfterRendering should not be called again");
			window.onAfterRenderingCalled = false;
		});

		QUnit.test("Lifecycle: NO content after destroy()", function(assert) {
			assert.expect(oConfig.idsToBeChecked.length);
			for (var i = 0; i < oConfig.idsToBeChecked.length; i++) {
				var oDomRef = document.getElementById(view.createId(oConfig.idsToBeChecked[i]));
				assert.notOk(oDomRef, "Content " + oConfig.idsToBeChecked[i] + " should no longer be there");
			}
		});

		QUnit.test("Cloning: Event listeners are called on the correct controller instance", function(assert) {
			assert.expect(12);
			var oTmpl, oClone;
			oTmpl = fnViewFactory();
			if (!oTmpl.sViewName) {
				// Cloning views created from string or object (via viewContent) currently fails for HTML and JSON views
				//	We will address this in a separate change, until then we skip testing those cases
				assert.expect(6);
				assert.ok(true, "Skipping clone of views created from string of object");
				return;
			}
			oClone = oTmpl.clone();

			oTmpl.fireBeforeRendering();
			assert.ok(window.onBeforeRenderingCalled === oTmpl.getController(), "Event is called on correct controller instance");

			oClone.fireBeforeRendering();
			assert.ok(window.onBeforeRenderingCalled === oClone.getController(), "Event is called on correct controller instance");

			// Cleanup
			oTmpl.destroy();
			oClone.destroy();
		});

	}

	return testsuite;
});
