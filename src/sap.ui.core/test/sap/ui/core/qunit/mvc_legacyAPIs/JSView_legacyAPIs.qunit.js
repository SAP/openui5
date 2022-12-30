/*global QUnit */
sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/mvc/Controller',
	'sap/m/Button',
	'sap/m/Panel',
	'./AnyView_legacyAPIs.qunit'
], function (coreLibrary, Controller, Button, Panel, testsuite) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var oConfig = {
		viewClassName: "sap.ui.core.mvc.JSView",
		idsToBeChecked: ["myPanel", "Button1"]
	};

	testsuite(oConfig, "JSView creation loading from file", function () {
		return sap.ui.jsview("example.mvc_legacyAPIs.test");
	});

	testsuite(oConfig, "JSView creation with local view + controller definition", function () {

		// View definition
		sap.ui.jsview("example.mvc.testLocal", {

			getControllerName: function () {
				return "example.mvc.testLocal";
			},

			/*
			 * @param oController may be null
			 * @returns {sap.ui.core.Control}
			 */
			createContent: function (oController) {
				var oPanel = new Panel(this.createId("myPanel"));
				var oButton = new Button(this.createId("Button1"), { text: "Hello JS View" });
				oButton.attachPress(oController.doIt, oController);
				oPanel.addContent(oButton);
				var oButton2 = new Button(this.createId("Button2"), { text: "Hello" });
				oPanel.addContent(oButton2);
				var oButtonX = new Button(this.createId("ButtonX"), { text: "Another Hello" });
				oButtonX.attachPress(oController.sap.doIt, oController);
				oPanel.addContent(oButtonX);
				var oView1 = sap.ui.jsonview(this.createId("MyJSONView"), "example.mvc_legacyAPIs.test2");
				oPanel.addContent(oView1);
				var oView2 = sap.ui.jsview(this.createId("MyJSView"), "example.mvc_legacyAPIs.test2");
				oPanel.addContent(oView2);
				var oView3 = sap.ui.xmlview(this.createId("MyXMLView"), "example.mvc_legacyAPIs.test2");
				oPanel.addContent(oView3);
				var oView4 = sap.ui.htmlview(this.createId("MyHTMLView"), "example.mvc_legacyAPIs.test2");
				oPanel.addContent(oView4);
				if (this.getViewData()) {
					window.dataCreateView = this.getViewData().test;
				}
				return [oPanel];
			}
		});

		// controller definition
		sap.ui.controller("example.mvc.testLocal", {

			onInit: function () {
				QUnit.config.current.assert.ok(true, "onInit is called now");
				window.onInitCalled = this;
				if (this.getView().getViewData()) {
					window.dataOnInit = this.getView().getViewData().test;
				}
			},


			onBeforeRendering: function () {
				window.onBeforeRenderingCalled = this;
				if (this.getView().getViewData()) {
					window.dataBeforeRendering = this.getView().getViewData().test;
				}
			},


			onAfterRendering: function () {
				QUnit.config.current.assert.ok(true, "onAfterRendering is called now");
				window.onAfterRenderingCalled = this;
				if (this.getView().getViewData()) {
					window.dataAfterRendering = this.getView().getViewData().test;
				}
			},


			onExit: function () {
				window.onExitCalled = this;
			},

			doIt: function (oEvent) {
				QUnit.config.current.assert.ok(true, "Event of " + oEvent.getSource().getId() + " executed in controller");
				var controller = this;
				QUnit.config.current.assert.ok(controller instanceof Controller, "context for event handling must be instanceof sap.ui.core.mvc.Controller");
				if (this.getView().getViewData()) {
					window.dataEventHandler = this.getView().getViewData().test;
				}
			},

			sap: {
				doIt: function (oEvent) {
					QUnit.config.current.assert.ok(true, "Event of " + oEvent.getSource().getId() + " executed in controller");
					QUnit.config.current.assert.ok(this instanceof Controller, "context for event handling must be instanceof sap.ui.core.mvc.Controller");
				}
			}

		});

		return sap.ui.jsview("example.mvc.testLocal");
	});

	testsuite(oConfig, "JSView creation via generic view factory", function () {
		return sap.ui.view({ viewName: "example.mvc_legacyAPIs.test", type: ViewType.JS, viewData: { test: "testdata" } });
	}, true);

	QUnit.test("Check for Controller and View Connection in createContent() before onInit() is called", function (assert) {

		// View definition
		sap.ui.jsview("example.mvc.test_connection", {

			getControllerName: function () {
				return "example.mvc.test_connection";
			},

			createContent: function (oController) {
				assert.ok(this.getController(), "Controller is connected.");
				assert.ok(oController.getView(), "View is connected.");
				return [];
			}
		});

		// controller definition
		sap.ui.controller("example.mvc.test_connection", {
			onInit: function () {
				assert.ok(true, "onInit is called.");
			}
		});

		sap.ui.jsview("example.mvc.test_connection");
	});

});