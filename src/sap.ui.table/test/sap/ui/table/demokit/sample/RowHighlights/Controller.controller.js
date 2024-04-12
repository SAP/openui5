sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/RowSettings",
	"sap/ui/thirdparty/jquery"
], function(Log, Controller, JSONModel, RowSettings, jQuery) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.RowHighlights.Controller", {

		onInit: function() {
			// set explored app's demo model on this sample
			const oJSONModel = this.initSampleDataModel();
			this.getView().setModel(oJSONModel);
		},

		initSampleDataModel: function() {
			const oModel = new JSONModel();

			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"), {
				dataType: "json",
				success: function(oData) {
					for (let i = 0; i < oData.ProductCollection.length; i++) {
						const oProduct = oData.ProductCollection[i];

						if (i === 0) {
							oProduct.Status = "Success";
						} else if (i === 1) {
							oProduct.Status = "Warning";
						} else if (i === 2) {
							oProduct.Status = "Error";
						} else if (i === 3) {
							oProduct.Status = "Information";
						} else if (i === 4) {
							oProduct.Status = "None";
						} else if (oProduct.Price < 300) {
							oProduct.Status = "Success";
							oProduct.StatusText = "Custom success highlight text";
						} else if (oProduct.Price < 600) {
							oProduct.Status = "Warning";
							oProduct.StatusText = "Custom warning highlight text";
						} else if (oProduct.Price < 900) {
							oProduct.Status = "Error";
							oProduct.StatusText = "Custom error highlight text";
						} else if (oProduct.Price < 1200) {
							oProduct.Status = "Information";
							oProduct.StatusText = "Custom information highlight text";
						} else if (oProduct.Price < 1500) {
							oProduct.Status = "Indication01";
							oProduct.StatusText = "Custom indication highlight text";
						} else {
							oProduct.Status = "None";
						}
					}
					oModel.setData(oData);
				},
				error: function() {
					Log.error("failed to load json");
				}
			});

			return oModel;
		},

		onHighlightToggle: function(oEvent) {
			const oTable = this.byId("table");
			const oToggleButton = oEvent.getSource();

			if (oToggleButton.getPressed()) {
				oTable.setRowSettingsTemplate(new RowSettings({
					highlight: "{Status}"
				}));
			} else {
				oTable.setRowSettingsTemplate(null);
			}
		},

		onAlternateToggle: function(oEvent) {
			this.byId("table").setAlternateRowColors(oEvent.getParameter("pressed"));
		},

		onSelectionModeChange: function(oEvent) {
			const oTable = this.byId("table");
			const sKey = oEvent.getParameter("selectedItem").getKey();

			oTable.setSelectionMode(sKey);
		}
	});
});