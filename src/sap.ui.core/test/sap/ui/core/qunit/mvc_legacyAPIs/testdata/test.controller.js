/*global QUnit */
(function() {
	"use strict";

	sap.ui.controller("example.mvc_legacyAPIs.test", {


		onInit: function() {
			QUnit.config.current.assert.ok(true, "onInit is called now");
			window.onInitCalled = this;
			if (this.getView().getViewData()) {
				window.dataOnInit = this.getView().getViewData().test;
			}
			sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({
				"key": "value"
			}));
		},


		onBeforeRendering: function() {
			window.onBeforeRenderingCalled = this;
			if (this.getView().getViewData()) {
				window.dataBeforeRendering = this.getView().getViewData().test;
			}
		},


		onAfterRendering: function() {
			QUnit.config.current.assert.ok(true, "onAfterRendering is called now");
			window.onAfterRenderingCalled = this;
			if (this.getView().getViewData()) {
				window.dataAfterRendering = this.getView().getViewData().test;
			}
		},


		onExit: function() {
			window.onExitCalled = this;
		},

		doIt: function(oEvent) {
			QUnit.config.current.assert.ok(true, "Event of " + oEvent.getSource().getId() + " executed in controller");
			var controller = this;
			QUnit.config.current.assert.ok(controller instanceof sap.ui.core.mvc.Controller, "context for event handling must be instanceof sap.ui.core.mvc.Controller");
			if (this.getView().getViewData()) {
				window.dataEventHandler = this.getView().getViewData().test;
			}
		},

		valueFormatter: function(oValue) {
			return "formatted-" + oValue;
		},

		sap: {
			doIt: function(oEvent) {
				QUnit.config.current.assert.ok(true, "Event of " + oEvent.getSource().getId() + " executed in controller");
				QUnit.config.current.assert.ok(this instanceof sap.ui.core.mvc.Controller, "context for event handling must be instanceof sap.ui.core.mvc.Controller");
			}
		}

	});

}());