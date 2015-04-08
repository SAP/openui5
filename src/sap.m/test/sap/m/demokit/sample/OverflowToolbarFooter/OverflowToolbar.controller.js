sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/Sorter',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, Filter, Sorter, JSONModel) {
	"use strict";

	var OverflowToolbarController = Controller.extend("sap.m.sample.OverflowToolbarFooter.OverflowToolbar", {

		onInit : function (evt) {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		
			this.bGrouped = false;
			this.bDescending = false;
			this.sSearchQuery = 0;
		},

		onSliderMoved: function (oEvent) {
			var iValue = oEvent.getParameter("value");
			this.getView().byId("otbSubheader").setWidth(iValue + "%");
			this.getView().byId("otbFooter").setWidth(iValue + "%");
		},

		_fnGroup : function (oContext){
			var sSupplierName = oContext.getProperty("SupplierName");

			return {
				key : sSupplierName,
				text : sSupplierName
			};
		},

		onReset: function (oEvent){
			this.bGrouped = false;
			this.bDescending = false;
			this.sSearchQuery = 0;
			this.byId("maxPrice").setValue("");
		
			this.fnApplyFiltersAndOrdering();
		},
	
		onGroup: function (oEvent){
			this.bGrouped = !this.bGrouped;
			this.fnApplyFiltersAndOrdering();
		},

		onSort: function (oEvent) {
			this.bDescending = !this.bDescending;
			this.fnApplyFiltersAndOrdering();
		},
	
		onFilter: function (oEvent) {
			this.sSearchQuery = oEvent.getSource().getValue();
			this.fnApplyFiltersAndOrdering();
		},

		fnApplyFiltersAndOrdering: function (oEvent){
			var aFilters = [],
				aSorters = [];
		
			if (this.bGrouped) {
				aSorters.push(new Sorter("SupplierName", this.bDescending, this._fnGroup));
			} else {
				aSorters.push(new Sorter("Name", this.bDescending));
			}

			if (this.sSearchQuery) {
				var oFilter = new Filter("Name", sap.ui.model.FilterOperator.Contains, this.sSearchQuery);
				aFilters.push(oFilter);
			}
			
			this.byId("idProductsTable").getBinding("items").filter(aFilters).sort(aSorters);
		}
	});

	return OverflowToolbarController;

});
