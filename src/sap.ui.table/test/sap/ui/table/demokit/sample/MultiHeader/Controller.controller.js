sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.MultiHeader.Controller", {
		
		onInit : function () {

			// create JSON model instance
			var oModel = new JSONModel();

			// JSON sample data
			var oData = {
				modelData:[
					{supplier:"Titanium", street:"401 23rd St", city:"Port Angeles", phone:"5682-121-828"},
					{supplier:"Technocom", street:"51 39th St", city:"Smallfield", phone:"2212-853-789"},
					{supplier:"Red Point Stores", street:"451 55th St", city:"Meridian", phone:"2234-245-898"},
					{supplier:"Technocom", street:"40 21st St", city:"Bethesda", phone:"5512-125-643"},
					{supplier:"Very Best Screens", street:"123 72nd St", city:"McLean", phone:"5412-543-765"}
				]};
			
			// set the data for the model
			oModel.setData(oData);
			var oView = this.getView();
			// set the model to the core
			oView.setModel(oModel);
			
			var oTable = oView.byId("table1");
			
			oView.byId("multiheader").setHeaderSpan([3,2,1]);
		}
	});

});
