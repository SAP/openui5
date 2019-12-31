sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/ui/core/mvc/Controller",
	"sap/m/library"
], function(Button, Dialog, Text, Controller, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("sap.m.sample.DialogMessage.C", {

		onMessageDialogPress: function () {
			var oDialog = new Dialog({
				title: 'Default Message',
				type: 'Message',
				content: new Text({
					text: 'Build enterprise-ready web applications, responsive to all devices and running on the browser of your choice. That´s OpenUI5.'
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'OK',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		onMessageErrorDialogPress: function () {
			var oDialog = new Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new Text({
					text: 'The only error you can make is not even trying.'
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'OK',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		onMessageWarningDialogPress: function () {
			var oDialog = new Dialog({
				title: 'Warning',
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: 'Ruling the world is a time-consuming task. You will not have a lot of spare time.'
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'OK',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		onMessageSuccessDialogPress: function () {
			var oDialog = new Dialog({
				title: 'Success',
				type: 'Message',
				state: 'Success',
				content: new Text({
					text: 'One of the keys to success is creating realistic goals that can be achieved in a reasonable amount of time.'
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'OK',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		onMessageInformationDialogPress: function () {
			var oDialog = new Dialog({
				title: 'Information',
				type: 'Message',
				state: 'Information',
				content: new Text({
					text: 'Dialog with value state Information.'
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'OK',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		}

	});
});