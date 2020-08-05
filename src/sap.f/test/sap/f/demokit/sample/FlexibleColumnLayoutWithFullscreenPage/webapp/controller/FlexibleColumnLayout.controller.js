sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/mvc/Controller",
	"sap/f/FlexibleColumnLayout"
], function (JSONModel, ResizeHandler, Controller, FlexibleColumnLayout) {
	"use strict";

	return Controller.extend("sap.f.FlexibleColumnLayoutWithFullscreenPage.controller.FlexibleColumnLayout", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			ResizeHandler.register(this.getView().byId("fcl"), this._onResize.bind(this));
		},

		onBeforeRouteMatched: function(oEvent) {

			var oModel = this.getOwnerComponent().getModel();

			var sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Optional UX improvement:
			// The app may want to hide the old view early (before the routing hides it)
			// to prevent the view being temporarily shown aside the next view (during the transition to the next route)
			// if the views for both routes do not match semantically
			if (this.currentRouteName === "master") { // last viewed route was master
				var oMasterView = this.oRouter.getView("sap.f.FlexibleColumnLayoutWithFullscreenPage.view.Master");
				this.getView().byId("fcl").removeBeginColumnPage(oMasterView);
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
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
			this.currentRouteName = sRouteName;
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
				this.oRouter.navTo(this.currentRouteName,
					{layout: sLayout, category: this.currentCategory, product: this.currentProduct, supplier: this.currentSupplier}, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.getOwnerComponent().getModel();
			var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
			oModel.setData(oUIState, true);
		},

		_onResize: function(oEvent) {
			var bPhone = (oEvent.size.width < FlexibleColumnLayout.TABLET_BREAKPOINT);
			this.getOwnerComponent().getModel().setProperty("/isPhone", bPhone);
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		}
	});
});
