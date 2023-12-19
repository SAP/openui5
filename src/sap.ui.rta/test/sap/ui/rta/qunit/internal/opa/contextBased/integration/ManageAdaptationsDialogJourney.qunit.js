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
			return this.iStartMyAppInAFrame("test-resources/sap/ui/rta/qunit/internal/opa/contextBased/index.html");
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
});