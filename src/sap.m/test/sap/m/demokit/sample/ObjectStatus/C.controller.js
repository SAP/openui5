sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/m/VBox',
		'sap/ui/core/mvc/Controller'
	], function(Button, Dialog, Text, VBox, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectStatus.C", {

		handleStatusPressed: function() {
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
					press: function() {
						oDialog.close();
					}
				})
			});
			oDialog.open();
		}
	});

});
