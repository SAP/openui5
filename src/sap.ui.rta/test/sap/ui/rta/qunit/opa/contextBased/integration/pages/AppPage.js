sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function(
	Opa5,
	Press
) {
	"use strict";
	Opa5.createPageObjects({
		onTheDemoAppPage: {
			actions: {
				iClickOnOpenManageAdaptationsDialogButton: function() {
					return this.waitFor({
						id: "openManageAdaptationsDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						actions: new Press(),
						errorMessage: "Did not find the Open Manage Context-Based Adaptations dialog button"
					});
				},
				iClickOnOpenManageAdaptationsDialogButtonWithOnlyOneAdaptation: function() {
					return this.waitFor({
						id: "openManageAdaptationsWithOnlyOneAdaptationDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						actions: new Press(),
						errorMessage: "Did not find the Open Manage Context-Based Adaptations dialog button"
					});
				},
				iClickOnOpenManageAdaptationsDialogButtonWithTwoAdaptations: function() {
					return this.waitFor({
						id: "openManageAdaptationsWithTwoAdaptationsDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						actions: new Press(),
						errorMessage: "Did not find the Open Manage Context-Based Adaptations dialog button"
					});
				},
				iClickOnManageAdaptationsWithErrorDialogButton: function() {
					return this.waitFor({
						id: "openManageAdaptationsWithErrorDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						actions: new Press(),
						errorMessage: "Did not find the Open Manage Context-Based Adpations with error dialog button"
					});
				},
				iClickOnOpenAddAdaptationDialogButton: function() {
					return this.waitFor({
						id: "openAddAdaptationDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						actions: new Press(),
						errorMessage: "Did not find the Open Add Adaptation dialog button"
					});
				},
				iClickOnOpenAddAdapationWithErrorDialogButton: function() {
					return this.waitFor({
						id: "openAddAdaptationWithErrorDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						actions: new Press(),
						errorMessage: "Did not find the Open Add Adaptation with error dialog button"
					});
				},
				iClickOnCloseDialogButton: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						properties: {
							type: "Default"
						},
						searchOpenDialogs: true,
						actions: new Press()
					});
				}
			},
			assertions: {
				iShouldSeeManageAdaptationsDialogButton: function() {
					return this.waitFor({
						id: "openManageAdaptationsDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						success: function() {
							Opa5.assert.ok(true, "I see Open Manage Context-Based Adaptations dialog button");
						},
						errorMessage: "I should see the Open Manage Context-Based Adaptations dialog button."
					});
				},
				iShouldSeeManageAdaptationsWithErrorDialogButton: function() {
					return this.waitFor({
						id: "openManageAdaptationsWithErrorDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						success: function() {
							Opa5.assert.ok(true, "I see Open Manage Context-Based Adaptations dialog button");
						},
						errorMessage: "I should see the Open Manage Context-Based Adaptations dialog button."
					});
				},
				iShouldSeeAddAdaptationDialogButton: function() {
					return this.waitFor({
						id: "openAddAdaptationDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						success: function() {
							Opa5.assert.ok(true, "I see Open Add Adaptation dialog button");
						},
						errorMessage: "I should see the Open Add Adaptation dialog button."
					});
				},
				iShouldSeeAddAdaptationWithErrorDialogButton: function() {
					return this.waitFor({
						id: "openAddAdaptationWithErrorDialogButton",
						viewName: "sap.ui.rta.contextBased.Page",
						success: function() {
							Opa5.assert.ok(true, "I see the Open Add Adaptation with error dialog button");
						},
						errorMessage: "Did not find the Open Add Adaptation with error dialog button"
					});
				},
				iShouldSeeErrorDialog: function() {
					return this.waitFor({
						controlType: "sap.m.Dialog",
						properties: {
							icon: "sap-icon://error"
						},
						searchOpenDialogs: true,
						success: function() {
							Opa5.assert.ok(true, "I see error dialog");
						},
						errorMessage: "I did not find the error dialog"
					});
				}
			}
		}
	});
});
