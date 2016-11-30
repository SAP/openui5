sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	var mode = "";

	return Controller.extend("flexiblecolumnlayout.FlexibleColumnLayout", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var sRouteName = oEvent.getParameter("name");
			var sLayout = oEvent.getParameters().arguments.layout;

			// Update the layout
			oModel.setProperty("/layout", sLayout);

			// Save the current route name
			this.currentRouteName = sRouteName;
		},

		onLayoutChanged: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();

			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				oUIState = this.byId("fcl").getCurrentUIState();

			// Update the action buttons visibility
			oModel.setData(oUIState);

			// Replace the URL if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName, {layout: oUIState.layout}, true);
			}

		}
	});
}, true);
