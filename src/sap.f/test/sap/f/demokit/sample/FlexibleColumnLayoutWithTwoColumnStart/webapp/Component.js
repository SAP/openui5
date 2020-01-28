sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (jQuery, UIComponent, JSONModel, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	var Component = UIComponent.extend("sap.f.FlexibleColumnLayoutWithTwoColumnStart.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oModel = new JSONModel();
			this.setModel(oModel);

			// set products demo model on this sample
			var oProductsModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			oProductsModel.setSizeLimit(1000);
			this.setModel(oProductsModel, "products");


			this.getRouter().initialize();
		},

		createContent: function () {
			return sap.ui.view({
				viewName: "sap.f.FlexibleColumnLayoutWithTwoColumnStart.view.FlexibleColumnLayout",
				type: "XML"
			});
		},

		/**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getHelper: function () {
			var oFCL = this.getRootControl().byId("fcl"),
				oParams = jQuery.sap.getUriParameters(),
				oSettings = {
					defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsMidExpanded,
					mode: oParams.get("mode"),
					initialColumnsCount: 2,
					maxColumnsCount: oParams.get("max")
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});
	return Component;
}, true);
