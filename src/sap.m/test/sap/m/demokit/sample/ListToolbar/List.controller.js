sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageToast, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListToolbar.List", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		handleInfobarPress : function (evt) {
			MessageToast.show("info toolbar pressed");
		},

		handleButtonPress : function (evt) {
			MessageToast.show("header toolbar button pressed");
		},

		onSelectionFinish: function(oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var oList = this.byId("productList");
			var aSticky = aSelectedItems.map(function(oItem) {
				return oItem.getKey();
			});

			oList.setSticky(aSticky);
		},

		onToggleInfoToolbar: function(oEvent) {
			var oList = this.byId("productList");
			oList.getInfoToolbar().setVisible(!oEvent.getParameter("pressed"));
		}
	});


	return ListController;

});