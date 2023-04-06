sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v4/ODataModel"
], function (Controller, ODataModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.InputModelUpdate.C", {

		// Handler for initialization of the view
		onInit: function () {
			// URL of the OData service
			var sServiceUrl = "https://odatav4server.internal.cfapps.sap.hana.ondemand.com/music/";

			// Get a reference to the input field control
			var oView = this.getView();
			var oInput = oView.byId("inputArtistName");

			// Create a new OData model instance
			this.oModel = new ODataModel({
				serviceUrl: sServiceUrl,
				synchronizationMode: "None"
			});

			// Create a new JSON model instance for storing the initial and current values of the input field
			var oHelpModel = new sap.ui.model.json.JSONModel({
				"initialValue": "Donkey Infra Red",
				"currentValue": "Donkey Infra Red"
			});

			// Attach a handler to the dataReceived event of the OData model, which sets the value of the input field
			// to the name of the artist with the ID "00505691-8175-1ed8-9dbe-6512e329326c" if the current value of the
			// input field matches the initial value.
			this.oModel.attachDataReceived(function () {
				if (oHelpModel.getProperty("/initialValue") === oHelpModel.getProperty("/currentValue")) {
					oInput.bindProperty("value", "/Artists(00505691-8175-1ed8-9dbe-6512e329326c)/name");
				}
			});

			// Set the JSON model instance as the model for the view with the name "initialData"
			this.getView().setModel(oHelpModel, "initialData");

			// Set the OData model instance as the default model for the view
			this.getView().setModel(this.oModel);
		},

		// Handler for the liveChange event of the input field
		handleLiveChange: function (oEvent) {
			// Update the current value of the input field in the JSON model instance
			this.getView().getModel("initialData").setProperty("/currentValue", oEvent.getSource().getValue());
		},

		// Helper function for triggering a fetch of data from the OData service
		fnRebind: function () {
			setTimeout(function () {
				// Bind a random property of the input field to trigger a fetch of data from the OData service
				this.getView().byId("inputArtistName").bindProperty("placeholder", "/Artists(00505691-8175-1ed8-9dbe-6512e329326c)/name");
			}.bind(this), 3000);
		}

	});

	return CController;
});
