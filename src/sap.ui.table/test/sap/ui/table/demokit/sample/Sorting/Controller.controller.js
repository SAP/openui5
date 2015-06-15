sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/ui/table/SortOrder",
	"sap/ui/model/Sorter",
	"sap/ui/core/format/DateFormat"
], function(Controller, TableExampleUtils, SortOrder, Sorter, DateFormat) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Sorting.Controller", {
		
		onInit : function () {
			// set explored app's demo model on this sample
			var oJSONModel = TableExampleUtils.initSampleDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);
			
			//Initial sorting
			var oProductNameColumn = oView.byId("name");
			oView.byId("table").sort(oProductNameColumn, SortOrder.Ascending);
		},
		
		clearAllSortings : function(oEvent) {
			var oTable = this.getView().byId("table");
			oTable.getBinding("rows").sort(null);
			this._resetSortingState();
		},
		
		sortCategories : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table");
			var oCategoriesColumn = oView.byId("categories");
			
			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},
		
		sortCategoriesAndName : function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("table");
			oTable.sort(oView.byId("categories"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("name"), SortOrder.Ascending, true);
		},
		
		sortDeliveryDate : function(oEvent) {
			var oCurrentColumn = oEvent.getParameter("column");
			var oDeliveryDateColumn = this.getView().byId("deliverydate");
			if (oCurrentColumn != oDeliveryDateColumn) {
				oDeliveryDateColumn.setSorted(false); //No multi-column sorting
				return;
			}
			
			oEvent.preventDefault();
			
			var sOrder = oEvent.getParameter("sortOrder");
			var oDateFormat = DateFormat.getDateInstance({pattern: "dd/MM/yyyy"});
			
			this._resetSortingState(); //No multi-column sorting
			oDeliveryDateColumn.setSorted(true);
			oDeliveryDateColumn.setSortOrder(sOrder);
			
			var oSorter = new Sorter(oDeliveryDateColumn.getSortProperty(), sOrder === SortOrder.Descending);
			//The date data in the JSON model is string based. For a proper sorting the compare function needs to be customized.
			oSorter.fnCompare = function(a, b) {
				if (b == null) {
					return -1;
				}
				if (a == null) {
					return 1;
				}
				
				var aa = oDateFormat.parse(a).getTime();
				var bb = oDateFormat.parse(b).getTime();
				
				if (aa < bb) {
					return -1;
				}
				if (aa > bb) {
					return 1;
				}
				return 0;
			};

			this.getView().byId("table").getBinding("rows").sort(oSorter);
		},
		
		_resetSortingState : function() {
			var oTable = this.getView().byId("table");
			var aColumns = oTable.getColumns();
			for (var i=0; i<aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},
		
		showInfo : function(oEvent) {
			TableExampleUtils.showInfo(jQuery.sap.getModulePath("sap.ui.table.sample.Sorting", "/info.json"), oEvent.getSource());
		}
		
	});

});
