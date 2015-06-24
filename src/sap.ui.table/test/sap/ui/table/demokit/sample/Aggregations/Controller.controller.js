sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, TableExampleUtils, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Aggregations.Controller", {
		
		onInit : function () {
			var oView = this.getView();
			
			// set explored app's demo model on this sample
			var oJSONModel = TableExampleUtils.initSampleDataModel();
			oView.setModel(oJSONModel);
			
			oView.setModel(new JSONModel({
				filterValue: ""
			}), "ui");
			
			this._oTxtFilter = null;
			this._oFacetFilter = null;
		},
		
		_filter : function () {
			var oFilter = null;
			
			if (this._oTxtFilter && this._oFacetFilter) {
				oFilter = new sap.ui.model.Filter([this._oTxtFilter, this._oFacetFilter], true);
			} else if (this._oTxtFilter) {
				oFilter = this._oTxtFilter;
			} else if (this._oFacetFilter) {
				oFilter = this._oFacetFilter;
			}
			
			this.getView().byId("table").getBinding("rows").filter(oFilter, "Application");
		},
		
		handleTxtFilter : function(oEvent) {
			var sQuery = oEvent ? oEvent.getParameter("query") : null;
			this._oTxtFilter = null;
			
			if (sQuery) {
				this._oTxtFilter = new Filter([
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("Status", FilterOperator.Contains, sQuery)
				], false)
			}
			
			this.getView().getModel("ui").setProperty("/filterValue", sQuery);
			
			if (oEvent) {
				this._filter();
			}
		},
		
		clearAllFilters : function() {
			this.handleTxtFilter();
			this.handleFacetFilterReset();
			this._filter();
		},
		
		_getFacetFilterLists : function() {
			var oFacetFilter = this.getView().byId("facetFilter");
			return oFacetFilter.getLists();
		},
		
		handleFacetFilterReset : function(oEvent) {
			var aFacetFilterLists = this._getFacetFilterLists();
			
			for (var i=0; i < aFacetFilterLists.length; i++) {
				for (var i=0; i < aFacetFilterLists.length; i++) {
					aFacetFilterLists[i].setSelectedKeys();
				}
			}
			this._oFacetFilter = null;
			
			if (oEvent) {
				this._filter();
			}
		},
		
		handleListClose : function(oEvent) {
			var aFacetFilterLists = this._getFacetFilterLists().filter(function(oList) {
				return oList.getActive() && oList.getSelectedItems().length;
			});
			
			this._oFacetFilter = new Filter(aFacetFilterLists.map(function(oList) {
				return new Filter(oList.getSelectedItems().map(function(oItem) {
					return new Filter(oList.getTitle(), FilterOperator.EQ, oItem.getText());
				}), false);
			}), true);
			
			this._filter();
		},
		
		showInfo : function(oEvent) {
			TableExampleUtils.showInfo(jQuery.sap.getModulePath("sap.ui.table.sample.Aggregations", "/info.json"), oEvent.getSource());
		}
		
	});

});
