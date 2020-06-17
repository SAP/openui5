sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea"
], function (Controller, Core, HorizontalLayout, VerticalLayout, Dialog, DialogType, Button, ButtonType, Label, MessageToast, Text, TextArea) {
	"use strict";

	return Controller.extend("sap.m.sample.DialogConfirm.C", {

		onApproveDialogPress: function () {
			if (!this.oApproveDialog) {
				this.oApproveDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: new Text({ text: "Do you want to submit this order?" }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						press: function () {
							MessageToast.show("Submit pressed!");
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();
		},

		onRejectDialogPress: function () {
			if (!this.oRejectDialog) {
				this.oRejectDialog = new Dialog({
					title: "Reject",
					type: DialogType.Message,
					content: [
						new Label({
							text: "Do you want to reject this order?",
							labelFor: "rejectionNote"
						}),
						new TextArea("rejectionNote", {
							width: "100%",
							placeholder: "Add note (optional)"
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Reject",
						press: function () {
							var sText = Core.byId("rejectionNote").getValue();
							MessageToast.show("Note is: " + sText);
							this.oRejectDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oRejectDialog.close();
						}.bind(this)
					})
				});
			}

			this.oRejectDialog.open();
		},

		onSubmitDialogPress: function () {
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: [
						new Label({
							text: "Do you want to submit this order?",
							labelFor: "submissionNote"
						}),
						new TextArea("submissionNote", {
							width: "100%",
							placeholder: "Add note (required)",
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								this.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
							}.bind(this)
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						enabled: false,
						press: function () {
							var sText = Core.byId("submissionNote").getValue();
							MessageToast.show("Note is: " + sText);
							this.oSubmitDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oSubmitDialog.close();
						}.bind(this)
					})
				});
			}

			this.oSubmitDialog.open();
		},

		onConfirmDialogPress: function () {
			if (!this.oConfirmDialog) {
				this.oConfirmDialog = new Dialog({
					type: DialogType.Message,
					title: "Confirm",
					content: [
						new HorizontalLayout({
							content: [
								new VerticalLayout({
									width: "120px",
									content: [
										new Text({ text: "Type: " }),
										new Text({ text: "Delivery: " }),
										new Text({ text: "Items count: " })
									]
								}),
								new VerticalLayout({
									content: [
										new Text({ text: "Shopping Cart" }),
										new Text({ text: "Jun 26, 2013" }),
										new Text({ text: "2" })
									]
								})
							]
						}),
						new TextArea("confirmationNote", {
							width: "100%",
							placeholder: "Add note (optional)"
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Submit",
						press: function () {
							var sText = Core.byId("confirmationNote").getValue();
							MessageToast.show("Note is: " + sText);
							this.oConfirmDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oConfirmDialog.close();
						}.bind(this)
					})
				});
			}

			this.oConfirmDialog.open();
		}

	});
});