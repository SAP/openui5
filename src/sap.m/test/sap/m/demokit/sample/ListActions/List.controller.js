sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListActions.List", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onItemActionPress: function(oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oAction = oEvent.getParameter("action");
			const sProductName = oItem.getBindingContext().getProperty("Name");
			const sAction = oAction.getText() || oAction.getType();
			MessageToast.show(`${sAction} action is pressed for the Product ${sProductName}`);
		},

		onSliderChange: function(oEvent) {
			const oSlider = oEvent.getSource();
			const fValue = oSlider.getValue();
			this.byId("list").setItemActionCount(fValue);
		}
	});

	return ListController;

});