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
		onTheAppContextEditDialogPage: {
			actions: {
				iEnterAppContextTitle: function (sAppContextTitle) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--editcontextdialog-title-input",
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
						id: "sap.ui.rta.appContexts---ManageContexts--editcontextdialog-description-input",
						searchOpenDialogs: true,
						actions: new EnterText({
							clearTextFirst: true,
							idSuffix: "inner",
							text: sAppContextDescription
						})
					});
				},
				iClickOnEdit: function () {
					this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--editcontextdialog-save",
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
						id: "sap.ui.rta.appContexts---ManageContexts--editcontextdialog-title-input",
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValue(), sAppContextTitle, "I see app context title: " + sAppContextTitle);
						}
					});
				},
				iShouldSeeAppContextDescription: function (sAppContextDescription) {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--editcontextdialog-description-input",
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValue(), sAppContextDescription, "I see app context title: " + sAppContextDescription);
						}
					});
				},
				iShouldSeeSelectedRoles: function (bIsVisible) {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--restrictedToolbar",
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.eual(oControl.getVisible(), bIsVisible, "I see correct role radio selection button selected");
						}
					});
				},
				iShouldSeeEditAppContextDialog: function () {
					return this.waitFor({
						id: "sap.ui.rta.appContexts---ManageContexts--editcontextdialog",
						searchOpenDialogs: true,
						success: function (vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getTitle(), "Edit App Context", "I see edit app context dialog");
						}
					});
				}
			}
		}
	});
});

