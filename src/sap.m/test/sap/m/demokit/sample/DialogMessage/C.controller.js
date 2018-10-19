sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Text',
		'sap/ui/core/mvc/Controller'
	], function(Button, Dialog, Text, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.DialogMessage.C", {

		onMessageDialogPress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Default Message',
				type: 'Message',
					content: new Text({
						text: 'Build enterprise-ready web applications, responsive to all devices and running on the browser of your choice. That´s OpenUI5.'
					}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onMessageErrorDialogPress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new Text({
					text: 'The only error you can make is not even trying.'
				}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onMessageWarningDialogPress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Warning',
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: 'Ruling the world is a time-consuming task. You will not have a lot of spare time.'
				}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onMessageSuccessDialogPress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Success',
				type: 'Message',
				state: 'Success',
				content: new Text({
					text: 'One of the keys to success is creating realistic goals that can be achieved in a reasonable amount of time.'
				}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onMessageHighlightDialogPress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Highlight',
				type: 'Message',
				state: 'Highlight',
				content: new Text({
					text: 'A dialog that represents highlighted information.'
				}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		}
	});


	return CController;

});
