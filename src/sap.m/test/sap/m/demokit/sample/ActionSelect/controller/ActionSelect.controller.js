sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast"
	], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.ActionSelect.controller.ActionSelect", {

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			oModel.attachRequestCompleted(function() {
				var oData = oModel.getData();
				oData.ProductCollection.length = 10;
				oModel.setData(oData);
			});
		},

		onButtonPress: function (oEvt) {
			MessageToast.show("Executed " + oEvt.getSource().getText());
			this.byId("select").close();
		}
	});
});