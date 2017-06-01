sap.ui.define(['sap/ui/core/mvc/Controller'],
	function (Controller) {
		"use strict";

		var MainController = Controller.extend("appUnderTest.view.Main", {
			onFirstDialogPress: function () {
				if (this.dialogWithErrors) {
					this.dialogWithErrors.open();
				} else {
					var dialog = new sap.m.Dialog({
						id: 'dialogWithRuleErrors',
						endButton: new sap.m.Button({
							id: 'dialogWithRuleErrorsCloseButton',
							text: 'Close',
							press: function () {
								dialog.close();
							}
						}),
						content: [
							new sap.m.Text({text: 'Hello'})
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
					var dialogText = new sap.m.Text({text: 'Hello'});
					var dialog = new sap.m.Dialog({
						id: 'dialogWithNoRuleErrors',
						endButton: new sap.m.Button({
							id: 'dialogWithNoRuleErrorsCloseButton',
							text: 'Close',
							press: function () {
								dialog.close();
							}
						}),
						content: [
							dialogText
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
