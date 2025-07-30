sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (UIComponent, JSONModel, library, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	var LayoutType = library.LayoutType;

	return UIComponent.extend("sap.f.FlexibleColumnLayoutWithFullscreenPage.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oModel = new JSONModel();
			this.setModel(oModel);

			// set products demo model on this sample
			var oProductsModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			oProductsModel.setSizeLimit(1000);
			this.setModel(oProductsModel, "products");

			this.oRouter = this.getRouter();
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			this.oRouter.initialize();

			this.currentRouteName = "";
		},

		onBeforeRouteMatched: function(oEvent) {

			var oModel = this.getModel();

			var sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				sLayout = LayoutType.OneColumn;
			}

			// Optional UX improvement:
			// The app may want to hide the old view early (before the routing hides it)
			// to prevent the view being temporarily shown aside the next view (during the transition to the next route)
			// if the views for both routes do not match semantically
			if (this.currentRouteName === "list") { // last viewed route was list
				var oListView = this.oRouter.getView("sap.f.FlexibleColumnLayoutWithFullscreenPage.view.List");
				this.getRootControl().byId("fcl").removeBeginColumnPage(oListView);
			}

			// Update the layout of the FlexibleColumnLayout
			oModel.setProperty("/layout", sLayout);
		},

		/**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getHelper: function () {
			var oFCL = this.getRootControl().byId("fcl"),
				oParams = new URLSearchParams(window.location.search),
				oSettings = {
					defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
					initialColumnsCount: oParams.get("initial"),
					maxColumnsCount: oParams.get("max")
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		},

		setRouteName: function (sRouteName) {
			this.currentRouteName = sRouteName;
		},

		getRouteName: function () {
			return this.currentRouteName;
		}
	});
});
