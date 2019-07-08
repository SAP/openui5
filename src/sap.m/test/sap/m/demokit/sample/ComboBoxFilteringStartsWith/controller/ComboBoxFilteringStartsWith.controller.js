sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ComboBoxFilteringStartsWith.controller.ComboBoxFilteringStartsWith", {

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/countriesExtendedCollection.json");
			this.getView().setModel(oModel);

			this.getView().byId("combobox1").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				return oItem.getText().match(new RegExp("^" + sTerm, "i")) || oItem.getKey().match(new RegExp("^" + sTerm, "i"));
			});
		}
	});
});