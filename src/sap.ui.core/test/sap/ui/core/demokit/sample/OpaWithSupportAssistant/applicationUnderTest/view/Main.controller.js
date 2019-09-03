sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/ui/core/mvc/Controller'
], function (Button, Dialog, Text, Controller) {
	'use strict';

	var MainController = Controller.extend('appUnderTest.view.Main', {
		onFirstDialogPress: function () {
			if (this.dialogWithErrors) {
				this.dialogWithErrors.open();
			} else {
				var dialog = new Dialog({
					id: 'dialogWithRuleErrors',
					endButton: new Button({
						id: 'dialogWithRuleErrorsCloseButton',
						text: 'Close',
						press: function () {
							dialog.close();
						}
					}),
					content: [
						new Text({text: 'Hello'}),
						new Button({icon: 'sap-icon://action'})
					]
				});

				this.dialogWithErrors = dialog;
				this.dialogWithErrors.open();
			}
		},
		onSecondDialogPress: function () {
			if (this.dialogWithoutErrors) {
				this.dialogWithoutErrors.open();
			} else {
				var dialogText = new Text({text: 'Hello'});
				var dialog = new Dialog({
					id: 'dialogWithNoRuleErrors',
					endButton: new Button({
						id: 'dialogWithNoRuleErrorsCloseButton',
						text: 'Close',
						press: function () {
							dialog.close();
						}
					}),
					content: [
						dialogText,
						new Button({icon: 'sap-icon://action', tooltip: 'Action'})
					],
					ariaLabelledBy: dialogText.getId()
				});

				this.dialogWithoutErrors = dialog;
				this.dialogWithoutErrors.open();
			}
		}
	});

	return MainController;
});