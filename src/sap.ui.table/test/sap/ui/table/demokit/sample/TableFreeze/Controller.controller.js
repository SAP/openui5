sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
], function(Log, Controller, JSONModel, MessageToast, DateFormat, jQuery, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.TableFreeze.Controller", {

		onInit: function() {
			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			this.getView().setModel(oJSONModel);
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

		formatAvailableToObjectState: function(bAvailable) {
			return bAvailable ? "Success" : "Error";
		},

		formatAvailableToIcon: function(bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},

		handleDetailsPress: function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		},

		buttonPress: function(oEvent) {
			const oView = this.getView();
			const oTable = oView.byId("table1");
			const sColumnCount = oView.byId("inputColumn").getValue() || 0;
			const sRowCount = oView.byId("inputRow").getValue() || 0;
			const sBottomRowCount = oView.byId("inputBottomRow").getValue() || 0;
			let iColumnCount = parseInt(sColumnCount);
			let iRowCount = parseInt(sRowCount);
			let iBottomRowCount = parseInt(sBottomRowCount);
			const iTotalColumnCount = oTable.getColumns().length;
			const iTotalRowCount = oTable.getRows().length;

			// Fixed column count exceeds the total column count
			if (iColumnCount > iTotalColumnCount) {
				iColumnCount = iTotalColumnCount;
				oView.byId("inputColumn").setValue(iTotalColumnCount);
				MessageToast.show("Fixed column count exceeds the total column count. Value in column count input got updated.");
			}

			// Sum of fixed row count and bottom row count exceeds the total row count
			if (iRowCount + iBottomRowCount > iTotalRowCount) {

				if ((iRowCount < iTotalRowCount) && (iBottomRowCount < iTotalRowCount)) {
					// both row count and bottom count smaller than total row count
					iBottomRowCount = 1;
				} else if ((iRowCount > iTotalRowCount) && (iBottomRowCount < iTotalRowCount)) {
					// row count exceeds total row count
					iRowCount = iTotalRowCount - iBottomRowCount - 1;
				} else if ((iRowCount < iTotalRowCount) && (iBottomRowCount > iTotalRowCount)) {
					// bottom row count exceeds total row count
					iBottomRowCount = iTotalRowCount - iRowCount - 1;
				} else {
					// both row count and bottom count exceed total row count
					iRowCount = 1;
					iBottomRowCount = 1;
				}

				// update inputs
				oView.byId("inputRow").setValue(iRowCount);
				oView.byId("inputBottomRow").setValue(iBottomRowCount);
				MessageToast.show("Sum of fixed row count and bottom row count exceeds the total row count. Input values got updated.");
			}

			oTable.setFixedColumnCount(iColumnCount);
			oTable.getRowMode().setFixedTopRowCount(iRowCount);
			oTable.getRowMode().setFixedBottomRowCount(iBottomRowCount);
		}

	});

});