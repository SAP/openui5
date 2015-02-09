sap.ui.controller("sap.m.sample.DialogConfirm.C", {

	/**
	 * Open a dialog ot the passed type
	 * @param {string} sType - The type of dialog window to be opened
	 */
	openDialog: function (sType) {
		if (!this[sType]) {
			this[sType] = sap.ui.xmlfragment(
				'sap.m.sample.DialogConfirm.' + sType + 'Dialog',
				this // associate controller with the fragment
			);
			this.getView().addDependent(this[sType]);
		}
		this[sType].open();
	},

	/**
	 * Opens the approve dialog
	 */
	onApproveDialog: function () {
		this.openDialog('Approve');
	},

	/**
	 * Opens the reject dialog
	 */
	onRejectDialog: function () {
		this.openDialog('Reject');
	},

	/**
	 * Opens the submit dialog
	 */
	onSubmitDialog: function () {
		this.openDialog('Submit');
	},

	/**
	 * Opens the confirm dialog
	 */
	onConfirmDialog: function () {
		this.openDialog('Confirm');
	},

	/**
	 * Fired when pressed "Submit" on approve dialog
	 * @param {sap.ui.base.Event} oEvent - the passed event arguments
	 */
	onApproveSubmitPressed: function (oEvent) {
		var sType = oEvent.getSource().data('dialogType');

		sap.m.MessageToast.show('Submit pressed!');
		this[sType].close();
	},

	/**
	 * Event fired when pressed "Reject" on reject dialog
	 * @param {sap.ui.base.Event} oEvent - the passed event arguments
	 */
	onRejectPressed: function (oEvent) {
		var sType = oEvent.getSource().data('dialogType');
		var sText = sap.ui.getCore().byId('rejectDialogTextarea').getValue();

		sap.m.MessageToast.show('Note is: ' + sText);
		this[sType].close();
	},

	/**
	 * Event fired when pressed "Submit" on submit dialog
	 * @param {sap.ui.base.Event} oEvent - the passed event arguments
	 */
	onSubmitPressed: function (oEvent) {
		var sType = oEvent.getSource().data('dialogType');
		var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();

		sap.m.MessageToast.show('Note is: ' + sText);
		this[sType].close();
	},

	/**
	 * Event fired when pressed "Confirm" on confirm dialog
	 * @param {sap.ui.base.Event} oEvent - the passed event arguments
	 */
	onConfirmPressed: function (oEvent) {
		var sType = oEvent.getSource().data('dialogType');
		var sText = sap.ui.getCore().byId('confirmDialogTextarea').getValue();

		sap.m.MessageToast.show('Note is: ' + sText);
		this[sType].close();
	},

	/**
	 * Triggered when writing in the textarea of the Submit dialog with mandatory description
	 * @param {sap.ui.base.Event} oEvent - the passed event arguments
	 */
	onSubmitNoteAdded: function (oEvent) {
		var sText = oEvent.getParameter('value');
		parent = oEvent.getSource().getParent();

		parent.getBeginButton().setEnabled(sText.length > 0);
	},

	/**
	 * Event fired when pressed "Cancel"
	 * @param {sap.ui.base.Event} oEvent - the event arguments passed
	 */
	onDialogCloseButton: function (oEvent) {
		var sType = oEvent.getSource().data('dialogType');

		sap.m.MessageToast.show('Close button pressed!');
		this[sType].close();
	}
});
