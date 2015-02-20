sap.ui.controller("sap.m.sample.DialogMessage.C", {

	onMessageDialogPress: function (oEvent) {
		var dialog = new sap.m.Dialog({
			title: 'Default Message',
			type: 'Message',
				content: new sap.m.Text({
					text: 'Build enterprise-ready web applications, responsive to all devices and running on the browser of your choice. That´s OpenUI5.'
				}),
			beginButton: new sap.m.Button({
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
		var dialog = new sap.m.Dialog({
			title: 'Error',
			type: 'Message',
			state: 'Error',
			content: new sap.m.Text({
				text: 'The only error you can make is not even trying.'
			}),
			beginButton: new sap.m.Button({
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
		var dialog = new sap.m.Dialog({
			title: 'Warning',
			type: 'Message',
			state: 'Warning',
			content: new sap.m.Text({
				text: 'Ruling the world is a time-consuming task. You will not have a lot of spare time.'
			}),
			beginButton: new sap.m.Button({
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
		var dialog = new sap.m.Dialog({
			title: 'Success',
			type: 'Message',
			state: 'Success',
			content: new sap.m.Text({
				text: 'One of the keys to success is creating realistic goals that can be achieved in a reasonable amount of time.'
			}),
			beginButton: new sap.m.Button({
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
