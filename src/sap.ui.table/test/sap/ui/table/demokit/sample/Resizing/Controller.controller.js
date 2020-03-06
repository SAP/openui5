sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/m/ToolbarSpacer"
], function(Controller, JSONModel, MessageToast, DateFormat, ToolbarSpacer) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Resizing.Controller", {

		onInit : function() {
			// set explored app's demo model on this sample
			var oJSONModel = this.initSampleDataModel();
			var oView = this.getView();
			oView.setModel(oJSONModel);

			oView.setModel(new JSONModel({
				visibleRowCountMode: "Fixed"
			}), "ui");
			this.onColumnWidthsChange();

			this._messageBuffer = [];

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				var oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/Resizing"));
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

		onColumnWidthsChange : function(oEvent) {
			var sColumnWidthMode = oEvent ? oEvent.getParameter("item").getKey() : "Static";
			var oWidthData;

			if (sColumnWidthMode == "Flexible") {
				oWidthData = {
					name: "25%",
					category: "25%",
					image: "15%",
					quantity: "10%",
					date: "25%"
				};
			} else {
				oWidthData = {
					name: sColumnWidthMode == "Mixed" ? "20%" : "13rem",
					category: "11rem",
					image: "7rem",
					quantity: "6rem",
					date: "9rem"
				};
			}

			this.getView().getModel("ui").setProperty("/widths", oWidthData);
		},

		onColumnResize : function(oEvent) {
			var oColumn = oEvent.getParameter("column");

			if (this.byId("deliverydate") == oColumn) {
				oEvent.preventDefault();
			} else {
				this._messageBuffer.push("Column '" + oColumn.getLabel().getText() + "' was resized to " + oEvent.getParameter("width") + ".");
				if (this._messageTimer) {
					jQuery.sap.clearDelayedCall(this._messageTimer);
				}
				this._messageTimer = jQuery.sap.delayedCall(50, this, function(){
					MessageToast.show(this._messageBuffer.join("\n"));
					this._messageBuffer = [];
					this._messageTimer = null;
				});
			}
		}
	});

});