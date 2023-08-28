sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/sample/InputModelUpdate/localService/mockserver",
	"sap/ui/model/json/JSONModel"
], function(Controller, ODataModel, mockserver, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.InputModelUpdate.C", {

		onInit : function () {
			var sODataServiceUrl = "/here/goes/your/odata/service/url/";

			// Create a new JSON model instance for storing the initial and current values of the input field
			var oHelpModel = new JSONModel({
				"initialValue": "Martin",
				"currentValue": "Martin"
			});

			// Set the JSON model instance as the model for the view with the name "initialData"
			this.getView().setModel(oHelpModel, "initialData");

			// init our mock server
			mockserver.init(sODataServiceUrl);

			// Northwind service
			this.getView().setModel(
				new ODataModel(sODataServiceUrl, {
					defaultBindingMode : "TwoWay"
				})
			);
		},

		fnRebind: function () {
			var oView = this.getView();

			oView.bindElement({
				path: "/Employees(1)",
				events: {
					// In oData v4 you can use attachDataReceived API of the v4 Model
					dataReceived: function (event) {
						var oHelpModel = oView.getModel("initialData");
						var oInput = oView.byId("inputArtistName");

						// Attach a handler to the dataReceived event of the OData model, which sets the value of the input field
						// to the name of the value property if the current value of the
						// input field matches the initial value.
						if (oHelpModel.getProperty("/initialValue") === oHelpModel.getProperty("/currentValue")) {
							oInput.bindProperty("value", "FirstName");
						}
					}
				}
			});
		},

		handleLiveChange: function (oEvent) {
			// Update the current value of the input field in the JSON model instance
			this.getView().getModel("initialData").setProperty("/currentValue", oEvent.getSource().getValue());
		}
	});
});
