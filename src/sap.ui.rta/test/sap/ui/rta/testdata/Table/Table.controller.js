sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(jQuery, Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.Table.Table", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/Table/products.json"));
			this.getView().setModel(oModel);
		},

		switchToAdaptionMode: function () {
			jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
			var oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl: this.getOwnerComponent().getAggregation("rootControl"),
				flexSettings: {
					developerMode: false
				}
			});
			oRta.start();
		}
	});

	return TableController;
});
