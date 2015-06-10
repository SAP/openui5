sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Basic.Controller", {
		
		onInit : function () {
			// set explored app's demo model on this sample
			jQuery.ajax(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"), {
				dataType: "json",
				success: function (oData) {
					
					// Enrich Data
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i=0; i<oData.ProductCollection.length; i++) {
						var oProduct = oData.ProductCollection[i];
						if (oProduct.SupplierName && jQuery.inArray(oProduct.SupplierName, aTemp1) < 0) {
							aTemp1.push(oProduct.SupplierName);
							aSuppliersData.push({Name: oProduct.SupplierName});
						}
						if (oProduct.Category && jQuery.inArray(oProduct.Category, aTemp2) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.Category});
						}
						oProduct.DeliveryDate = new Date();
					}
					
					oData.Suppliers = aSuppliersData;
					oData.Categories = aCategoryData;
					
					// Set the model
					var oModel = new JSONModel();
					oModel.setData(oData);
					this.getView().setModel(oModel);
				}.bind(this),
				error: function () {
					jQuery.sap.log.error("failed to load json");
				}
			});
		},
		
		formatStatus : function(sStatus) {
			return sStatus == "Available" ? "Success" : "Error";
		},
		
		formatStatusIcon : function(sStatus) {
			return sStatus == "Available" ? "sap-icon://message-success" : "sap-icon://error";
		},
		
		formatWeight : function(iWeight) {
			return iWeight > 1000;
		},
		
		handleDetailsPress : function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		}
		
	});

});
