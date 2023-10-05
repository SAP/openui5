/* global QUnit */
sap.ui.define(
	[
		"sap/ui/test/opaQunit",
		"sap/ui/test/Opa5",
		"sap/ui/core/Core",
		"sap/ui/core/Lib",
		"./pages/contextBased/ManageAdaptationsDialog",
		"./pages/contextBased/SaveContextBasedAdaptationDialog",
		"./pages/contextVisibility/ContextsDialog",
		"./pages/contextVisibility/ContextSharingVisibilityFragment",
		"./pages/AppPage"
	],
	function(opaTest, Opa5, oCore, Lib) {
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

		// Show the demo page with one button to open the app context dialog
		QUnit.module("Demo Page");
		opaTest("Should open App Context Dialog via demo page button", function(Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
			When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
		});

		QUnit.module("App Context Dialog");
		// Filter title
		opaTest("Should search for title that does not exist and clears the search field", function(Given, When, Then) {
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("NotExistingTitle");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(0);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		opaTest("Should search for title and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("German Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(1);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		// Filter context_id
		opaTest("Should search for context_id that does not exist and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("NotExistingContextId");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(0);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		opaTest("Should search for context_id='MaNaGER' and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("MaNaGER");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(3);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		opaTest("Should search for context_id='sales' and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("sales");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(1);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		// Filter createdBy
		opaTest("Should search for createdBy that does not exist and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("NotExistingCreatedBy");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(0);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		opaTest("Should search for createdBy='Test User 2' and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("Test User 2");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(1);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		opaTest("Should search for createdBy='TeSt uSeR 1' and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("TeSt uSeR 1");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(3);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		// Filter changedBy
		opaTest("Should search for changedBy that does not exist and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("NotExistingCreatedAt");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(0);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		opaTest("Should search for changedBy='Test User 2' and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("Test User 2");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(1);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		opaTest("Should search for changedBy='TeSt uSeR 1' and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor("TeSt uSeR 1");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(3);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		// Test default context table
		opaTest("Should search for 'dEFaUlT ApP' and clears the search field", function(Given, When, Then) {
			When.onTheManageAdaptationsDialogPage.iSearchFor(oRtaResourceBundle.getText("TXT_DEFAULT_APP").toUpperCase());
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(0);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
		});

		// Test drag&drop as well as move up/down button
		opaTest("Should disable drag & drop as well as move up/down button while searching", function(Given, When, Then) {
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("mana");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(3);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheDefaultContextTable(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("DLM Copilot");
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("England Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("England Admin");
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.iTeardownMyApp();
		});

		// Test reopen of the dialog
		opaTest("Should always clear the search field after reopening the dialog and the default app is still present", function(Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
			When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
			When.onTheManageAdaptationsDialogPage.iSearchFor("Sales");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClickOnCloseButton();
			When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeEmptySearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeRows(4);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.iTeardownMyApp();
		});

		// Test move up/down button when more then one adaptation is available and one of them is selected
		opaTest("Should always enable move up/down button if more then one adaptation is available when it is selected", function(Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
			When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("somethingNotExist");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.iTeardownMyApp();
		});

		// Test move up/down button when only one adaptation is available and when this is selected
		opaTest("Should always disable move up/down button if only one adaptation is available although it is selected", function(Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
			When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButtonWithOnlyOneAdaptation();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("somethingNotExist");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.iTeardownMyApp();
		});

		// Test move up/down buttons when more then one adaptation is available
		opaTest("Should always enable move up/down button seperate from each other when respective item is selected", function(Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
			When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButton();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("somethingNotExist");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("Spain Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("somethingNotExist");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("England Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("somethingNotExist");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("Spain Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("England Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.iTeardownMyApp();
		});

		// Test move up/down button when only two adaptations are available
		opaTest("Should not enable move up/down button in the same time", function(Given, When, Then) {
			Given.iStartMyApp();
			Then.onTheDemoAppPage.iShouldSeeManageAdaptationsDialogButton();
			When.onTheDemoAppPage.iClickOnOpenManageAdaptationsDialogButtonWithTwoAdaptations();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeManageContextBasedAdaptationDialogIsOpend();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeDefaultApplicationTitle(oRtaResourceBundle.getText("TXT_DEFAULT_APP"));
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("somethingNotExist");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSearchFor("somethingNotExist");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(false);
			When.onTheManageAdaptationsDialogPage.iClearTheSearchField();
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("German Admin");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			When.onTheManageAdaptationsDialogPage.iSelectAdaptation("DLM Copilot");
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveUpButton(true);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfMoveDownButton(false);
			Then.onTheManageAdaptationsDialogPage.iShouldSeeTheEnablementOfDragAndDrop(true);
			Then.iTeardownMyApp();
		});
	}
);