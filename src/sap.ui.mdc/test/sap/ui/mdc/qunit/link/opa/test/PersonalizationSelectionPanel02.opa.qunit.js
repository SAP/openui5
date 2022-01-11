/* global QUnit, opaTest */

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement',
	'test-resources/sap/ui/mdc/qunit/link/opa/test/Action',
	'test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary'
], function(Opa5, opaQunit, Arrangement, Action, Assertion, testlibrary) {
	'use strict';

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

	// ----------------------------------------------
	// Test scenario:
	//  t   Key-User   End-User   Result
	// ----------------------------------------------
	//  0                         L2 (superior link)
	// ----------------------------------------------
	//  1               L3 on     L2 (superior link)
	//                            L3
	// ----------------------------------------------
	//  2               L3 off    L2 (superior link)
	// ----------------------------------------------
	//  3   L2 off,
	//      L3 on                  ----
	// ----------------------------------------------
	//  4               L4 on     L4 on
	// ----------------------------------------------
	//  5              Restore,
	//                  L4 on     L3 on
	//                            L4 on
	// ----------------------------------------------

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
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html');
		Given.iEnableTheLocalLRep();
		Given.iClearTheLocalStorageFromRtaRestart();

		Then.iShouldSeeStartRtaButton();
		Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
			"Name", "Product ID", "Category"
		]);
		Then.iShouldSeeColumnWithName("Category");
		Then.theCellWithTextIsOfType("Projector", "sap.m.Link");
	});

	opaTest("When I click on 'Projector' link in the 'Category' column, popover should open with main link", function(Given, When, Then) {
		When.onTheMDCLink.iPressTheLink({text: "Projector"});

		Then.onTheMDCLink.iShouldSeeAPopover({text: "Projector"});
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();

		Then.thePersonalizationDialogOpens();

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
		When.iPressOkButton();
	});

	opaTest("When I deselect the 'Category Link2 (Superior)' and select the 'Category Link3' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.onTheMDCLink.iPersonalizeTheLinks({text: "Projector"}, [
			"Category Link3"
		]);
		Then.thePersonalizationDialogShouldBeClosed();

		Then.onTheMDCLink.iShouldSeeLinksOnPopover({text: "Projector"}, [
			"Category Link3"
		]);

		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		// Position values don't change yet as we have to close the dialog before it takes effect
		this.mItems["Category Link2 (Superior)"].selected = false;
		this.mItems["Category Link3"].selected = true;
		this.mItems["Category Link2 (Superior)"].position = 1;
		this.mItems["Category Link3"].position = 0;

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
	});

	opaTest("When I select the 'Category Link2 (Superior)' and deselect the 'Category Link3' item, the 'Restore' button should be disabled", function(Given, When, Then) {
		When.onTheMDCLink.iPersonalizeTheLinks({text: "Projector"}, [
			"Category Link2 (Superior)"
		]);
		Then.thePersonalizationDialogShouldBeClosed();

		Then.onTheMDCLink.iShouldSeeLinksOnPopover({text: "Projector"}, [
			"Category Link2 (Superior)"
		]);

		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		// Position values don't change yet as we have to close the dialog before it takes effect
		this.mItems["Category Link2 (Superior)"].selected = true;
		this.mItems["Category Link3"].selected = false;
		this.mItems["Category Link2 (Superior)"].position = 0;
		this.mItems["Category Link3"].position = 1;

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});

	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();

		When.onTheMDCLink.iCloseThePopover();

		Then.iTeardownMyAppFrame();
	});

	// opaTest("When I start RTA, the Runtime Adaptation mode should open", function(Given, When, Then) {
	// 	When.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("applicationUnderTest---IDView--myApp");
	// 	Then.iShouldSeeTheRtaToolbar().and.iShouldSeeTheRtaOverlayForTheViewId("applicationUnderTest---IDView--myApp");
	// });
	// opaTest("When I right click on 'Projector' link in the 'Category' column, a context menu should open", function(Given, When, Then) {
	// 	When.iRightClickOnLinkInElementOverlay("Projector");
	// 	Then.theContextMenuOpens();
	// });
	// opaTest("When I click on 'Settings' in the context menu, selection dialog should open", function(Given, When, Then) {
	// 	When.iPressOnSettingsOfContextMenu();
	//
	// 	Then.thePersonalizationDialogOpens();
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link2 (Superior)", 0);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link2 (Superior)", true);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link2 (Superior)", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link3", 1);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link3", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link3", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link4", 2);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link4", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link4", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link5", 3);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link5", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link5", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link6", 4);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link6", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link6", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link7", 5);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link7", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link7", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link8", 6);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link8", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link8", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link9", 7);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link9", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link9", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link10", 8);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link10", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link10", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link11", 9);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link11", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link11", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link12", 10);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link12", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link12", false);
	// });
	// opaTest("When I deselect 'Category Link2' and select the 'Category Link3' item, the selection should be changed", function(Given, When, Then) {
	// 	When.iSelectLink("Category Link2 (Superior)");
	// 	When.iSelectLink("Category Link3");
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link2 (Superior)", 0);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link2 (Superior)", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link2 (Superior)", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link3", 1);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link3", true);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link3", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link4", 2);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link4", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link4", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link5", 3);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link5", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link5", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link6", 4);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link6", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link6", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link7", 5);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link7", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link7", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link8", 6);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link8", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link8", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link9", 7);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link9", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link9", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link10", 8);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link10", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link10", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link11", 9);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link11", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link11", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link12", 10);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link12", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link12", false);
	// });
	// opaTest("When I press 'OK' button, the personalization dialog should close", function(Given, When, Then) {
	// 	When.iPressOkButton();
	// 	Then.thePersonalizationDialogShouldBeClosed();
	// });
	// opaTest("When I press 'Save & Exit' button, the RTA mode should finish", function(Given, When, Then) {
	// 	When.iPressOnRtaSaveButton(true);
	// 	Then.theRtaModeShouldBeClosed();
	// 	// When.iWaitUntilTheBusyIndicatorIsGone("applicationUnderTest---IDView--myApp");
	// 	// Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
	// 	// 	"Name", "Product ID", "Category"
	// 	// ]);
	// });
	// opaTest("I have to restart the app", function(Given, When, Then) {
	// 	Then.iTeardownMyAppFrame();
	// 	Given.iStartMyAppInAFrame('../../navpopover/applicationUnderTest/start.html');
	//
	// 	Then.iShouldSeeStartRtaButton();
	// 	Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
	// 		"Name", "Product ID", "Category"
	// 	]);
	// 	Then.iShouldSeeColumnWithName("Name");
	// 	Then.iShouldSeeColumnWithName("Product ID");
	// 	Then.iShouldSeeColumnWithName("Category");
	// });
	// opaTest("When I click on 'Projector' link in the 'Category' column, popover should open with one 'superior action' link", function(Given, When, Then) {
	// 	When.onTheMDCLink.iPressTheLink({text: "Projector"});
	//
	// 	Then.onTheMDCLink.iShouldSeeAPopover({text: "Projector"});
	// 	Then.iShouldSeeOrderedLinksOnNavigationContainer([]);
	// 	Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	// });
	// opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
	// 	When.iPressOnLinkPersonalizationButton();
	//
	// 	Then.thePersonalizationDialogOpens();
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link2 (Superior)", 0);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link2 (Superior)", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link2 (Superior)", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link3", 1);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link3", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link3", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link4", 2);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link4", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link4", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link5", 3);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link5", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link5", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link6", 4);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link6", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link6", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link7", 5);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link7", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link7", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link8", 6);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link8", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link8", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link9", 7);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link9", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link9", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link10", 8);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link10", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link10", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link11", 9);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link11", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link11", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link12", 10);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link12", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link12", true);
	//
	// 	Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	// });
	// opaTest("When I select the 'Category Link4' item, the item should be selected", function(Given, When, Then) {
	// 	When.iSelectLink("Category Link4");
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link2 (Superior)", 0);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link2 (Superior)", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link2 (Superior)", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link3", 1);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link3", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link3", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link4", 2);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link4", true);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link4", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link5", 3);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link5", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link5", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link6", 4);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link6", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link6", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link7", 5);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link7", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link7", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link8", 6);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link8", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link8", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link9", 7);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link9", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link9", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link10", 8);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link10", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link10", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link11", 9);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link11", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link11", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link12", 10);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link12", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link12", true);
	//
	// 	Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	// });
	// opaTest("When I press 'Restore' button and select an item, the 'Restore' button should be enabled", function(Given, When, Then) {
	// 	When.iPressRestoreButton().and.iSelectLink("Category Link4");
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link2 (Superior)", 0);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link2 (Superior)", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link2 (Superior)", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link3", 1);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link3", true);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link3", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link4", 2);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link4", true);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link4", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link5", 3);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link5", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link5", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link6", 4);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link6", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link6", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link7", 5);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link7", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link7", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link8", 6);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link8", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link8", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link9", 7);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link9", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link9", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link10", 8);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link10", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link10", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link11", 9);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link11", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link11", true);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link12", 10);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link12", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link12", true);
	//
	// 	Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	// });
	// opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
	// 	When.iPressOkButton();
	//
	// 	Then.thePersonalizationDialogShouldBeClosed();
	// 	Then.iShouldSeeOrderedLinksOnNavigationContainer([
	// 		"Category Link3", "Category Link4"
	// 	]);
	//
	// 	Then.iTeardownMyAppFrame();
	// });
});
