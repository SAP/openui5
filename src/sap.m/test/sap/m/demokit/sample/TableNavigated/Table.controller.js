sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableNavigated.Table", {

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			var oGroupingModel = new JSONModel({ hasGrouping: false});
			this.getView().setModel(oModel);
			this.getView().setModel(oGroupingModel, 'Grouping');
		},

		onPress: function (oEvent) {
			var oItem = oEvent.getSource();

			if (oItem.getNavigated()) {
				oItem.setNavigated(false);
			} else {
				oItem.setNavigated(true);
			}
		}
	});


	return TableController;

});