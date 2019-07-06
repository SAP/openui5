sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"],
function (UIComponent, JSONModel) {
	"use strict";
	return UIComponent.extend("sap.m.sample.ComparisonPattern.app", {

		metadata: {
		    manifest: "json"
		},

		init : function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.setModel(oModel);

			UIComponent.prototype.init.apply(this, arguments);

			// Parse the current url and display the targets of the route that matches the hash
			this.getRouter().initialize();

			this.aSelectedItems = [];
		}

	});
}, /* bExport= */ true);
