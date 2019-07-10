sap.ui.define([
		'sap/m/Button',
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Button, MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ActionSelect.controller.ActionSelect", {

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);

			oModel.attachRequestCompleted(function() {
				var oData = oModel.getData();
				oData.ProductCollection.length = 10;
				oModel.setData(oData);
			});

			// add buttons with javaScript (yet not possible with XML views)
			var oHeaderSelect = this.byId("select");
			var fnOnPress = function (oEvt) {
				MessageToast.show("Executed " + oEvt.getSource().getText());
				oHeaderSelect.close();
			};
			oHeaderSelect.addButton(
				new Button({
					text: "Action 1",
					press: fnOnPress
				})
			);
			oHeaderSelect.addButton(
				new Button({
					text: "Action 2",
					press: fnOnPress
				})
			);
		}
	});
});