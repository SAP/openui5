/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/core/Lib",
	"./pages/contextBased/ManageAdaptationsDialog",
	"./pages/contextBased/SaveContextBasedAdaptationDialog",
	"./pages/contextVisibility/ContextsDialog",
	"./pages/contextVisibility/ContextSharingVisibilityFragment",
	"./pages/AppPage",
	"sap/ui/core/date/UI5Date"
], function(
	Localization,
	opaTest,
	Opa5,
	Lib
) {
	"use strict";

	var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	var arrangements = new Opa5({
		iStartMyApp() {
			return this.iStartMyAppInAFrame("test-resources/sap/ui/rta/qunit/opa/contextBased/index.html");
		}
	});

	Opa5.extendConfig({
		arrangements,
		autoWait: true
	});

	/* var testData = {
		editAdaptation: {
			title: "England Admin",
			changedTitle: "France Admin",
			priority: "Insert after 'DLM Copilot' (Priority '3')",
			description: "Edited app context description",
			role: "INVENTORY_MANAGER"
		}
	}; */
	var oDropBefore = { before: true };
	var oDropAfter = { after: true };

	function testPriorityOfAdaptations(Then, aContextBasedAdaptations) {
		for (var i = 0; i < aContextBasedAdaptations.length; i++) {
			Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(i, aContextBasedAdaptations[i]);
		}
	}

	function testLanguageDependentDateFormat(Then, sExpectedFormat, iColumnRow, sPropertyPath) {
		var sCurrentLanguage = Localization.getLanguage().toLocaleLowerCase();
		// This opa test will only be executed if the browser language is english
		if (sCurrentLanguage === "en") {
			Then.onTheManageAdaptationsDialogPage.iShouldSeeCorrectDateFormat(sExpectedFormat, iColumnRow, sPropertyPath);
		}
	}

	// Show the demo page with one button to open the manage adaptations dialog
	QUnit.module("Demo Page");
	opaTest("Should open Manage Adaptations Dialog via demo page button", function(Given, When, Then) {
		Given.iStartMyApp();
		Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
		When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAllExpectedColumnHeaders(5);
		testLanguageDependentDateFormat(Then, "May 25, 2022, 9:30 AM", 0, "createdBy");
		testLanguageDependentDateFormat(Then, "Sep 7, 2022, 12:30 PM", 1, "changedAt");
	});

	QUnit.module("Manage Adaptations Dialog");
	opaTest("Should switch order of first and second row", function(Give, When, Then) {
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaUpButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
	});

	opaTest("Should switch order of rows back to original position", function(Give, When, Then) {
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaUpButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);
	});

	opaTest("Should reorder row via drag and drop from last position to third position", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iDragAndDropAdaptation("German Admin", "Spain Admin", oDropAfter);
		testPriorityOfAdaptations(Then, ["DLM Copilot", "England Admin", "Spain Admin", "German Admin"]);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
	});

	opaTest("Should reorder row via drag and drop from second position to first position", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iDragAndDropAdaptation("DLM Copilot", "England Admin", oDropAfter);
		testPriorityOfAdaptations(Then, ["England Admin", "DLM Copilot", "Spain Admin", "German Admin"]);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
	});

	opaTest("Should reorder row via drag and drop from third position to second position", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iDragAndDropAdaptation("Spain Admin", "DLM Copilot", oDropBefore);
		testPriorityOfAdaptations(Then, ["England Admin", "Spain Admin", "DLM Copilot", "German Admin"]);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
	});

	opaTest("Should reorder row via drag and drop from last position to second position", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iDragAndDropAdaptation("German Admin", "Spain Admin", oDropBefore);
		testPriorityOfAdaptations(Then, ["England Admin", "German Admin", "Spain Admin", "DLM Copilot"]);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
		When.onTheManageAdaptationsDialogPage.iClickOnCloseButton();
	});

	opaTest("Should open manage context-based adaptation dialog button with error", function(Given, When, Then) {
		When.onTheDemoAppPage.iClickOnManageAdaptationsWithErrorDialogButton();
		Then.onTheDemoAppPage.iShouldSeeErrorDialog();
		When.onTheDemoAppPage.iClickOnCloseDialogButton();
	});

	opaTest("Should clear the table selection after reopening the dialog", function(Given, When, Then) {
		Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
		When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeNoSelections();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheSelectionOfAdaptation("DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		When.onTheManageAdaptationsDialogPage.iClickOnCloseButton();
		When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeNoSelections();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
		Then.iTeardownMyApp();
	});

	opaTest("Should move and enable the correct move up/down buttons", function(Given, When, Then) {
		Given.iStartMyApp();
		When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaUpButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaDownButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaDownButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaDownButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaDownButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaDownButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaDownButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaUpButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(2, "England Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(3, "Spain Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);
		Then.iTeardownMyApp();
	});

	opaTest("Should move and enable the correct move up/down buttons with only two adaptations", function(Given, When, Then) {
		Given.iStartMyApp();
		Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
		When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButtonWithTwoAdaptations();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(2);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaUpButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);

		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaUpButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(false);
		When.onTheManageAdaptationsDialogPage.iMoveAdaptationViaDownButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, "DLM Copilot");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(1, "German Admin");
		Then.onTheManageAdaptationsDialogPage.iShouldSeeSaveButtonEnabled(true);
		Then.iTeardownMyApp();
	});

	/*
	opaTest("Should edit app context title", function(Give, When, Then) {
		When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
		When.onTheManageAdaptationsDialogPage.iSelectAdaptation(testData.editAdaptation.title);
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithPriority(0);
		When.onTheManageAdaptationsDialogPage.iClickOnEditActionButton();
		Then.onTheAddAdaptationDialogPage.iShouldSeeEditAdaptationDialog();
		Then.onTheAddAdaptationDialogPage.iShouldSeeContextSharingVisibilityContainer();
		Then.onTheAddAdaptationDialogPage.iShouldSeeDialogTitle("Edit Adaptation");
		Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle(testData.editAdaptation.title);
		Then.onTheAddAdaptationDialogPage.iShouldSeeSelectedContextBasedAdaptationPriority(testData.editAdaptation.priority);
		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRole(testData.editAdaptation.role);
		Then.onTheContextSharingVisibilityFragmentPage.iShouldNotSeeMessageStrip();
		Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(false);

		When.onTheAddAdaptationDialogPage.iEnterContextBasedAdaptationTitle(testData.editAdaptation.changedTitle);
		Then.onTheAddAdaptationDialogPage.iShouldSeeContextBasedAdaptationTitle(testData.editAdaptation.changedTitle);
		Then.onTheAddAdaptationDialogPage.iShouldSeeSaveButtonEnabled(true);
	});

	opaTest("Should delete app context out of five app contexts", function(Give, When, Then) {
		When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(3);
		When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithPriority(2);
		When.onTheManageAdaptationsDialogPage.iClickOnDeleteActionButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(3);
		//testContextBasedAdaptationOrder(Then, ["England Admin", "German Admin", "Spain Admin", testData.editAdaptation.title]);
	});
	*/

	/*
		* disabled tests because the used features are part of another BLI and still need to be implemented

	opaTest("Should save new user role specific app context from existing app context", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithTitle("German Admin");
		When.onTheManageAdaptationsDialogPage.iClickOnSaveActionButton();
		Then.onTheAddAdaptationDialogPage.iShouldSeeSaveAddAdaptationDialog();

		When.onTheAddAdaptationDialogPage.iEnterAdaptationTitle(testData.newAdaptation.title);
		Then.onTheAddAdaptationDialogPage.iShouldSeeAdaptationTitle(testData.newAdaptation.title);

		When.onTheAddAdaptationDialogPage.iEnterAdaptationDescription(testData.newAdaptation.description);
		Then.onTheAddAdaptationDialogPage.iShouldSeeAdaptationDescription(testData.newAdaptation.description);

		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("SAP_ACH_ADMIN");
		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("MW_ADMIN");

		When.onTheAddAdaptationDialogPage.iClickOnSave();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(4, testData.newAdaptation.title);
	});

	opaTest("Should delete penultimate app context out of five app contexts", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithTitle("DLM Copilot");
		When.onTheManageAdaptationsDialogPage.iClickOnDeleteActionButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
		testContextBasedAdaptationOrder(Then, ["England Admin", "German Admin", "Spain Admin", testData.editAdaptation.title]);
	});

	opaTest("Should delete second app context out of four app contexts", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithTitle("German Admin");
		When.onTheManageAdaptationsDialogPage.iClickOnDeleteActionButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(3);
		testContextBasedAdaptationOrder(Then, ["England Admin", "Spain Admin", testData.editAdaptation.title]);
	});

	opaTest("Should delete second app context out of three app contexts", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithTitle("Spain Admin");
		When.onTheManageAdaptationsDialogPage.iClickOnDeleteActionButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(2);
		testContextBasedAdaptationOrder(Then, ["England Admin", testData.editAdaptation.title]);
	});

	opaTest("Should delete first app context out of two app contexts", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithTitle("England Admin");
		When.onTheManageAdaptationsDialogPage.iClickOnDeleteActionButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(1);
		testContextBasedAdaptationOrder(Then, [testData.editAdaptation.title]);
	});

	opaTest("Should delete last app contexts", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithTitle(testData.editAdaptation.title);
		When.onTheManageAdaptationsDialogPage.iClickOnDeleteActionButton();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(0);
	});

	opaTest("Should create new app context with user specific roles", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnNewContextButton();
		Then.onTheAddAdaptationDialogPage.iShouldSeeSaveAdaptationDialog();

		When.onTheAddAdaptationDialogPage.iEnterAdaptationTitle(testData.editAdaptation.title);
		Then.onTheAddAdaptationDialogPage.iShouldSeeAdaptationTitle(testData.editAdaptation.title);

		When.onTheAddAdaptationDialogPage.iEnterAdaptationDescription(testData.editAdaptation.description);
		Then.onTheAddAdaptationDialogPage.iShouldSeeAdaptationDescription(testData.editAdaptation.description);

		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRolesSection();
		When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();
		Then.onTheSelectRoleDialogPage.iShouldSeeSelectRoleDialog();
		When.onTheSelectRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/HGWRTS_TST");
		Then.onTheSelectRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/HGWRTS_TST");
		When.onTheSelectRoleDialogPage.iSelectRoleByName("/TEST/ROLE/HGWRTS_TST");
		When.onTheSelectRoleDialogPage.iSelectRoles();
		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("/TEST/ROLE/HGWRTS_TST");

		When.onTheAddAdaptationDialogPage.iClickOnSave();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, testData.editAdaptation.title, 1);
	});

	opaTest("Should change user specific assigned roles of newly created app context", function(Give, When, Then) {
		When.onTheManageAdaptationsDialogPage.iClickOnActionMenuOfAdaptationWithTitle(testData.editAdaptation.title);
		When.onTheManageAdaptationsDialogPage.iClickOnEditActionButton();
		Then.onTheEditAdaptationDialogPage.iShouldSeeEditAdaptationDialog();

		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("/TEST/ROLE/HGWRTS_TST");
		When.onTheContextSharingVisibilityFragmentPage.iClickOnRemoveRoleButton("/TEST/ROLE/HGWRTS_TST");
		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRolesSection();
		When.onTheContextSharingVisibilityFragmentPage.iClickOnAddRoleButton();

		Then.onTheSelectRoleDialogPage.iShouldSeeSelectRoleDialog();
		When.onTheSelectRoleDialogPage.iEnterRoleTitle("/TEST/ROLE/BQ_MN6");
		Then.onTheSelectRoleDialogPage.iShouldSeeRoleTitle("/TEST/ROLE/BQ_MN6");
		When.onTheSelectRoleDialogPage.iSelectRoleByName("/TEST/ROLE/BQ_MN6");
		When.onTheSelectRoleDialogPage.iSelectRoles();

		Then.onTheContextSharingVisibilityFragmentPage.iShouldSeeSelectedRoles("/TEST/ROLE/BQ_MN6");
		When.onTheEditAdaptationDialogPage.iClickOnEdit();
		Then.onTheManageAdaptationsDialogPage.iShouldSeeAdaptationAtPosition(0, testData.editAdaptation.title, 1);
		When.onTheManageAdaptationsDialogPage.iClickOnCloseButton();
	});
	*/
});