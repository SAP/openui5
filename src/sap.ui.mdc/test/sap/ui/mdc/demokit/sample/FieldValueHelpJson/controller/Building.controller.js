sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.ui.mdc.demokit.sample.FieldValueHelpJson.controller.Building", {
		onInit: function () {
			this.getView().bindElement({ path: "/buildings/60", model: "facilities" });
		},
		onBuildingSelected: function (oEvent) {
			const selID = oEvent.getSource().getValue();
			//var oModel = oEvent.getSource().getModel();
			const oModel = this.getView().getModel("facilities");
			const aBuildings = oModel.getObject("/buildings");
			const selIndex = aBuildings.findIndex((building) => building.id === selID);
			this.getView().bindElement({ path: "/buildings/" + selIndex, model: "facilities" });
		},
		onGetCountryName: function (countryId) {
			return countryId ? this.getView().getModel("facilities").oData.countries.find((c) => c.id == countryId).name : '';
		},
		onGetLocationName: function (locationId) {
			return locationId ? this.getView().getModel("facilities").oData.locations.find((c) => c.id == locationId).name : '';
		},
		onGetAddress: function (buildingId) {
			const street = buildingId ? this.getView().getModel("facilities").oData.buildings.find((c) => c.id == buildingId).street : '';
			const zipCode = buildingId ? this.getView().getModel("facilities").oData.buildings.find((c) => c.id == buildingId).zip : '';
			const city = buildingId ? this.getView().getModel("facilities").oData.buildings.find((c) => c.id == buildingId).city : '';
			return street + ', ' + zipCode + ' ' + city;
		}

	});

});
