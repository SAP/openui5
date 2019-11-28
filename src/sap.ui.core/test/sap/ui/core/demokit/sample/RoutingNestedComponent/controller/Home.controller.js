sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log"
], function(Controller, Log) {
	"use strict";
	return Controller.extend("sap.ui.demo.routing.nested.controller.Home", {
		onInit: function() {
			Log.info(this.getView().getControllerName(), "onInit");

			this.getOwnerComponent()
				.getRouter()
				.getRoute("home")
				.attachMatched(this._onMatched, this);

			this.getOwnerComponent()
				.getRouter()
				.attachBypassed(this._onBypassed, this);
		},
		_onMatched: function() {
			Log.info(this.getView().getControllerName(), "_onPatternMatched");

			this.getOwnerComponent().setSelectedMenuItem("home");
		},
		_onBypassed: function(oEvent) {
			var sHash = oEvent.getParameter("hash");
			Log.info(
				this.getView().getControllerName(),
				"_onBypassed Hash=" + sHash
			);
		}
	});
});
