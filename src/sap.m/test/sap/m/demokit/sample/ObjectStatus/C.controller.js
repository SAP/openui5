sap.ui.define([
		'jquery.sap.global',
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/VBox',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, Button, Dialog, Text, VBox, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.ObjectStatus.C", {

		handleStatusPressed: function(oEvent) {
			var oDialog = new Dialog({
				title: "Error description",
				content: [
					new VBox({
						fitContainer: true,
						items: [
							new Text({
								text: "Product was damaged along transportation."
							})
						]
					})
				],
				buttons: new Button({
					text: "OK",
					press: function(oEvent) {
						oDialog.close();
					}
				})
			});
			oDialog.open();
		}
	});


	return CController;

});
