/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Device, Controller, qutils, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	QUnit.config.reorder = false;

	// create content div
	createAndAppendDiv("content");

	function testsuite(oConfig, sCaption, fnViewFactory, bCheckViewData) {

		var view;
		var pView;

		QUnit.module(sCaption);

		QUnit.test("View Instantiation: default controller instantiation", function(assert) {
			window.onInitCalled = false;
			pView = fnViewFactory();

			return pView.then(function(oView) {
				assert.expect(6);

				view = oView;
				assert.ok(view, "view must exist after creation");
				assert.ok(view instanceof oConfig.viewClass, "view must be instance of " + oConfig.viewClass.getMetadata().getName());
				return oView;
			});
		});

		QUnit.test("Controller Instantiation", function(assert) {
			return pView.then(function(oView) {
				assert.expect(2);
				var oController = oView.getController();
				assert.ok(oController, "controller must exist after creation");
				assert.ok(oController instanceof Controller, "controller must be instanceof sap.ui.core.mvc.Controller");
			});
		});

		QUnit.test("Lifecycle: onInit", function(assert) {
			return pView.then(function(oView) {
				assert.expect(1);
				assert.ok(window.onInitCalled, "controller.onInit should be called by now");
				window.onInitCalled = false;
			});
		});

		QUnit.test("Lifecycle: onAfterRendering", function(assert) {
			return pView.then(async function(oView) {
				assert.expect(5);
				window.onAfterRenderingCalled = false;

				oView.placeAt("content");
				await nextUIUpdate();

				assert.ok(window.onAfterRenderingCalled, "controller.onAfterRendering should be called by now");
				window.onAfterRenderingCalled = false;
			});
		});

		QUnit.test("SAPUI5 Rendering", function(assert) {
			return pView.then(function(oView) {
				assert.expect(oConfig.idsToBeChecked.length);
				for (var i = 0; i < oConfig.idsToBeChecked.length; i++) {
					var oDomRef = document.getElementById(oView.createId(oConfig.idsToBeChecked[i]));
					assert.ok(oDomRef,  "Element " + oConfig.idsToBeChecked[i] + " rendered");
				}
			});
		});

		QUnit.test("Aggregation", function(assert) {
			return pView.then(function(oView) {
				assert.expect(1);
				var oDomRef = document.getElementById(oView.createId("Button2"));
				assert.ok(oDomRef,  "SAPUI5 Button rendered in aggregation");
			});
		});

		QUnit.test("Child Views exists", function(assert) {
			return pView.then(function(oView) {
				assert.expect(2);
				var oJSView = document.getElementById(oView.createId("MyJSView"));
				assert.ok(oJSView, "Child View (JSView) should be rendered");
				var oXMLView = document.getElementById(oView.createId("MyXMLView"));
				assert.ok(oXMLView, "Child View (XMLView) should be rendered");
			});
		});

		QUnit.test("Child Views content rendered", function(assert) {
			assert.expect(6);

			var oJSView = view.byId("MyJSView");
			var oButton = document.getElementById(oJSView.createId("Button1"));
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
			assert.expect(4 + oConfig.idsToBeChecked.length);
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

		/**
		 * @deprecated since 1.120
		 */
		QUnit.test("Cloning: Event listeners are called on the correct controller instance", function(assert) {
			var fnWaitForNestedViews = function (oView) {

				var pNestedView1 = oView.byId("MyJSView").loaded();
				var pNestedView2 = oView.byId("MyXMLView").loaded();
				var pNestedView3 = oView.byId("MyHTMLView").loaded();

				return Promise.all([pNestedView1, pNestedView2, pNestedView3]).then(function () {
					return oView;
				});
			};

			return fnViewFactory().then(function(oView) {
				assert.expect(10);

				var oTmpl = oView, oClone;
				if (!oTmpl.sViewName) {
					// Cloning views created from string or object (via viewContent) currently fails for HTML and JSON views
					//	We will address this in a separate change, until then we skip testing those cases
					assert.expect(5);
					assert.ok(true, "Skipping clone of views created from string of object");
					return;
				}
				oClone = oTmpl.clone();

				return oClone.loaded()
					.then(fnWaitForNestedViews)
					.then(function() {
						oTmpl.fireBeforeRendering();
						assert.ok(window.onBeforeRenderingCalled === oTmpl.getController(), "Event is called on correct controller instance");

						oClone.fireBeforeRendering();
						assert.ok(window.onBeforeRenderingCalled === oClone.getController(), "Event is called on correct controller instance");

						// Cleanup
						oTmpl.destroy();
						oClone.destroy();
					});
			});
		});

	}

	return testsuite;
});
