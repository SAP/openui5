/* global QUnit, opaTest */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Action",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion",
	"test-resources/sap/ui/mdc/qunit/link/opa/pages/AppUnderTest",
	"test-resources/sap/ui/rta/internal/integration/pages/Adaptation"
], function(Opa5, opaQunit, Arrangement, Action, Assertion) {
	"use strict";

	if (window.blanket) {
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true
	});

	var fnCheckLinks = function(Then, mItems) {
		Object.entries(mItems).forEach(function (oEntry) {
			var sLinkText = oEntry[0];
			var oValue = oEntry[1];
			Then.iShouldSeeLinkItemOnPosition(sLinkText, oValue.position);
			Then.iShouldSeeLinkItemWithSelection(sLinkText, oValue.selected);
			Then.iShouldSeeLinkItemAsEnabled(sLinkText, oValue.enabled);
		});
	};

	QUnit.module("", {
		before: function() {
			this.mItems = {
				"Category Link2 (Superior)": {
					position: 0,
					selected: true,
					enabled: true
				},
				"Category Link3": {
					position: 1,
					selected: false,
					enabled: true
				},
				"Category Link4": {
					position: 2,
					selected: false,
					enabled: true
				},
				"Category Link5": {
					position: 3,
					selected: false,
					enabled: true
				},
				"Category Link6": {
					position: 4,
					selected: false,
					enabled: true
				},
				"Category Link7": {
					position: 5,
					selected: false,
					enabled: true
				},
				"Category Link8": {
					position: 6,
					selected: false,
					enabled: true
				},
				"Category Link9": {
					position: 7,
					selected: false,
					enabled: true
				},
				"Category Link10": {
					position: 8,
					selected: false,
					enabled: true
				},
				"Category Link11": {
					position: 9,
					selected: false,
					enabled: true
				},
				"Category Link12": {
					position: 10,
					selected: false,
					enabled: true
				},
				"FactSheet of Category": {
					position: 11,
					selected: false,
					enabled: true
				}
			};
		}
	});

	opaTest("When I look at the screen of appUnderTest, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html");
		Given.iEnableTheLocalLRep();
		Given.iClearTheLocalStorageFromRtaRestart();

		Then.iShouldSeeStartRtaButton();
		Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
			"Name", "Product ID", "Category"
		]);

		Then.iShouldSeeColumnWithName("Category");
		Then.iShouldSeeColumnWithName("Product ID");

		Then.theCellWithTextIsOfType("1239102", "sap.m.Link");
		Then.theCellWithTextIsOfType("977700-11", "sap.m.Link");
		Then.theCellWithTextIsOfType("Projector", "sap.m.Link");
	});

	opaTest("When I start RTA, the Runtime Adaptation mode should open", function(Given, When, Then) {
		When.onTheAppUnderTest.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("applicationUnderTest---IDView--MyApp");
		Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("applicationUnderTest---IDView--MyApp");
	});

	// ------------------------------------------------------
	// Test: deselect an item and restore
	// ------------------------------------------------------
	opaTest("When I right click on 'Projector' link in the 'Category' column, a context menu should open", function(Given, When, Then) {
		When.onTheAppUnderTest.iOpenContextMenuOfLink("Projector");
		Then.onPageWithRTA.iShouldSeetheContextMenu();
	});
	opaTest("When I click on 'Settings' in the context menu, selection dialog should open", function(Given, When, Then) {
		When.onPageWithRTA.iClickOnAContextMenuEntryWithText("More Links");

		Then.thePersonalizationDialogOpens();

		fnCheckLinks(Then, this.mItems);
	});
	opaTest("When I deselect the 'Category Link2' item, the item should be deselected", function(Given, When, Then) {
		When.iSelectLink("Category Link2 (Superior)");

		this.mItems["Category Link2 (Superior)"].selected = false;

		fnCheckLinks(Then, this.mItems);
	});
	opaTest("When I press 'OK' and then 'Save & Exit' button the RTA mode should finish", function(Given, When, Then) {
		When.iPressOkButton();
		Then.thePersonalizationDialogShouldBeClosed();

		When.onPageWithRTA.iExitRtaMode();
		Then.theRtaModeShouldBeClosed().and.theApplicationIsLoaded("applicationUnderTest---IDView--MyApp");

		Then.iTeardownMyAppFrame();
	});

	opaTest("When I start the app again, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html");

		Then.iShouldSeeStartRtaButton();
		Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
			"Name", "Product ID", "Category"
		]);
		Then.iShouldSeeColumnWithName("Name");
		Then.iShouldSeeColumnWithName("Product ID");
		Then.iShouldSeeColumnWithName("Category");

		Then.iTeardownMyAppFrame();
	});

	/* Deactivated due to instability based on missing RTA page object functions.
	opaTest("When I start RTA, the Runtime Adaptation mode should open", function(Given, When, Then) {
		When.onTheAppUnderTest.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("applicationUnderTest---IDView--MyApp");
		Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("applicationUnderTest---IDView--MyApp");
	});
	opaTest("When I right click on 'Projector' link in the 'Category' column, a context menu should open", function(Given, When, Then) {
		When.onTheAppUnderTest.iOpenContextMenuOfLink("Projector");
		Then.onPageWithRTA.iShouldSeetheContextMenu();
	});
	opaTest("When I click on 'Settings' in the context menu, selection dialog should open", function(Given, When, Then) {
		When.onPageWithRTA.iClickOnAContextMenuEntryWithText("More Links");

		Then.thePersonalizationDialogOpens();

		fnCheckLinks(Then, this.mItems);
	});

	// ------------------------------------------------------
	// Test: deselect one, select another item and restore
	// ------------------------------------------------------

	opaTest("When I select 'Category Link4', the selection should be changed", function(Given, When, Then) {
		When.iSelectLink("Category Link4");

		this.mItems["Category Link4"].selected = true;

		fnCheckLinks(Then, this.mItems);
	});
	opaTest("When I press 'OK' and then 'Restore' button and confirm the warning dialog, the RTA mode should finish", function(Given, When, Then) {
		When.iPressOkButton();
		Then.thePersonalizationDialogShouldBeClosed();

		When.iPressOnRtaResetButton();

		this.mItems["Category Link2 (Superior)"].selected = true;
		this.mItems["Category Link4"].selected = false;

		Then.theApplicationIsLoaded("applicationUnderTest---IDView--MyApp");
		When.onPageWithRTA.iExitRtaMode();

		Then.iTeardownMyAppFrame();
	});
	opaTest("When I start the app again, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html");

		Then.iShouldSeeStartRtaButton();
		Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
			"Name", "Product ID", "Category"
		]);
		Then.iShouldSeeColumnWithName("Name");
		Then.iShouldSeeColumnWithName("Product ID");
		Then.iShouldSeeColumnWithName("Category");
	});
	opaTest("When I start RTA, the Runtime Adaptation mode should open", function(Given, When, Then) {
		When.onTheAppUnderTest.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("applicationUnderTest---IDView--MyApp");
		Then.onPageWithRTA.iShouldSeeTheToolbar().and.iShouldSeeTheOverlayForTheApp("applicationUnderTest---IDView--MyApp");
	});
	opaTest("When I right click on 'Projector' link in the 'Category' column, a context menu should open", function(Given, When, Then) {
		When.onTheAppUnderTest.iOpenContextMenuOfLink("Projector");
		Then.onPageWithRTA.iShouldSeetheContextMenu();
	});
	opaTest("When I click on 'Settings' in the context menu, selection dialog should open", function(Given, When, Then) {
		When.onPageWithRTA.iClickOnAContextMenuEntryWithText("More Links");

		Then.thePersonalizationDialogOpens();

		fnCheckLinks(Then, this.mItems);
	});
	opaTest("When I click on 'OK' button, selection dialog should close", function(Given, When, Then) {
		When.iPressOkButton();
		Then.thePersonalizationDialogShouldBeClosed();

		Then.iTeardownMyAppFrame();
	});
	*/
});
