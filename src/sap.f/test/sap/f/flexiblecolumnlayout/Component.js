sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (UIComponent, JSONModel, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	var Component = UIComponent.extend("flexiblecolumnlayout.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oModel = new JSONModel();
			this.setModel(oModel);

			this.getRouter().initialize();
		},

		createContent: function () {
			return sap.ui.view({
				viewName: "flexiblecolumnlayout.FlexibleColumnLayout",
				type: "XML"
			});
		},

		/**
		 * Returns an instance of the semantic helper
		 * @returns {*}
		 */
		getHelper: function () {
			var oFCL = this.getRootControl().byId("fcl"),
				oSettings = {
					mode: getUrlParam(window.location.href, "sim"),
					defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsMidExpanded
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});
	return Component;
}, true);
