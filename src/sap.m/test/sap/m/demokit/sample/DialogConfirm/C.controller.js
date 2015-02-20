sap.ui.controller("sap.m.sample.DialogConfirm.C", {

	onApproveDialog: function () {
		var dialog = new sap.m.Dialog({
			title: 'Confirm',
			type: 'Message',
			content: new sap.m.Text({ text: 'Are you sure you want to submit your shopping cart?' }),
			beginButton: new sap.m.Button({
				text: 'Submit',
				press: function () {
					sap.m.MessageToast.show('Submit pressed!');
					dialog.close();
				}
			}),
			endButton: new sap.m.Button({
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
		var dialog = new sap.m.Dialog({
			title: 'Reject',
			type: 'Message',
			content: [
				new sap.m.Text({ text: 'Are you sure you want to reject your shopping cart?' }),
				new sap.m.TextArea('rejectDialogTextarea', {
					width: '100%',
					placeholder: 'Add note (optional)'
				})
			],
			beginButton: new sap.m.Button({
				text: 'Reject',
				press: function () {
					var sText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();
					sap.m.MessageToast.show('Note is: ' + sText);
					dialog.close();
				}
			}),
			endButton: new sap.m.Button({
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
		var dialog = new sap.m.Dialog({
			title: 'Confirm',
			type: 'Message',
			content: [
				new sap.m.Text({ text: 'Are you sure you want to submit your shopping cart?' }),
				new sap.m.TextArea('submitDialogTextarea', {
					liveChange: function(oEvent) {
						var sText = oEvent.getParameter('value');
						parent = oEvent.getSource().getParent();

						parent.getBeginButton().setEnabled(sText.length > 0);
					},
					width: '100%',
					placeholder: 'Add note (required)'
				})
			],
			beginButton: new sap.m.Button({
				text: 'Submit',
				enabled: false,
				press: function () {
					var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
					sap.m.MessageToast.show('Note is: ' + sText);
					dialog.close();
				}
			}),
			endButton: new sap.m.Button({
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
		var dialog = new sap.m.Dialog({
			title: 'Confirm',
			type: 'Message',
			content: [
				new sap.ui.layout.HorizontalLayout({
					content: [
						new sap.ui.layout.VerticalLayout({
							width: '120px',
							content: [
								new sap.m.Text({ text: 'Type: ' }),
								new sap.m.Text({ text: 'Delivery:' }),
								new sap.m.Text({ text: 'Items count: ' })
							]
						}),
						new sap.ui.layout.VerticalLayout({
							content: [
								new sap.m.Text({ text: 'Shopping Cart' }),
								new sap.m.Text({ text: 'Jun 26, 2013' }),
								new sap.m.Text({ text: '2' })
							]
						})
					]
				}),
				new sap.m.TextArea('confirmDialogTextarea', {
					width: '100%',
					placeholder: 'Add note (optional)'
				})
			],
			beginButton: new sap.m.Button({
				text: 'Submit',
				press: function () {
					var sText = sap.ui.getCore().byId('confirmDialogTextarea').getValue();
					sap.m.MessageToast.show('Note is: ' + sText);
					dialog.close();
				}
			}),
			endButton: new sap.m.Button({
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
