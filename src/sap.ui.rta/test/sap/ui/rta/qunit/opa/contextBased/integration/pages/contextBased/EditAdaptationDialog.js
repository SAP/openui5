sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function(
	Opa5,
	Press,
	EnterText
) {
	"use strict";
	Opa5.createPageObjects({
		onTheEditAdaptationDialogPage: {
			actions: {
				iEnterAdaptationTitle: function(sAdaptationTitle) {
					return this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--editcontextdialog-title-input",
						searchOpenDialogs: true,
						actions: new EnterText({
							clearTextFirst: true,
							idSuffix: "inner",
							text: sAdaptationTitle
						})
					});
				},
				iEnterAdaptationDescription: function(sAdaptationDescription) {
					return this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--editcontextdialog-description-input",
						searchOpenDialogs: true,
						actions: new EnterText({
							clearTextFirst: true,
							idSuffix: "inner",
							text: sAdaptationDescription
						})
					});
				},
				iClickOnEdit: function() {
					this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--editcontextdialog-save",
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "BDI-content"
						})
					});
				}
			},
			assertions: {
				iShouldSeeAdaptationTitle: function(sAdaptationTitle) {
					return this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--editcontextdialog-title-input",
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValue(), sAdaptationTitle, "I see adaptation title: " + sAdaptationTitle);
						}
					});
				},
				iShouldSeeAdaptationDescription: function(sAdaptationDescription) {
					return this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--editcontextdialog-description-input",
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValue(), sAdaptationDescription, "I see adaptation title: " + sAdaptationDescription);
						}
					});
				},
				iShouldSeeSelectedRoles: function(bIsVisible) {
					return this.waitFor({
						id: "contextSharing---ContextVisibility--restrictedToolbar",
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.equal(oControl.getVisible(), bIsVisible, "I see correct role radio selection button selected");
						}
					});
				},
				iShouldSeeEditAdaptationDialog: function() {
					return this.waitFor({
						id: "sap.ui.rta.contextBased---ManageContexts--editcontextdialog",
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getTitle(), "Edit Adaptation", "I see edit adaptation dialog");
						}
					});
				}
			}
		}
	});
});

