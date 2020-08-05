sap.ui.define([
	"sap/ui/core/sample/RoutingNestedComponent/base/BaseController",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel"
], function(Controller, Log, JSONModel){
	"use strict";
	return Controller.extend("sap.ui.core.sample.RoutingNestedComponent.controller.App", {
		onInit: function(){
			Log.info(this.getView().getControllerName(), "onInit");

			this.getOwnerComponent().getRouter().attachRouteMatched(this._onRouteMatched, this);
			this.getOwnerComponent().getRouter().attachBypassed(this._onBypassed, this);

			var oTitlesModel = new JSONModel();
			this.getView().setModel(oTitlesModel, "titleModel");
			this.getOwnerComponent().getRouter().attachTitleChanged(function (oEvent) {
				oTitlesModel.setData(oEvent.getParameters());
			});
		},

		_onRouteMatched: function(oEvent) {
			Log.info(this.getView().getControllerName(), "_onRouteMatched");
			var oConfig = oEvent.getParameter("config");

			// select the corresponding item in the left menu
			this.setSelectedMenuItem(oConfig.name);
		},

		setSelectedMenuItem: function(sKey) {
			this.byId("navigationList").setSelectedKey(sKey);
		},

		_onBypassed: function(oEvent) {
			var sHash = oEvent.getParameter("hash");
			Log.info(
				this.getView().getControllerName(),
				"_onBypassed Hash=" + sHash
			);
		},

		onItemSelect: function(oEvent) {
			var sKey = oEvent.getParameter("item").getKey();
			Log.info(this.getView().getControllerName(), "onItemSelect Key=" + sKey);

			this.getOwnerComponent().getRouter().navTo(sKey);
		}
	});
});
