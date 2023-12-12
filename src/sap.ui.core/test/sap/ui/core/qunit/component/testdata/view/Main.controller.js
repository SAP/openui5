/*global QUnit */
sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var MainController = Controller.extend("sap.ui.test.view.Main", {


		onInit: function() {
			QUnit.assert.ok(true, "onInit is called now");
			window.onInitCalled = true;
			if (this.getView().getViewData()) {
				window.dataOnInit = this.getView().getViewData().test;
			}
			this.getView().setModel(new JSONModel({
				"key": "value"
			}));
		},


		onBeforeRendering: function() {
			window.onBeforeRenderingCalled = true;
			if (this.getView().getViewData()) {
				window.dataBeforeRendering = this.getView().getViewData().test;
			}
		},


		onAfterRendering: function() {
			QUnit.assert.ok(true, "onAfterRendering is called now");
			window.onAfterRenderingCalled = true;
			if (this.getView().getViewData()) {
				window.dataAfterRendering = this.getView().getViewData().test;
			}
		},


		onExit: function() {
			window.onExitCalled = true;
		},

		doIt: function(oEvent) {
			QUnit.assert.ok(true, "Event of " + oEvent.getSource().getId() + " executed in controller");
			QUnit.assert.ok(this instanceof Controller, "context for event handling must be instanceof sap.ui.core.mvc.Controller");
			if (this.getView().getViewData()) {
				window.dataEventHandler = this.getView().getViewData().test;
			}
		},

		valueFormatter: function(oValue) {
			return "formatted-" + oValue;
		}

	});


	return MainController;

});
