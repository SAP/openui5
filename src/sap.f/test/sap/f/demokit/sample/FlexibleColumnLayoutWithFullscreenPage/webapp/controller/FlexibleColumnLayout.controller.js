sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.FlexibleColumnLayoutWithFullscreenPage.controller.FlexibleColumnLayout", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
		},

		_updateLayout: function(sLayout) {
			var oModel = this.getOwnerComponent().getModel();

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		},

		onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			this._updateUIElements();

			// Save the current route name
			this.getOwnerComponent().setRouteName(sRouteName);
			this.currentProduct = oArguments.product;
			this.currentSupplier = oArguments.supplier;
			this.currentCategory = oArguments.category;
		},

		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");

			this._updateUIElements();

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.getOwnerComponent().getRouteName(),
					{layout: sLayout, category: this.currentCategory, product: this.currentProduct, supplier: this.currentSupplier}, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.getOwnerComponent().getModel();
			var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
			oModel.setData(oUIState, true);
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
		}
	});
});
