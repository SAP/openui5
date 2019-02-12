sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.MultiComboBoxCustomFiltering.Page", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);

			this.getView().byId("multiCombo1").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				return new RegExp("^" + sTerm, "i").test(oItem.getText());
			});

			this.getView().byId("multiCombo2").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				var sItemText = oItem.getText().toLowerCase(),
					sSearchTerm = sTerm.toLowerCase();

				return sItemText.indexOf(sSearchTerm) > -1;
			});
		}
	});


	return PageController;

});