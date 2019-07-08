sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ComboBoxValidation.controller.ComboBoxValidation", {

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/countriesExtendedCollection.json");
			this.getView().setModel(oModel);
		},

		handleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState("Error");
				oValidatedComboBox.setValueStateText("Please enter a valid country!");
			} else {
				oValidatedComboBox.setValueState("None");
			}
		}
	});
});