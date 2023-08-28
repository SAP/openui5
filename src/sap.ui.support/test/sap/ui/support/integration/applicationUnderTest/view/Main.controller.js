sap.ui.define(['sap/ui/core/mvc/Controller', "sap/m/Dialog", "sap/m/Button", "sap/m/Text", "sap/m/Input", "sap/m/Label"],
function(Controller, Dialog, Button, Text, Input, Label) {
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
						new Button({icon: 'sap-icon://action'}),
						new Input({id:"testInput2", placeholder:"Test input 2"}),
						new Label({labelFor:"testInput2", text:"label for input"})
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