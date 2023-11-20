sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/model/json/JSONModel'
	], function(Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ComboBoxValueState.controller.ComboBoxValueState", {

		onInit: function() {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/countriesExtendedCollection.json"));
			this.getView().setModel(oModel);
		},

		handleLoadItems: function(oControlEvent) {
			oControlEvent.getSource().getBinding("items").resume();
		},

		handleValueStateLinkPress: function(oEvent) {
			MessageToast.show("Link in value state pressed");
		}
	});
});