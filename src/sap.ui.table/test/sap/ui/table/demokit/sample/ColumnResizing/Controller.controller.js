sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/m/ToolbarSpacer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
], function(Log, Controller, JSONModel, MessageToast, DateFormat, ToolbarSpacer, jQuery, UI5Date) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.ColumnResizing.Controller", {

		onInit: function() {
			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			const oView = this.getView();
			oView.setModel(oJSONModel);

			oView.setModel(new JSONModel({}), "ui");
			this.onColumnWidthsChange();

			this._messageBuffer = [];

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/ColumnResizing"));
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

		onColumnWidthsChange: function(oEvent) {
			const sColumnWidthMode = oEvent ? oEvent.getParameter("item").getKey() : "Static";
			let oWidthData;

			if (sColumnWidthMode === "Flexible") {
				oWidthData = {
					name: "25%",
					category: "25%",
					image: "15%",
					quantity: "10%",
					date: "25%"
				};
			} else {
				oWidthData = {
					name: sColumnWidthMode === "Mixed" ? "20%" : "13rem",
					category: "11rem",
					image: "7rem",
					quantity: "6rem",
					date: "9rem"
				};
			}

			this.getView().getModel("ui").setProperty("/widths", oWidthData);
		},

		onColumnResize: function(oEvent) {
			const oColumn = oEvent.getParameter("column");

			if (this.byId("deliverydate") === oColumn) {
				oEvent.preventDefault();
			} else {
				this._messageBuffer.push("Column '" + oColumn.getLabel().getText() + "' was resized to " + oEvent.getParameter("width") + ".");
				if (this._messageTimer) {
					clearTimeout(this._messageTimer);
				}
				this._messageTimer = setTimeout(function() {
					MessageToast.show(this._messageBuffer.join("\n"));
					this._messageBuffer = [];
					this._messageTimer = null;
				}.bind(this), 50);
			}
		}
	});

});