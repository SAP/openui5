/* global QUnit */
sap.ui.define(
	[
		'sap/ui/test/opaQunit',
		'sap/ui/test/Opa5',
		'./pages/AppContextOverviewDialog',
		'./pages/SaveAppContextDialog',
		'./pages/AppContextRoleDialog',
		'./pages/EditAppContextDialog',
		'./pages/ContextSharingVisibilityFragment',
		'./pages/DemoPage'
	],
	function (opaTest, Opa5) {
		"use strict";

		var arrangements = new Opa5({
			iStartMyApp: function () {
				return this.iStartMyAppInAFrame("test-resources/sap/ui/rta/qunit/opa/appContext/index.html");
			}
		});

		Opa5.extendConfig({
			arrangements: arrangements,
			autoWait: true
		});

		var testData = {
			newAppContext: {
				title: "New App Context Title",
				description: "New App Context description"
			},
			editAppContext: {
				title: "Edited app context title",
				description: "Edited app context description"
			}
		};
		var oDropBefore = { before: true };
		var oDropAfter = { after: true };

		function testAppContextOrder(Then, aAppContexts) {
			for (var i = 0; i < aAppContexts.length; i++) {
				Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(i, aAppContexts[i]);
			}
		}

		// Show the demo page with one button to open the app context dialog
		QUnit.module("Demo Page");
		opaTest("Should open App Context Dialog via demo page button", function (Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoPage.iShouldSeeTheOpenAppContextDialogButton();
			When.onTheDemoPage.iClickOnOpenAppContextDialogButton();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextDialogIsOpend();
		});

		QUnit.module("App Context Dialog");
		opaTest("Should switch order of first and second row", function (Give, When, Then) {
			Then.onTheAppContextOverviewDialogPage.iShouldSeeRows(4);
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(0, "German Admin");
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(1, "DLM Copilot");

			When.onTheAppContextOverviewDialogPage.iSelectAppContext("DLM Copilot");
			When.onTheAppContextOverviewDialogPage.iMoveAppContextUp();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(0, "DLM Copilot");
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(1, "German Admin");
		});

		opaTest("Should switch order of rows back to original position", function (Give, When, Then) {
			Then.onTheAppContextOverviewDialogPage.iShouldSeeRows(4);
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(0, "DLM Copilot");
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(1, "German Admin");

			When.onTheAppContextOverviewDialogPage.iSelectAppContext("German Admin");
			When.onTheAppContextOverviewDialogPage.iMoveAppContextUp();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(0, "German Admin");
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(1, "DLM Copilot");
		});

		opaTest("Should reorder row via drag and drop from last position to third position", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iDragAndDropAppContext("German Admin", "Spain Admin", oDropAfter);
			testAppContextOrder(Then, ["DLM Copilot", "England Admin", "Spain Admin", "German Admin"]);
		});

		opaTest("Should reorder row via drag and drop from second position to first position", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iDragAndDropAppContext("DLM Copilot", "England Admin", oDropAfter);
			testAppContextOrder(Then, ["England Admin", "DLM Copilot", "Spain Admin", "German Admin"]);
		});

		opaTest("Should reorder row via drag and drop from third position to second position", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iDragAndDropAppContext("Spain Admin", "DLM Copilot", oDropBefore);
			testAppContextOrder(Then, ["England Admin", "Spain Admin", "DLM Copilot", "German Admin"]);
		});

		opaTest("Should reorder row via drag and drop from last position to second position", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iDragAndDropAppContext("German Admin", "Spain Admin", oDropBefore);
			testAppContextOrder(Then, ["England Admin", "German Admin", "Spain Admin", "DLM Copilot"]);
		});

		opaTest("Should save new user role specific app context from existing app context", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle("German Admin");
			When.onTheAppContextOverviewDialogPage.iClickOnSaveActionButton();
			Then.onTheAppContextSaveDialogPage.iShouldSeeSaveAppContextDialog();

			When.onTheAppContextSaveDialogPage.iEnterAppContextTitle(testData.newAppContext.title);
			Then.onTheAppContextSaveDialogPage.iShouldSeeAppContextTitle(testData.newAppContext.title);

			When.onTheAppContextSaveDialogPage.iEnterAppContextDescription(testData.newAppContext.description);
			Then.onTheAppContextSaveDialogPage.iShouldSeeAppContextDescription(testData.newAppContext.description);

			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("SAP_ACH_ADMIN");
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("MW_ADMIN");

			When.onTheAppContextSaveDialogPage.iClickOnSave();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(4, testData.newAppContext.title);
		});

		opaTest("Should edit app context title and description", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle(testData.newAppContext.title);
			When.onTheAppContextOverviewDialogPage.iClickOnEditActionButton();
			Then.onTheAppContextEditDialogPage.iShouldSeeEditAppContextDialog();

			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("SAP_ACH_ADMIN");
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("MW_ADMIN");

			Then.onTheAppContextEditDialogPage.iShouldSeeAppContextTitle(testData.newAppContext.title);
			When.onTheAppContextEditDialogPage.iEnterAppContextTitle(testData.editAppContext.title);
			Then.onTheAppContextEditDialogPage.iShouldSeeAppContextTitle(testData.editAppContext.title);

			Then.onTheAppContextEditDialogPage.iShouldSeeAppContextDescription(testData.newAppContext.description);
			When.onTheAppContextEditDialogPage.iEnterAppContextDescription(testData.editAppContext.description);
			Then.onTheAppContextEditDialogPage.iShouldSeeAppContextDescription(testData.editAppContext.description);

			When.onTheAppContextEditDialogPage.iClickOnEdit();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(4, testData.editAppContext.title);
		});

		opaTest("Should delete penultimate app context out of five app contexts", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle("DLM Copilot");
			When.onTheAppContextOverviewDialogPage.iClickOnDeleteActionButton();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeRows(4);
			testAppContextOrder(Then, ["England Admin", "German Admin", "Spain Admin", testData.editAppContext.title]);
		});

		opaTest("Should delete second app context out of four app contexts", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle("German Admin");
			When.onTheAppContextOverviewDialogPage.iClickOnDeleteActionButton();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeRows(3);
			testAppContextOrder(Then, ["England Admin", "Spain Admin", testData.editAppContext.title]);
		});

		opaTest("Should delete second app context out of three app contexts", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle("Spain Admin");
			When.onTheAppContextOverviewDialogPage.iClickOnDeleteActionButton();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeRows(2);
			testAppContextOrder(Then, ["England Admin", testData.editAppContext.title]);
		});

		opaTest("Should delete first app context out of two app contexts", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle("England Admin");
			When.onTheAppContextOverviewDialogPage.iClickOnDeleteActionButton();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeRows(1);
			testAppContextOrder(Then, [testData.editAppContext.title]);
		});

		opaTest("Should delete last app contexts", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle(testData.editAppContext.title);
			When.onTheAppContextOverviewDialogPage.iClickOnDeleteActionButton();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeRows(0);
		});

		opaTest("Should create new app context with user specific roles", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnNewContextButton();
			Then.onTheAppContextSaveDialogPage.iShouldSeeSaveAppContextDialog();

			When.onTheAppContextSaveDialogPage.iEnterAppContextTitle(testData.editAppContext.title);
			Then.onTheAppContextSaveDialogPage.iShouldSeeAppContextTitle(testData.editAppContext.title);

			When.onTheAppContextSaveDialogPage.iEnterAppContextDescription(testData.editAppContext.description);
			Then.onTheAppContextSaveDialogPage.iShouldSeeAppContextDescription(testData.editAppContext.description);


			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRolesSection();
			When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();
			Then.onTheAppContextRoleDialogPage.iShouldSeeRoleDialog();
			When.onTheAppContextRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/HGWRTS_TST");
			Then.onTheAppContextRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/HGWRTS_TST");
			When.onTheAppContextRoleDialogPage.iSelectRoleByName("/TEST/ROLE/HGWRTS_TST");
			When.onTheAppContextRoleDialogPage.iSelectRoles();
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("/TEST/ROLE/HGWRTS_TST");

			When.onTheAppContextSaveDialogPage.iClickOnSave();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(0, testData.editAppContext.title, 1);
		});

		opaTest("Should change user specific assigned roles of newly created app context", function (Give, When, Then) {
			When.onTheAppContextOverviewDialogPage.iClickOnActionMenuOfAppContextWithTitle(testData.editAppContext.title);
			When.onTheAppContextOverviewDialogPage.iClickOnEditActionButton();
			Then.onTheAppContextEditDialogPage.iShouldSeeEditAppContextDialog();

			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("/TEST/ROLE/HGWRTS_TST");
			When.onTheContextSharingVisibilityFragmentPage.iClickOnRemoveRoleButton("/TEST/ROLE/HGWRTS_TST");
			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRolesSection();
			When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();

			Then.onTheAppContextRoleDialogPage.iShouldSeeRoleDialog();
			When.onTheAppContextRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/BQ_MN6");
			Then.onTheAppContextRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/BQ_MN6");
			When.onTheAppContextRoleDialogPage.iSelectRoleByName("/TEST/ROLE/BQ_MN6");
			When.onTheAppContextRoleDialogPage.iSelectRoles();

			Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("/TEST/ROLE/BQ_MN6");
			When.onTheAppContextEditDialogPage.iClickOnEdit();
			Then.onTheAppContextOverviewDialogPage.iShouldSeeAppContextAtPosition(0, testData.editAppContext.title, 1);
			When.onTheAppContextOverviewDialogPage.iClickOnCloseButton();
		});
	}
);