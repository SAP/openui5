sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/ToolbarSpacer",
	"sap/ui/table/library"
], function(Controller, Sorter, JSONModel, DateFormat, ToolbarSpacer, library) {
	"use strict";

	// shortcut for sap.ui.table.SortOrder
	var SortOrder = library.SortOrder;

	return Controller.extend("sap.ui.table.sample.Sorting.Controller", {

		onInit : function() {
			// set explored app's demo model on this sample
			var oJSONModel = this.initSampleDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);

			//Initial sorting
			var oProductNameColumn = oView.byId("name");
			oView.byId("table").sort(oProductNameColumn, SortOrder.Ascending);

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				var oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/Sorting"));
			}, function(oError){/*ignore*/});
		},

		initSampleDataModel : function() {
			var oModel = new JSONModel();

			var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json", {
				dataType: "json",
				success: function(oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i = 0; i < oData.ProductCollection.length; i++) {
						var oProduct = oData.ProductCollection[i];
						if (oProduct.SupplierName && jQuery.inArray(oProduct.SupplierName, aTemp1) < 0) {
							aTemp1.push(oProduct.SupplierName);
							aSuppliersData.push({Name: oProduct.SupplierName});
						}
						if (oProduct.Category && jQuery.inArray(oProduct.Category, aTemp2) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.Category});
						}
						oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						oProduct.DeliveryDateStr = oDateFormat.format(new Date(oProduct.DeliveryDate));
						oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						oProduct.Available = oProduct.Status == "Available" ? true : false;
					}

					oData.Suppliers = aSuppliersData;
					oData.Categories = aCategoryData;

					oModel.setData(oData);
				},
				error: function() {
					jQuery.sap.log.error("failed to load json");
				}
			});

			return oModel;
		},

		clearAllSortings : function(oEvent) {
			var oTable = this.byId("table");
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
			var oDeliveryDateColumn = this.byId("deliverydate");
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

			this.byId("table").getBinding("rows").sort(oSorter);
		},

		_resetSortingState : function() {
			var oTable = this.byId("table");
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		}

	});

});