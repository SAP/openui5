sap.ui.define([
		'jquery.sap.global',
		'sap/m/Button',
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Button, MessageToast, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.ActionSelect.C", {

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
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


	return CController;

});
