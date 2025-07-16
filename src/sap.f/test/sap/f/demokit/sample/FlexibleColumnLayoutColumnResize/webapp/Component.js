sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (UIComponent, JSONModel, fioriLibrary, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	var LayoutType = fioriLibrary.LayoutType;

	var Component = UIComponent.extend("sap.f.FlexibleColumnLayoutColumnResize.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oModel = new JSONModel();
			this.setModel(oModel);

			// set products demo model on this sample
			var oProductsModel = new JSONModel("./data/sections.json");
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

		getFCL: function () {
			return this.getRootControl().byId("fcl");
		},

		/**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getHelper: function () {
			var oFCL = this.getFCL(),
				oSettings = {
					defaultTwoColumnLayoutType: LayoutType.TwoColumnsBeginExpanded,
					defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
					maxColumnsCount: 1
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});

	return Component;

}, true);
