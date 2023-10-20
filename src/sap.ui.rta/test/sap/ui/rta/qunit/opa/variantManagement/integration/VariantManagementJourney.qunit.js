/* global QUnit */
sap.ui.define(
	[
		"sap/ui/test/opaQunit",
		"sap/ui/test/Opa5",
		"test-resources/sap/ui/rta/internal/integration/pages/Adaptation",
		"test-resources/sap/ui/fl/testutils/opa/TestLibrary"
	],
	function(
		opaTest,
		Opa5
	) {
		"use strict";

		Opa5.extendConfig({
			autoWait: true,
			timeout: 60
		});

		const sVMControlId = "__component0---app--variantManagementOrdersTable";
		const sStandardVariantName = "Standard";
		const sNewVariantName = "TestVariant1";

		QUnit.module("VariantManagement");
		opaTest("I open the App and start RTA", function(Given, When, Then) {
			// Arrangements
			Given.iStartMyAppInAFrame("./test-resources/sap/ui/rta/internal/testdata/variantManagement/sites/standalone.html");

			// Actions
			When.onPageWithRTA.iPressOnAdaptUiWithNoFlp();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheToolbar();
		});

		opaTest("I rename a Group", function(Given, When, Then) {
			const sElementId = "__component0---app--EntityType02.Title1";
			const sLabel = "Rename Label";

			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sElementId)
			.and.iClickOnAContextMenuEntry(0)
			.and.iEnterANewName(sLabel);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
			Then.onFlVariantManagement.theModifiedIndicatorShouldBeDisplayed();
		});

		opaTest("I save the change in a new variant", function(Given, When, Then) {
			const sLabel = "Rename Label";
			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId);
			When.onPageWithRTA.iClickOnAContextMenuEntry(2); // save as
			When.onFlVariantManagement.iCreateNewVariant(sVMControlId, sNewVariantName, true);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
			.and.theModifiedIndicatorShouldBeHidden();
		});

		opaTest("I make a change on the new variant", function(Given, When, Then) {
			const sElementId = "__component0---app--EntityType02.Title2";
			const sLabel = "SaveRenameChangeLabel";

			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sElementId)
			.and.iClickOnAContextMenuEntry(0)
			.and.iEnterANewName(sLabel);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
			Then.onFlVariantManagement.theModifiedIndicatorShouldBeDisplayed();
		});

		opaTest("I switch to the standard variant", function(Given, When, Then) {
			const sDialogId = "controlVariantWarningDialog";
			const sButton = "BTN_MODIFIED_VARIANT_SAVE";
			const sDialogType = "Warning";

			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
			.and.iClickOnAContextMenuEntry(4) // switch variant
			.and.iClickOnAContextMenuEntryWithText(sStandardVariantName);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheDialog(sDialogId, sDialogType);

			// Actions
			When.onPageWithRTA.iClickTheButtonWithText(sButton);

			// Assertion
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName)
			.and.theModifiedIndicatorShouldBeHidden();
		});

		opaTest("I undo and redo the change", function(Given, When, Then) {
			const sLabelAfterUndo = "SaveRenameChangeLabel";
			// Actions
			When.onPageWithRTA.iClickTheUndoButton();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabelAfterUndo);
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
			.and.theModifiedIndicatorShouldBeDisplayed();

			// Actions
			When.onPageWithRTA.iClickTheRedoButton();

			// Assertions
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName)
			.and.theModifiedIndicatorShouldBeHidden();
		});

		opaTest("I check if the change was saved correctly", function(Given, When, Then) {
			const sLabel = "SaveRenameChangeLabel";
			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
			.and.iClickOnAContextMenuEntry(4) // switch variant
			.and.iClickOnAContextMenuEntryWithText(sNewVariantName);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
			.and.theModifiedIndicatorShouldBeHidden();
		});

		opaTest("I make a change on the variant again", function(Given, When, Then) {
			const sElementId = "__component0---app--EntityType02.Title2";
			const sLabel = "DiscardRenameChangeLabel";

			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sElementId)
			.and.iClickOnAContextMenuEntry(0)
			.and.iEnterANewName(sLabel);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
			Then.onFlVariantManagement.theModifiedIndicatorShouldBeDisplayed();
		});

		opaTest("I switch to the standard variant", function(Given, When, Then) {
			const sDialogId = "controlVariantWarningDialog";
			const sButton = "BTN_MODIFIED_VARIANT_DISCARD";
			const sDialogType = "Warning";

			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
			.and.iClickOnAContextMenuEntry(4) // switch variant
			.and.iClickOnAContextMenuEntryWithText(sStandardVariantName);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheDialog(sDialogId, sDialogType);

			// Actions
			When.onPageWithRTA.iClickTheButtonWithText(sButton);

			// Assertion
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName)
			.and.theModifiedIndicatorShouldBeHidden();
		});

		opaTest("I check if the change was aborted correctly", function(Given, When, Then) {
			const sLabel = "SaveRenameChangeLabel";
			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
			.and.iClickOnAContextMenuEntry(4) // switch variant
			.and.iClickOnAContextMenuEntryWithText(sNewVariantName);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
			.and.theModifiedIndicatorShouldBeHidden();
		});

		opaTest("I rename the variant via the VM control", function(Given, When, Then) {
			const sNewVariantName = "RenameViaVMControl";
			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
			.and.iClickOnAContextMenuEntry(0)
			.and.iEnterANewName(sNewVariantName);
			When.onPageWithRTA.iPressOnEscape();

			// Assertions
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName);
		});

		opaTest("I rename the variant via the Manage Views dialog", function(Given, When, Then) {
			const sPreviousVariantName = "RenameViaVMControl";
			const sNewVariantName = "RenameViaMVDialog";
			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
			.and.iClickOnAContextMenuEntry(3);

			// Assertions
			Then.onFlVariantManagement.theOpenManageViewsDialog(sVMControlId)
			.and.theOpenManageViewsDialogDefaultShouldBe(sPreviousVariantName)
			.and.theOpenManageViewsDialogTitleShouldContain([sStandardVariantName, sPreviousVariantName]);

			// Actions
			When.onFlVariantManagement.iRenameVariant(sPreviousVariantName, sNewVariantName)
			.and.iPressTheManageViewsSave(sVMControlId);

			// Assertions
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName);
		});

		opaTest("I save the changes and close the app", function(Given, When, Then) {
			// Actions
			When.onPageWithRTA.iExitRtaMode();

			// Assertions
			Then.onPageWithRTA.iShouldNotSeeTheToolbar();
		});

		opaTest("I reload the app and check if the default variant was applied correctly", function(Given, When, Then) {
			const sDefaultVariantName = "RenameViaMVDialog";
			const sLabel = "SaveRenameChangeLabel";
			// Arrangements
			Given.iTeardownMyAppFrame();
			Given.iStartMyAppInAFrame("./test-resources/sap/ui/rta/internal/testdata/variantManagement/sites/standalone.html");

			// Actions
			When.onPageWithRTA.iPressOnAdaptUiWithNoFlp();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheToolbar()
			.and.iShouldSeeTheElementWithText(sLabel);
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sDefaultVariantName);
		});

		opaTest("Delete variant", function(Given, When, Then) {
			const sDefaultVariantName = "RenameViaMVDialog";
			const sLabelText = "EntityType02 Title 2 Complex";
			// Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
			.and.iClickOnAContextMenuEntry(3);

			// Assertions
			Then.onFlVariantManagement.theOpenManageViewsDialog(sVMControlId)
			.and.theOpenManageViewsDialogTitleShouldContain([sStandardVariantName, sDefaultVariantName]);

			// Actions
			When.onFlVariantManagement.iRemoveVariant(sDefaultVariantName)
			.and.iPressTheManageViewsSave(sVMControlId);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabelText);
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName);
		});

		opaTest("Clean Up", function(Given, When, Then) {
			// Actions
			When.onPageWithRTA.iExitRtaMode()
			.and.enableAndDeleteLrepLocalStorageAfterRta();

			// Assertions
			Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName);
			Then.iTeardownMyApp();
		});
	}
);