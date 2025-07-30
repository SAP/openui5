sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (UIComponent, JSONModel, library, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	var LayoutType = library.LayoutType;

	var Component = UIComponent.extend("sap.f.FlexibleColumnLayoutWithTwoColumnStart.Component", {
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
		},

		onBeforeRouteMatched: function(oEvent) {

			var oModel = this.getModel();

			var sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				sLayout = LayoutType.OneColumn;
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
					defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
					initialColumnsCount: 2,
					maxColumnsCount: oParams.get("max")
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});
	return Component;
});
