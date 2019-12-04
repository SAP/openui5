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
				var aNestedHistory = oEvent.getParameters().nestedHistory;

				if (aNestedHistory) {
					if (aNestedHistory.length > 2) {
						aNestedHistory.pop();
					}
					var oData = { breadcrumbs: [], currentLocation: "" };
					var oCurrentLocation = aNestedHistory.pop();
					oData.currentLocation = oCurrentLocation.history[oCurrentLocation.history.length - 1];
					oData.breadcrumbs = aNestedHistory.map(function (oHistory, iIndex, aHistory) {
						if (oHistory.history.length > 0) {
							var oLastHistoryEntry = oHistory.history[oHistory.history.length - 1];
							return {
								hash: oLastHistoryEntry.hash,
								title: oLastHistoryEntry.title,
								ownerComponentId: oHistory.ownerComponentId
							};
						}
					});
					oTitlesModel.setData(oData);
				}
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
		},

		onBreadcrumbPress: function(oEvent) {
			var sHash = oEvent.getSource().getBindingContext("titleModel").getProperty("hash");
			var sOwnerComponentId = oEvent.getSource().getBindingContext("titleModel").getProperty("ownerComponentId");
			var oNestedRouter = sap.ui.getCore().getComponent(sOwnerComponentId).getRouter();
			var oRouteInfo = oNestedRouter.getRouteInfoByHash(sHash);
			oNestedRouter.navTo(oRouteInfo.name, oRouteInfo.arguments);
		}
	});
});
