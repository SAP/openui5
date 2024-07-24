/* global QUnit */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/rta/integration/pages/Adaptation",
	"test-resources/sap/ui/rta/integration/pages/ChangeVisualization",
	"test-resources/sap/ui/fl/testutils/opa/TestLibrary"
], (
	opaTest,
	Opa5,
	FlexTestAPI
) => {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		timeout: 60,
		arrangements: new Opa5({
			iClearTheSessionLRep() {
				FlexTestAPI.clearStorage("SessionStorage");
				window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
				window.sessionStorage.removeItem("sap.ui.rta.restart.USER");
				localStorage.clear();
			}
		})
	});

	const sVMControlId = "__component0---app--variantManagementOrdersTable";
	const sCVizDropDownId = "__component0---changeVisualization_changesList--popover";
	const sStandardVariantName = "Standard";
	const sNewVariantName = "TestVariant1";

	QUnit.module("VariantManagement");

	opaTest("I open the App and start RTA", (Given, When, Then) => {
		Given.iClearTheSessionLRep();
		Given.iStartMyAppInAFrame("./test-resources/sap/ui/rta/internal/testdata/variantManagement/sites/standalone.html");

		When.onPageWithRTA.iPressOnAdaptUiWithNoFlp();

		Then.onPageWithRTA.iShouldSeeTheToolbar();
	});

	opaTest("I rename a Group", (Given, When, Then) => {
		const sElementId = "__component0---app--EntityType02.Title1";
		const sLabel = "Rename Label";

		When.onPageWithRTA.iRightClickOnAnElementOverlay(sElementId)
		.and.iClickOnAContextMenuEntry(0)
		.and.iEnterANewName(sLabel);

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
		Then.onFlVariantManagement.theModifiedIndicatorShouldBeDisplayed();
	});

	opaTest("I check the change in the visualization mode", (Given, When, Then) => {
		const oChangesCount = {
			all: 1,
			add: 0,
			move: 0,
			rename: 1,
			combineSplit: 0,
			remove: 0,
			other: 0
		};

		When.onPageWithRTA.iSwitchToVisualizationMode();
		When.onPageWithCViz.iClickOnTheChangesDropDownMenuButton()
		.and.iClickOnTheUnsavedButton();

		Then.onPageWithCViz.iShouldSeeTheChangeIndicators(1)
		.and.iShouldSeeTheCorrectChangesCategoriesCount(sCVizDropDownId, oChangesCount);

		When.onPageWithRTA.iSwitchToAdaptationMode();
	});

	opaTest("I save the change in a new variant", (Given, When, Then) => {
		const sLabel = "Rename Label";
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(2); // save as
		When.onFlVariantManagement.iCreateNewVariant(sVMControlId, sNewVariantName, true);

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
		.and.theModifiedIndicatorShouldBeHidden();
	});

	opaTest("I check if the variant changes are correctly displayed in the visualization mode", (Given, When, Then) => {
		const iNotVisualizedChanges = 2;
		const oChangesCount = {
			all: 1,
			add: 0,
			move: 0,
			rename: 1,
			combineSplit: 0,
			remove: 0,
			other: 0
		};

		When.onPageWithRTA.iSwitchToVisualizationMode();
		When.onPageWithCViz.iClickOnTheChangesDropDownMenuButton()
		.and.iClickOnTheUnsavedButton();

		Then.onPageWithCViz.iShouldSeeTheChangeIndicators(1)
		.and.iShouldSeeTheCorrectChangesCategoriesCount(sCVizDropDownId, oChangesCount)
		.and.iShouldSeeTheHiddenChangesStrip(sCVizDropDownId, iNotVisualizedChanges);
		When.onPageWithRTA.iSwitchToAdaptationMode();
	});

	opaTest("I make a change on the new variant", (Given, When, Then) => {
		const sElementId = "__component0---app--EntityType02.Title2";
		const sLabel = "SaveRenameChangeLabel";

		When.onPageWithRTA.iRightClickOnAnElementOverlay(sElementId)
		.and.iClickOnAContextMenuEntry(0)
		.and.iEnterANewName(sLabel);

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
		Then.onFlVariantManagement.theModifiedIndicatorShouldBeDisplayed();
	});

	opaTest("I switch to the standard variant", (Given, When, Then) => {
		const sDialogId = "controlVariantWarningDialog";
		const sButton = "BTN_MODIFIED_VARIANT_SAVE";
		const sDialogType = "Warning";

		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(4) // switch variant
		.and.iClickOnAContextMenuEntryWithText(sStandardVariantName);

		Then.onPageWithRTA.iShouldSeeTheDialog(sDialogId, sDialogType);

		When.onPageWithRTA.iClickTheButtonWithText(sButton);

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName)
		.and.theModifiedIndicatorShouldBeHidden();
	});

	opaTest("I undo and redo the change", (Given, When, Then) => {
		const sLabelAfterUndo = "SaveRenameChangeLabel";
		When.onPageWithRTA.iClickTheUndoButton();

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabelAfterUndo);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
		.and.theModifiedIndicatorShouldBeDisplayed();

		When.onPageWithRTA.iClickTheRedoButton();

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName)
		.and.theModifiedIndicatorShouldBeHidden();
	});

	opaTest("I check if the variant changes are correctly displayed in the visualization mode", (Given, When, Then) => {
		const iNotVisualizedChanges = 2;
		const oChangesCount = {
			all: 0,
			add: 0,
			move: 0,
			rename: 0,
			combineSplit: 0,
			remove: 0,
			other: 0
		};

		When.onPageWithRTA.iSwitchToVisualizationMode();
		When.onPageWithCViz.iClickOnTheChangesDropDownMenuButton();

		Then.onPageWithCViz.iShouldSeeTheCorrectChangesCategoriesCount(sCVizDropDownId, oChangesCount)
		.and.iShouldSeeTheHiddenChangesStrip(sCVizDropDownId, iNotVisualizedChanges);
		When.onPageWithRTA.iSwitchToAdaptationMode();
	});

	opaTest("I check if the change was saved correctly", (Given, When, Then) => {
		const sLabel = "SaveRenameChangeLabel";
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(4) // switch variant
		.and.iClickOnAContextMenuEntryWithText(sNewVariantName);

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
		.and.theModifiedIndicatorShouldBeHidden();
	});

	opaTest("I check if the variant changes are correctly displayed in the visualization mode", (Given, When, Then) => {
		const iNotVisualizedChanges = 2;
		const oChangesCount = {
			all: 2,
			add: 0,
			move: 0,
			rename: 2,
			combineSplit: 0,
			remove: 0,
			other: 0
		};

		When.onPageWithRTA.iSwitchToVisualizationMode();
		When.onPageWithCViz.iClickOnTheChangesDropDownMenuButton();

		Then.onPageWithCViz.iShouldSeeTheChangeIndicators(2)
		.and.iShouldSeeTheCorrectChangesCategoriesCount(sCVizDropDownId, oChangesCount, iNotVisualizedChanges)
		.and.iShouldSeeTheHiddenChangesStrip(sCVizDropDownId, iNotVisualizedChanges);
		When.onPageWithRTA.iSwitchToAdaptationMode();
	});

	opaTest("I save the changes and check if the unsaved change button is disabled in CViz", (Given, When, Then) => {
		When.onPageWithRTA.iClickTheSaveButton()
		.and.iSwitchToVisualizationMode();
		When.onPageWithCViz.iClickOnTheChangesDropDownMenuButton();

		Then.onPageWithCViz.iShouldSeeTheDisabledSegmentedButton(sCVizDropDownId, 2);
		When.onPageWithRTA.iSwitchToAdaptationMode();
	});

	opaTest("I make a change on the variant again", (Given, When, Then) => {
		const sElementId = "__component0---app--EntityType02.Title2";
		const sLabel = "DiscardRenameChangeLabel";

		When.onPageWithRTA.iRightClickOnAnElementOverlay(sElementId)
		.and.iClickOnAContextMenuEntry(0)
		.and.iEnterANewName(sLabel);

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
		Then.onFlVariantManagement.theModifiedIndicatorShouldBeDisplayed();
	});

	opaTest("I switch to the standard variant", (Given, When, Then) => {
		const sDialogId = "controlVariantWarningDialog";
		const sButton = "BTN_MODIFIED_VARIANT_DISCARD";
		const sDialogType = "Warning";

		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(4) // switch variant
		.and.iClickOnAContextMenuEntryWithText(sStandardVariantName);

		Then.onPageWithRTA.iShouldSeeTheDialog(sDialogId, sDialogType);

		When.onPageWithRTA.iClickTheButtonWithText(sButton);

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName)
		.and.theModifiedIndicatorShouldBeHidden();
	});

	opaTest("I check if the change was aborted correctly", (Given, When, Then) => {
		const sLabel = "SaveRenameChangeLabel";
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(4) // switch variant
		.and.iClickOnAContextMenuEntryWithText(sNewVariantName);

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabel);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName)
		.and.theModifiedIndicatorShouldBeHidden();
	});

	opaTest("I rename the variant via the VM control", (Given, When, Then) => {
		const sNewVariantName = "RenameViaVMControl";
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(0)
		.and.iEnterANewName(sNewVariantName);
		When.onPageWithRTA.iPressOnEscape();

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName);
	});

	opaTest("I rename the variant via the Manage Views dialog", (Given, When, Then) => {
		const sPreviousVariantName = "RenameViaVMControl";
		const sNewVariantName = "RenameViaMVDialog";
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(3);

		Then.onFlVariantManagement.theOpenManageViewsDialog(sVMControlId)
		.and.theOpenManageViewsDialogDefaultShouldBe(sPreviousVariantName)
		.and.theOpenManageViewsDialogTitleShouldContain([sStandardVariantName, sPreviousVariantName]);

		When.onFlVariantManagement.iRenameVariant(sPreviousVariantName, sNewVariantName)
		.and.iPressTheManageViewsSave(sVMControlId);

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sNewVariantName);
	});

	opaTest("I check if the variant changes are correctly displayed in the visualization mode", (Given, When, Then) => {
		const iNotVisualizedChangesAll = 4;
		const iNotVisualizedChangesDraft = 2;
		const oChangesCount = {
			all: 0,
			add: 0,
			move: 0,
			rename: 0,
			combineSplit: 0,
			remove: 0,
			other: 0
		};

		When.onPageWithRTA.iSwitchToVisualizationMode();
		When.onPageWithCViz.iClickOnTheChangesDropDownMenuButton();

		Then.onPageWithCViz.iShouldSeeTheChangeIndicators(2)
		.and.iShouldSeeTheHiddenChangesStrip(sCVizDropDownId, iNotVisualizedChangesAll);

		When.onPageWithCViz.iClickOnTheUnsavedButton();

		Then.onPageWithCViz.iShouldSeeTheCorrectChangesCategoriesCount(sCVizDropDownId, oChangesCount)
		.and.iShouldNotSeeAChangeIndicator()
		.and.iShouldSeeTheHiddenChangesStrip(sCVizDropDownId, iNotVisualizedChangesDraft);
		When.onPageWithRTA.iSwitchToAdaptationMode();
	});

	opaTest("I save the changes and close the app", (Given, When, Then) => {
		When.onPageWithRTA.iExitRtaMode();

		Then.onPageWithRTA.iShouldNotSeeTheToolbar();
	});

	opaTest("I reload the app and check if the default variant was applied correctly", (Given, When, Then) => {
		const sDefaultVariantName = "RenameViaMVDialog";
		const sLabel = "SaveRenameChangeLabel";
		Given.iTeardownMyAppFrame()
		.and.iStartMyAppInAFrame("./test-resources/sap/ui/rta/internal/testdata/variantManagement/sites/standalone.html");

		When.onPageWithRTA.iPressOnAdaptUiWithNoFlp();

		Then.onPageWithRTA.iShouldSeeTheToolbar()
		.and.iShouldSeeTheElementWithText(sLabel);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sDefaultVariantName);
	});

	opaTest("I check if the draft change button is disabled in CViz", (Given, When, Then) => {
		When.onPageWithRTA.iSwitchToVisualizationMode();
		When.onPageWithCViz.iClickOnTheChangesDropDownMenuButton();

		Then.onPageWithCViz.iShouldSeeTheDisabledSegmentedButton(sCVizDropDownId, 1);
		When.onPageWithRTA.iSwitchToAdaptationMode();
	});

	opaTest("Delete the variant", (Given, When, Then) => {
		const sDefaultVariantName = "RenameViaMVDialog";
		const sLabelText = "EntityType02 Title 2 Complex";
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sVMControlId)
		.and.iClickOnAContextMenuEntry(3);

		Then.onFlVariantManagement.theOpenManageViewsDialog(sVMControlId)
		.and.theOpenManageViewsDialogTitleShouldContain([sStandardVariantName, sDefaultVariantName]);

		When.onFlVariantManagement.iRemoveVariant(sDefaultVariantName)
		.and.iPressTheManageViewsSave(sVMControlId);

		Then.onPageWithRTA.iShouldSeeTheElementWithText(sLabelText);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName);
	});

	opaTest("Clean Up", (Given, When, Then) => {
		When.onPageWithRTA.iExitRtaMode()
		.and.enableAndDeleteLrepLocalStorageAfterRta();

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sVMControlId, sStandardVariantName);
		Then.iTeardownMyApp();
	});
});