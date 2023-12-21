sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.MultiHeader.Controller", {
		onInit: function() {
			const oModel = new JSONModel();
			const oData = {
				modelData: [
					{supplier: "Titanium", street: "401 23rd St", city: "Port Angeles", phone: "5682-121-828", openOrders: 10},
					{supplier: "Technocom", street: "51 39th St", city: "Smallfield", phone: "2212-853-789", openOrders: 0},
					{supplier: "Red Point Stores", street: "451 55th St", city: "Meridian", phone: "2234-245-898", openOrders: 5},
					{supplier: "Technocom", street: "40 21st St", city: "Bethesda", phone: "5512-125-643", openOrders: 0},
					{supplier: "Very Best Screens", street: "123 72nd St", city: "McLean", phone: "5412-543-765", openOrders: 6}
				]
			};
			const oView = this.getView();

			oModel.setData(oData);
			oView.setModel(oModel);
		}
	});
});