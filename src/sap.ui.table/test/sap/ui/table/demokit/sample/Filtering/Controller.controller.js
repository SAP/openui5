sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat",
	"sap/m/ToolbarSpacer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Integer"
], function(Log, Controller, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Filtering.Controller", {

		onInit: function() {
			const oView = this.getView();

			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			oView.setModel(oJSONModel);

			oView.setModel(new JSONModel({
				globalFilter: "",
				availabilityFilterOn: false,
				cellFilterOn: false
			}), "ui");

			this._oGlobalFilter = null;
			this._oPriceFilter = null;

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/Filtering"));
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

		_filter: function() {
			let oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("table").getBinding().filter(oFilter, "Application");
		},

		filterGlobally: function(oEvent) {
			const sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("Category", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
		},

		filterPrice: function(oEvent) {
			const oColumn = oEvent.getParameter("column");
			if (oColumn !== this.byId("price")) {
				return;
			}

			oEvent.preventDefault();

			const sValue = oEvent.getParameter("value");

			function clear() {
				this._oPriceFilter = null;
				oColumn.setFiltered(false);
				this._filter();
			}

			if (!sValue) {
				clear.apply(this);
				return;
			}

			let fValue = null;
			try {
				fValue = parseFloat(sValue, 10);
			} catch (e) {
				// nothing
			}

			if (!isNaN(fValue)) {
				this._oPriceFilter = new Filter("Price", FilterOperator.BT, fValue - 20, fValue + 20);
				oColumn.setFiltered(true);
				this._filter();
			} else {
				clear.apply(this);
			}
		},

		clearAllFilters: function(oEvent) {
			const oTable = this.byId("table");

			const oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");
			oUiModel.setProperty("/availabilityFilterOn", false);

			this._oGlobalFilter = null;
			this._oPriceFilter = null;
			this._filter();

			const aColumns = oTable.getColumns();
			for (let i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},

		toggleAvailabilityFilter: function(oEvent) {
			this.byId("availability").filter(oEvent.getParameter("pressed") ? "X" : "");
		},

		formatAvailableToObjectState: function(bAvailable) {
			return bAvailable ? "Success" : "Error";
		}

	});

});