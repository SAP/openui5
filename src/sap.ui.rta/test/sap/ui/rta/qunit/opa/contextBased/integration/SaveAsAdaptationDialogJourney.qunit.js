/* global QUnit */
sap.ui.define(
	[
		"sap/ui/test/opaQunit",
		"sap/ui/test/Opa5",
		"./pages/contextBased/SaveContextBasedAdaptationDialog",
		"./pages/contextVisibility/ContextsDialog",
		"./pages/contextVisibility/ContextSharingVisibilityFragment",
		"./pages/AppPage"
	],
	function(opaTest, Opa5) {
		"use strict";

		var arrangements = new Opa5({
			iStartMyApp: function() {
				return this.iStartMyAppInAFrame("test-resources/sap/ui/rta/qunit/opa/contextBased/index.html");
			}
		});

		Opa5.extendConfig({
			arrangements: arrangements,
			autoWait: true
		});

		// Show the demo page with one button to open the save as adaptation dialog
		QUnit.module("Demo App Page");
		opaTest("Should open SaveAs Adaptation Dialog via demo page button", function(Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoAppPage.iShouldSeeAddAdaptationDialogButton();
			When.onTheDemoAppPage.iClickOnOpenAddAdaptationDialogButton();
			Then.onTheAddAdaptationDialogPage.iShouldSeeAddAdaptationDialog();
		});

		QUnit.module("SaveAs Dialog with adaptations data from backend");
		opaTest("Should not see message strip", function(Give, When, Then) {
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextSharingVisibilityContainer();
			Then.onTheContextSharingVisibilityFragmentPage.iShouldNotSeeMessageStrip();
		});

		opaTest("Should add context-based adaptation title", function(Give, When, Then) {
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
			When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
		});

		opaTest("Should set context-based priority", function(Give, When, Then) {
			When.onTheAddAdaptationDialogPage.iClickAndSelectPriorityForAdaptation(1);
			Then.onTheAddAdaptationDialogPage.iShouldSeeSelectedContextBasedAdaptationPriority("Insert after 'German Admin' (Priority '2')");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
		});

		opaTest("Should add roles to context-based adaptation", function(Given, When, Then) {
			When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();
			Then.onTheSelectRoleDialogPage.iShouldSeeSelectRoleDialog();
			When.onTheSelectRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/HGWRTS_TST");
			Then.onTheSelectRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoleByName("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoles();
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRole("/TEST/ROLE/HGWRTS_TST");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(true);
		});

		opaTest("Should close and reopen SaveAs dialog", function(Given, When, Then) {
			When.onTheAddAdaptationDialogPage.iClickOnCancel();
			Then.onTheDemoAppPage.iShouldSeeAddAdaptationDialogButton();
			When.onTheDemoAppPage.iClickOnOpenAddAdaptationDialogButton();
			Then.onTheAddAdaptationDialogPage.iShouldSeeAddAdaptationDialog();
			Then.onTheAddAdaptationDialogPage.iShouldSeeSelectedContextBasedAdaptationPriority("Insert before all (Priority '1')");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
		});

		opaTest("Should again add necessary adaptation values", function(Given, When, Then) {
			When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("Hello World");
			When.onTheAddAdaptationDialogPage.iClickAndSelectPriorityForAdaptation(1);
			Then.onTheAddAdaptationDialogPage.iShouldSeeSelectedContextBasedAdaptationPriority("Insert after 'German Admin' (Priority '2')");
			When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();
			Then.onTheSelectRoleDialogPage.iShouldSeeSelectRoleDialog();
			When.onTheSelectRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/HGWRTS_TST");
			Then.onTheSelectRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoleByName("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoles();
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRole("/TEST/ROLE/HGWRTS_TST");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(true);
		});

		opaTest("Should delete and then add mandatory title", function(Given, When, Then) {
			When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle("");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
			When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(true);
		});

		opaTest("Should delete and then add mandatory roles", function(Given, When, Then) {
			When.onTheContextSharingVisibilityFragmentPage.iClickOnRemoveRoleButton("/TEST/ROLE/HGWRTS_TST");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
			When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();
			Then.onTheSelectRoleDialogPage.iShouldSeeSelectRoleDialog();
			When.onTheSelectRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/HGWRTS_TST");
			Then.onTheSelectRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoleByName("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoles();
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRole("/TEST/ROLE/HGWRTS_TST");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(true);
			When.onTheAddAdaptationDialogPage.iClickOnSave();
		});

		QUnit.module("SaveAs Dialog with no adaptations data from backend (simulated backend error)");
		opaTest("Should open SaveAs Adaptation Dialog via demo page button with backend error", function (Given, When, Then) {
			Then.onTheDemoAppPage.iShouldSeeAddAdaptationWithErrorDialogButton();
			When.onTheDemoAppPage.iClickOnOpenAddAdapationWithErrorDialogButton();
			Then.onTheAddAdaptationDialogPage.iShouldSeeAddAdaptationDialog();
		});

		opaTest("Should not see message strip", function(Give, When, Then) {
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextSharingVisibilityContainer();
			Then.onTheContextSharingVisibilityFragmentPage.iShouldNotSeeMessageStrip();
		});

		opaTest("Should add context-based adaptation title", function(Give, When, Then) {
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
			When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
		});

		opaTest("Should set context-based priority", function(Give, When, Then) {
			When.onTheAddAdaptationDialogPage.iClickOnPrioritySelection();
			Then.onTheAddAdaptationDialogPage.iShouldSeePriorityItems(1);
			When.onTheAddAdaptationDialogPage.iSelectContextBasedAdaptationPriority(0);
			Then.onTheAddAdaptationDialogPage.iShouldSeeSelectedContextBasedAdaptationPriority("Insert before all (Priority '1')");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
		});

		opaTest("Should add roles to context-based adaptation", function(Given, When, Then) {
			When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();
			Then.onTheSelectRoleDialogPage.iShouldSeeSelectRoleDialog();
			When.onTheSelectRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/HGWRTS_TST");
			Then.onTheSelectRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoleByName("/TEST/ROLE/HGWRTS_TST");
			When.onTheSelectRoleDialogPage.iSelectRoles();
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRole("/TEST/ROLE/HGWRTS_TST");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(true);
		});

		opaTest("Should delete and then add mandatory title", function(Given, When, Then) {
			When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle("");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);
			When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle("Hello World");
			Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(true);
		});

		opaTest("Should save adaption", function(Given, When, Then) {
			When.onTheAddAdaptationDialogPage.iClickOnSave();
			Then.onTheDemoAppPage.iShouldSeeErrorDialog();
			When.onTheDemoAppPage.iClickOnCloseDialogButton();
		});
	}
);