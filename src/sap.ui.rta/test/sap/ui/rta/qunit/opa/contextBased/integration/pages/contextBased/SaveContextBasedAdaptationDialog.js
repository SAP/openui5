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
		onTheAddAdaptationDialogPage: {
			actions: {
				iEnterContextBasedAdaptationTitle: function(sAdaptationTitle) {
					return this.waitFor({
						controlType: "sap.m.Input",
						labelFor: {
							text: "Title"
						},
						actions: new EnterText({
							clearTextFirst: true,
							idSuffix: "inner",
							text: sAdaptationTitle
						})
					});
				},
				iClickAndSelectPriorityForAdaptation: function(iZeroBasedPriority) {
					this.iClickOnPrioritySelection();
					this.iSelectContextBasedAdaptationPriority(iZeroBasedPriority);
				},
				iClickOnPrioritySelection: function() {
					return this.waitFor({
						controlType: "sap.m.Select",
						labelFor: {
							text: "Priority"
						},
						searchOpenDialogs: true,
						actions: new Press({
							idSuffix: "label"
						})
					});
				},
				iSelectContextBasedAdaptationPriority: function(iZeroBasedPriority) {
					return this.waitFor({
						controlType: "sap.ui.core.Item",
						bindingPath: {
							path: `/priority/${iZeroBasedPriority}`,
							propertyPath: "key",
							modelName: "dialogModel"
						},
						searchOpenDialogs: true,
						actions: new Press(),
						success: function(vControl) {
							Opa5.assert.ok(true, vControl, true);
						},
						errorMessage: "Did not find Select Item"
					});
				},
				iClickOnSave: function() {
					return this.waitFor({
						i18NText: {
							propertyName: "text",
							key: "APP_VARIANT_DIALOG_SAVE"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				},
				iClickOnCancel: function() {
					return this.waitFor({
						i18NText: {
							propertyName: "text",
							key: "SAVE_AS_APP_VARIANT_DIALOG_CANCEL"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				}
			},
			assertions: {
				iShouldSeeDialogTitle: function(sTitle) {
					this.waitFor({
						controlType: "sap.m.Title",
						properties: {
							text: sTitle
						},
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getText(), sTitle, `the correct dialog title is displayed: ${sTitle}`);
						}
					});
				},
				iShouldSeeContextBasedAdaptationTitle: function(sContextBasedTitle) {
					return this.waitFor({
						controlType: "sap.m.Input",
						labelFor: {
							text: "Title"
						},
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValue(), sContextBasedTitle, `I see entered adaptation title: ${sContextBasedTitle}`);
						}
					});
				},
				iShouldSeeContextBasedAdaptationTitleValueState: function(valueState, valueStateText) {
					return this.waitFor({
						controlType: "sap.m.Input",
						labelFor: {
							text: "Title"
						},
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getValueState(), valueState, `I see input value state ${valueState}`);
							Opa5.assert.strictEqual(oControl.getValueStateText(), valueStateText, `I see value state text ${valueStateText}`);
						}
					});
				},
				iShouldSeeSelectedContextBasedAdaptationPriority: function(sRoleText) {
					return this.waitFor({
						controlType: "sap.m.Select",
						labelFor: {
							text: "Priority"
						},
						searchOpenDialogs: true,
						success: function(vControl) {
							var oControl = vControl[0] || vControl;
							Opa5.assert.strictEqual(oControl.getSelectedItem().getText(), sRoleText, `I see entered adaptation title: ${sRoleText}`);
						}
					});
				},
				iShouldSeeContextSharingVisibilityContainer: function() {
					return this.waitFor({
						id: "contextSharingContainer",
						searchOpenDialogs: true,
						success: function() {
							Opa5.assert.ok(true, "I see context sharing container");
						}
					});
				},
				iShouldSeeSaveButtonEnabled: function(bIsEnabled) {
					return this.waitFor({
						controlType: "sap.m.Button",
						enabled: bIsEnabled,
						i18NText: {
							propertyName: "text",
							key: "APP_VARIANT_DIALOG_SAVE"
						},
						searchOpenDialogs: true,
						success: function(vControls) {
							var oControl = vControls[0] || vControls;
							Opa5.assert.strictEqual(oControl.getProperty("enabled"), bIsEnabled, `I see save button with enabled status: ${bIsEnabled}`);
						}
					});
				},
				iShouldSeeAddAdaptationDialog: function() {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						i18NText: {
							propertyName: "title",
							key: "SAC_DIALOG_HEADER"
						},
						searchOpenDialogs: true,
						success: function() {
							Opa5.assert.ok(true, "I see save adaptation dialog");
						}
					});
				},
				iShouldSeeEditAdaptationDialog: function() {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						i18NText: {
							propertyName: "title",
							key: "EAC_DIALOG_HEADER"
						},
						searchOpenDialogs: true,
						success: function() {
							Opa5.assert.ok(true, "I see edit adaptation dialog");
						}
					});
				},
				iShouldSeePriorityItems: function(nPriorities) {
					return this.waitFor({
						controlType: "sap.ui.core.Item",
						bindingPath: {
							propertyPath: "key",
							modelName: "dialogModel"
						},
						searchOpenDialogs: true,
						success: function(vControls) {
							Opa5.assert.strictEqual(vControls.length, nPriorities, `I see ${nPriorities} priority etries.`);
						}
					});
				}
			}
		}
	});
});

