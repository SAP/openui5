sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
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
			// create root view
			return sap.ui.view({
				viewName: "flexiblecolumnlayout.FlexibleColumnLayout",
				type: "XML"
			});
		},

		getFlexibleColumnLayout: function () {
			return this.getRootControl().byId("fcl");
		}
	});
	return Component;
}, true);
