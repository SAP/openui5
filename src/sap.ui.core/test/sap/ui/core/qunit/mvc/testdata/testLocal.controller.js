/* global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

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
			QUnit.config.current.assert.ok(this instanceof Controller, "context for event handling must be instanceof sap.ui.core.mvc.Controller");
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
});
