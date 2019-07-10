sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiInputCustomFiltering.controller.MultiInputCustomFiltering", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);

			this.byId("multiInput1").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'starts with' filter
				var sPattern = "^" + sTerm;
				return oItem.getText().match(new RegExp(sPattern, "i"));
			});

			this.byId("multiInput2").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
			});
		}
	});
});