/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
    "sap/ui/test/actions/Press",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"test-resources/sap/ui/rta/internal/integration/pages/Adaptation",
	"test-resources/sap/ui/fl/testutils/opa/TestLibrary"
], function(
	Opa5,
	opaTest,
	Press,
	FakeLrepConnectorSessionStorage,
	Adaptation,
	TestLibrary
) {
	"use strict";

	Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,
		appParams: {
			"sap-ui-rta-skip-flex-validation": true
		},
		arrangements: {
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.v4demo",
						async: true
					},
					hash: "",
					autowait: true
				});
			},
			iClearTheSessionLRep: function () {
				FakeLrepConnectorSessionStorage.forTesting.synchronous.clearAll();
				window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
				window.sessionStorage.removeItem("sap.ui.rta.restart.USER");
				localStorage.clear();
			}
		},
		actions: new Opa5({
			iPressTheAdaptUiButton: function () {
				return this.waitFor({
					id: "__button0",
					controlType: "sap.m.Button",
					actions: new Press()
				});
			}
		})
	});

	var sFLVM_ID = "__component0---books--IDVariantManagementOfTable";


	QUnit.module("ListReport Fl VM - Books Page Table");

	opaTest("1. start the app in RTA", function(Given, When, Then) {
		// Arrange
		FakeLrepConnectorSessionStorage.enableFakeConnector();
		Given.iStartMyUIComponentInViewMode();
		Given.iClearTheSessionLRep();

		// Act
		When.iPressTheAdaptUiButton();

		Then.onPageWithRTA.iShouldSeeTheToolbar();
		Then.onPageWithRTA.iShouldSeeTheElement(sFLVM_ID);
	});

	opaTest("2. check the context menue for Standard variant", function(Given, When, Then) {

		When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);
		Then.onPageWithRTA.iShouldSeetheContextMenu();
		Then.onPageWithRTA.iShouldSeetheContextMenuEntries(["Rename", "Save View", "Save View As", "Manage Views", "Switch Views"]);
	});

	opaTest("3. create new variant and check context menu", function(Given, When, Then) {
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);
		When.onPageWithRTA.iClickOnAContextMenuEntry(2); //save as
		Then.onFlVariantManagement.theOpenSaveViewDialog(sFLVM_ID);

		// Act
		When.onFlVariantManagement.iCreateNewVariant(sFLVM_ID, "KUVariant1", true, true);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "KUVariant1");

		When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);
		Then.onPageWithRTA.iShouldSeetheContextMenu();
		Then.onPageWithRTA.iShouldSeetheContextMenuEntries(["Rename", "Save View", "Save View As", "Manage Views", "Switch Views"]);
	});

	opaTest("4. open Manage views and check content", function(Given, When, Then) {
		When.onPageWithRTA.iRightClickOnAnElementOverlay(sFLVM_ID);

		When.onPageWithRTA.iClickOnAContextMenuEntry(3); //manage views

		Then.onFlVariantManagement.theOpenManageViewsDialog(sFLVM_ID);
		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("KUVariant1");
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KUVariant1"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, true]);
	});

	opaTest("5. unfavoure the KUVariant1, rename KUVariant1 variant, change apply auto and save changes", function(Given, When, Then) {
		When.onFlVariantManagement.iSetFavoriteVariant("KUVariant1", false);
		When.onFlVariantManagement.iRenameVariant("KUVariant1", "KURenameVariant1");
		When.onFlVariantManagement.iApplyAutomaticallyVariant("KURenameVariant1", false);

		// Assertion
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("KURenameVariant1");

		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false]);


		When.onFlVariantManagement.iPressTheManageViewsSave(sFLVM_ID);

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "KURenameVariant1");

		When.onPageWithRTA.iExitRtaMode();
	});


//------------------------------------------------------------------------------

	QUnit.module("Fl Variants end user perso");

	opaTest("1. start the app and check the initial 'My View' content", function(Given, When, Then) {
		// Arrange
		Given.iClearTheSessionLRep();
		//Given.iStartMyUIComponentInViewMode();

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "KURenameVariant1");

		// Act
		When.onFlVariantManagement.iOpenMyView(sFLVM_ID);

		// Assertion
		Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard", "KURenameVariant1"]);
	});

	opaTest("2. create a new variant and check the 'My View' Content", function(Given, When, Then) {
		// Act
		When.onFlVariantManagement.iOpenSaveView(sFLVM_ID);

		// Assertion
		Then.onFlVariantManagement.theOpenSaveViewDialog(sFLVM_ID);

		// Act
		When.onFlVariantManagement.iCreateNewVariant(sFLVM_ID, "OpaVariant1", true, true);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "OpaVariant1");

		When.onFlVariantManagement.iOpenMyView(sFLVM_ID);

		// Assertion
		Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard", "KURenameVariant1", "OpaVariant1"]);

		When.onFlVariantManagement.iOpenMyView(sFLVM_ID); // closes
	});

	opaTest("3. open the 'Manage View' and check content", function(Given, When, Then) {

		// Act
		When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
		When.onFlVariantManagement.iOpenManageViews(sFLVM_ID);

		// Assertion
		Then.onFlVariantManagement.theOpenManageViewsDialog(sFLVM_ID);
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1", "OpaVariant1"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true,  true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false, true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("OpaVariant1");
	});

	opaTest("4. unfavoure the KURenameVariant1, rename OpaVariant1 variant, change apply auto and save changes", function(Given, When, Then) {
		// Act
		When.onFlVariantManagement.iSetFavoriteVariant("KURenameVariant1", false);
		When.onFlVariantManagement.iRenameVariant("OpaVariant1", "OpaRenameVariant1");
		When.onFlVariantManagement.iApplyAutomaticallyVariant("OpaRenameVariant1", false);

		// Assertion
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1", "OpaRenameVariant1"]);

		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, false, true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false, false]);

		When.onFlVariantManagement.iPressTheManageViewsSave(sFLVM_ID);

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "OpaRenameVariant1");
	});

	opaTest("5. check the 'My Views'", function(Given, When, Then) {

		// Act
		When.onFlVariantManagement.iOpenMyView(sFLVM_ID);

		// Assertion
		Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard", "OpaRenameVariant1"]);

		When.onFlVariantManagement.iOpenMyView(sFLVM_ID); // closes
	});

	opaTest("6. reopen the 'Manage View' and check content", function(Given, When, Then) {

		// Act
		When.onFlVariantManagement.iOpenMyView(sFLVM_ID);
		When.onFlVariantManagement.iOpenManageViews(sFLVM_ID);

		// Assertion
		Then.onFlVariantManagement.theOpenManageViewsDialog(sFLVM_ID);
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1", "OpaRenameVariant1"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, false, true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false, false]);
		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("OpaRenameVariant1");
	});

	opaTest("7. remove OpaRenameVariant1 variant and save change", function(Given, When, Then) {

		// Act
		When.onFlVariantManagement.iRemoveVariant("OpaRenameVariant1");

		// Assertion
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "KURenameVariant1"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, false]);
		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("Standard");

		When.onFlVariantManagement.iPressTheManageViewsSave(sFLVM_ID);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(sFLVM_ID, "Standard");
	});

	opaTest("8. check the 'My Views'", function(Given, When, Then) {

		// Act
		When.onFlVariantManagement.iOpenMyView(sFLVM_ID);

		// Assertion
		Then.onFlVariantManagement.theMyViewShouldContain(sFLVM_ID, ["Standard"]);

		When.onFlVariantManagement.iOpenMyView(sFLVM_ID); // closes

		Given.iClearTheSessionLRep();
	});

});