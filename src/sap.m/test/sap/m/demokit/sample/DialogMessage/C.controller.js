sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ValueState",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text"
], function (Controller, ValueState, Dialog, DialogType, Button, ButtonType, Text) {
	"use strict";

	return Controller.extend("sap.m.sample.DialogMessage.C", {

		onDefaultMessageDialogPress: function () {
			if (!this.oDefaultMessageDialog) {
				this.oDefaultMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Default Message",
					content: new Text({ text: "Build enterprise-ready web applications, responsive to all devices and running on the browser of your choice. That's OpenUI5." }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oDefaultMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oDefaultMessageDialog.open();
		},

		onSuccessMessageDialogPress: function () {
			if (!this.oSuccessMessageDialog) {
				this.oSuccessMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Success",
					state: ValueState.Success,
					content: new Text({ text: "One of the keys to success is creating realistic goals that can be achieved in a reasonable amount of time." }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oSuccessMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oSuccessMessageDialog.open();
		},

		onWarningMessageDialogPress: function () {
			if (!this.oWarningMessageDialog) {
				this.oWarningMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Warning",
					state: ValueState.Warning,
					content: new Text({ text: "Ruling the world is a time-consuming task. You will not have a lot of spare time." }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oWarningMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oWarningMessageDialog.open();
		},

		onErrorMessageDialogPress: function () {
			if (!this.oErrorMessageDialog) {
				this.oErrorMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Error",
					state: ValueState.Error,
					content: new Text({ text: "The only error you can make is to not even try." }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oErrorMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oErrorMessageDialog.open();
		},

		onMessageInformationDialogPress: function () {
			if (!this.oInfoMessageDialog) {
				this.oInfoMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Information",
					state: ValueState.Information,
					content: new Text({ text: "Dialog with value state Information." }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oInfoMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oInfoMessageDialog.open();
		}

	});
});