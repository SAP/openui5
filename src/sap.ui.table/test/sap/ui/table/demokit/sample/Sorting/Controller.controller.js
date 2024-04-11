sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
], function(Log, Controller, Sorter, JSONModel, DateFormat, ToolbarSpacer, CoreLibrary, jQuery, UI5Date) {
	"use strict";

	const SortOrder = CoreLibrary.SortOrder;

	return Controller.extend("sap.ui.table.sample.Sorting.Controller", {

		onInit: function() {
			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			const oView = this.getView();
			oView.setModel(oJSONModel);

			//Initial sorting
			const oProductNameColumn = oView.byId("name");
			oView.byId("table").sort(oProductNameColumn, SortOrder.Ascending);

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/Sorting"));
			}, function(oError) { /*ignore*/ });
		},

		initSampleDataModel: function() {
			const oModel = new JSONModel();

			const oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"), {
				dataType: "json",
				success: function(oData) {
					const aTemp1 = [];
					const aTemp2 = [];
					const aSuppliersData = [];
					const aCategoryData = [];
					for (let i = 0; i < oData.ProductCollection.length; i++) {
						const oProduct = oData.ProductCollection[i];
						if (oProduct.SupplierName && aTemp1.indexOf(oProduct.SupplierName) < 0) {
							aTemp1.push(oProduct.SupplierName);
							aSuppliersData.push({Name: oProduct.SupplierName});
						}
						if (oProduct.Category && aTemp2.indexOf(oProduct.Category) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.Category});
						}
						oProduct.DeliveryDate = Date.now() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						oProduct.DeliveryDateStr = oDateFormat.format(UI5Date.getInstance(oProduct.DeliveryDate));
						oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						oProduct.Available = oProduct.Status === "Available" ? true : false;
					}

					oData.Suppliers = aSuppliersData;
					oData.Categories = aCategoryData;

					oModel.setData(oData);
				},
				error: function() {
					Log.error("failed to load json");
				}
			});

			return oModel;
		},

		clearAllSortings: function(oEvent) {
			const oTable = this.byId("table");
			oTable.getBinding().sort(null);
			this._resetSortingState();
		},

		sortCategories: function(oEvent) {
			const oView = this.getView();
			const oTable = oView.byId("table");
			const oCategoriesColumn = oView.byId("categories");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		sortCategoriesAndName: function(oEvent) {
			const oView = this.getView();
			const oTable = oView.byId("table");
			oTable.sort(oView.byId("categories"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("name"), SortOrder.Ascending, true);
		},

		sortDeliveryDate: function(oEvent) {
			const oCurrentColumn = oEvent.getParameter("column");
			const oDeliveryDateColumn = this.byId("deliverydate");
			if (oCurrentColumn !== oDeliveryDateColumn) {
				oDeliveryDateColumn.setSortOrder(SortOrder.None); //No multi-column sorting
				return;
			}

			oEvent.preventDefault();

			const sOrder = oEvent.getParameter("sortOrder");
			const oDateFormat = DateFormat.getDateInstance({pattern: "dd/MM/yyyy"});

			this._resetSortingState(); //No multi-column sorting
			oDeliveryDateColumn.setSortOrder(sOrder);

			const oSorter = new Sorter(oDeliveryDateColumn.getSortProperty(), sOrder === SortOrder.Descending);
			//The date data in the JSON model is string based. For a proper sorting the compare function needs to be customized.
			oSorter.fnCompare = function(a, b) {
				if (b == null) {
					return -1;
				}
				if (a == null) {
					return 1;
				}

				const aa = oDateFormat.parse(a).getTime();
				const bb = oDateFormat.parse(b).getTime();

				if (aa < bb) {
					return -1;
				}
				if (aa > bb) {
					return 1;
				}
				return 0;
			};

			this.byId("table").getBinding().sort(oSorter);
		},

		_resetSortingState: function() {
			const oTable = this.byId("table");
			const aColumns = oTable.getColumns();
			for (let i = 0; i < aColumns.length; i++) {
				aColumns[i].setSortOrder(SortOrder.None);
			}
		}

	});

});