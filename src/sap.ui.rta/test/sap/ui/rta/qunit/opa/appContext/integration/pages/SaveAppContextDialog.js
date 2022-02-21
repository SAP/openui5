sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (
	Opa5,
	Press,
	EnterText
) {
	"use strict";
	Opa5.createPageObjects({
		onTheAppContextSaveDialogPage: {
			actions: {
				iEnterAppContextTitle: function (sAppContextTitle) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--savecontextdialog-title-input",
						searchOpenDialogs: true,
						actions: new EnterText({
							clearTextFirst: true,
							idSuffix: "inner",
							text: sAppContextTitle
						})
					});
				},
				iEnterAppContextDescription: function (sAppContextDescription) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--savecontextdialog-description-input",
						searchOpenDialogs: true,
						actions: new EnterText({
							clearTextFirst: true,
							idSuffix: "inner",
							text: sAppContextDescription
						})
					});
				},
				iClickOnSave: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--savecontextdialog-save",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				}
			},
			assertions: {
				iShouldSeeAppContextTitle: function (sAppContextTitle) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--savecontextdialog-title-input",
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValue(), sAppContextTitle, "I see entered app context title: " + sAppContextTitle);
						}
					});
				},
				iShouldSeeAppContextDescription: function (sAppContextDescription) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--savecontextdialog-description-input",
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValue(), sAppContextDescription, "I see entered app context description: " + sAppContextDescription);
						}
					});
				},
				iShouldSeeSaveAppContextDialog: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--savecontextdialog",
						searchOpenDialogs: true,
						success: function () {
							Opa5.assert.ok(true, "I see save app context dialog");
						}
					});
				}
			}
		}
	});
});

