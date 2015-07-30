sap.ui.define([
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/MessageToast',
		'sap/m/Text',
		'sap/m/TextArea',
		'sap/ui/core/mvc/Controller',
		'sap/ui/layout/HorizontalLayout',
		'sap/ui/layout/VerticalLayout'
	], function(Button, Dialog, MessageToast, Text, TextArea, Controller, HorizontalLayout, VerticalLayout) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.DialogConfirm.C", {

		onApproveDialog: function () {
			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new Text({ text: 'Are you sure you want to submit your shopping cart?' }),
				beginButton: new Button({
					text: 'Submit',
					press: function () {
						MessageToast.show('Submit pressed!');
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
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

		onRejectDialog: function () {
			var dialog = new Dialog({
				title: 'Reject',
				type: 'Message',
				content: [
					new Text({ text: 'Are you sure you want to reject your shopping cart?' }),
					new TextArea('rejectDialogTextarea', {
						width: '100%',
						placeholder: 'Add note (optional)'
					})
				],
				beginButton: new Button({
					text: 'Reject',
					press: function () {
						var sText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
						MessageToast.show('Note is: ' + sText);
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
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

		onSubmitDialog: function () {
			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
					new Text({ text: 'Are you sure you want to submit your shopping cart?' }),
					new TextArea('submitDialogTextarea', {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();

							parent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: '100%',
						placeholder: 'Add note (required)'
					})
				],
				beginButton: new Button({
					text: 'Submit',
					enabled: false,
					press: function () {
						var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						MessageToast.show('Note is: ' + sText);
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
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

		onConfirmDialog: function () {
			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
					new HorizontalLayout({
						content: [
							new VerticalLayout({
								width: '120px',
								content: [
									new Text({ text: 'Type: ' }),
									new Text({ text: 'Delivery:' }),
									new Text({ text: 'Items count: ' })
								]
							}),
							new VerticalLayout({
								content: [
									new Text({ text: 'Shopping Cart' }),
									new Text({ text: 'Jun 26, 2013' }),
									new Text({ text: '2' })
								]
							})
						]
					}),
					new TextArea('confirmDialogTextarea', {
						width: '100%',
						placeholder: 'Add note (optional)'
					})
				],
				beginButton: new Button({
					text: 'Submit',
					press: function () {
						var sText = sap.ui.getCore().byId('confirmDialogTextarea').getValue();
						MessageToast.show('Note is: ' + sText);
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
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
