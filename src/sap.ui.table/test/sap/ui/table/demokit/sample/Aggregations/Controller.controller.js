sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat",
	"sap/m/ToolbarSpacer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
], function(Log, Controller, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Aggregations.Controller", {

		onInit: function() {
			const oView = this.getView();

			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			oView.setModel(oJSONModel);

			oView.setModel(new JSONModel({
				filterValue: ""
			}), "ui");

			this._oTxtFilter = null;
			this._oFacetFilter = null;

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/Aggregations"));
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

			if (this._oTxtFilter && this._oFacetFilter) {
				oFilter = new Filter([this._oTxtFilter, this._oFacetFilter], true);
			} else if (this._oTxtFilter) {
				oFilter = this._oTxtFilter;
			} else if (this._oFacetFilter) {
				oFilter = this._oFacetFilter;
			}

			this.byId("table").getBinding().filter(oFilter, "Application");
		},

		handleTxtFilter: function(oEvent) {
			const sQuery = oEvent ? oEvent.getParameter("query") : null;
			this._oTxtFilter = null;

			if (sQuery) {
				this._oTxtFilter = new Filter([
					new Filter("Name", FilterOperator.Contains, sQuery),
					new Filter("Status", FilterOperator.Contains, sQuery)
				], false);
			}

			this.getView().getModel("ui").setProperty("/filterValue", sQuery);

			if (oEvent) {
				this._filter();
			}
		},

		clearAllFilters: function() {
			this.handleTxtFilter();
			this.handleFacetFilterReset();
			this._filter();
		},

		_getFacetFilterLists: function() {
			const oFacetFilter = this.byId("facetFilter");
			return oFacetFilter.getLists();
		},

		handleFacetFilterReset: function(oEvent) {
			const aFacetFilterLists = this._getFacetFilterLists();

			for (let i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}
			this._oFacetFilter = null;

			if (oEvent) {
				this._filter();
			}
		},

		handleListClose: function(oEvent) {
			const aFacetFilterLists = this._getFacetFilterLists().filter(function(oList) {
				return oList.getActive() && oList.getSelectedItems().length;
			});

			this._oFacetFilter = new Filter(aFacetFilterLists.map(function(oList) {
				return new Filter(oList.getSelectedItems().map(function(oItem) {
					return new Filter(oList.getTitle(), FilterOperator.EQ, oItem.getText());
				}), false);
			}), true);

			this._filter();
		},

		formatAvailableToObjectState: function(bAvailable) {
			return bAvailable ? "Success" : "Error";
		}

	});

});