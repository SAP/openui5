sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableNavigated.Table", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			var oSettingsModel = new JSONModel({ navigatedItem: ""});
			this.getView().setModel(oModel);
			this.getView().setModel(oSettingsModel, 'settings');
		},

		onPress: function (oEvent) {
			var oItem = oEvent.getSource();
			var oBindingContext = oItem.getBindingContext();
			var oModel = this.getView().getModel();
			var oSettingsModel = this.getView().getModel('settings');
			oSettingsModel.setProperty("/navigatedItem", oModel.getProperty("ProductId", oBindingContext));
		},

		isNavigated: function(sNavigatedItemId, sItemId) {
			return sNavigatedItemId === sItemId;
		}
	});


	return TableController;

});