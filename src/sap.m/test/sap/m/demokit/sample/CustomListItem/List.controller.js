sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Dialog',
	'sap/m/Image',
	'sap/m/Button'
],
	function(Controller, JSONModel, Dialog, Image, Button) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.CustomListItem.List", {

		onInit: function(oEvent) {

			// create and set JSON Model
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(this.oModel);
		},

		onExit : function() {
			// destroy the model
			this.oModel.destroy();
		},

		handlePress: function (evt) {
			var sSrc = evt.getSource().getTarget();
			var oDialog = new Dialog({
				content: new Image({
					src: sSrc
				}),
				beginButton: new Button({
					text: 'Close',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});
			oDialog.open();
		}

	});



	return ListController;

});