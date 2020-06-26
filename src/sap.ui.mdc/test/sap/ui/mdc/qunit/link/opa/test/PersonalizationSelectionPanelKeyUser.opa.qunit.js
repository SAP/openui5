/* globals opaTest */

sap.ui.define([
	'sap/ui/test/Opa5', 'sap/ui/test/opaQunit', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Action', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion', 'sap/ui/Device'
], function(Opa5, opaQunit, Arrangement, Action, Assertion, Device) {
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

	//set execution delay for Internet Explorer and Edge
	if (Device.browser.msie || Device.browser.edge) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

	opaTest("When I look at the screen of appUnderTest, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html');
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

		Then.iTeardownMyAppFrame();
	});

	// opaTest("When I start RTA, the Runtime Adaptation mode should open", function(Given, When, Then) {
	// 	When.iPressOnStartRtaButton().and.iWaitUntilTheBusyIndicatorIsGone("applicationUnderTest---IDView--myApp");
	// 	Then.iShouldSeeTheRtaToolbar().and.iShouldSeeTheRtaOverlayForTheViewId("applicationUnderTest---IDView--myApp");
	// });
	//
	// // ------------------------------------------------------
	// // Test: deselect an item and restore
	// // ------------------------------------------------------
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
	// opaTest("When I deselect the 'Category Link2' item, the item should be deselected", function(Given, When, Then) {
	// 	When.iSelectLink("Category Link2 (Superior)");
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link2 (Superior)", 0);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link2 (Superior)", false);
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
	// opaTest("When I press 'OK' and then 'Restore' button and confirm the warning dialog, the RTA mode should finish", function(Given, When, Then) {
	// 	When.iPressOkButton();
	// 	Then.thePersonalizationDialogShouldBeClosed();
	//
	// 	When.iPressOnRtaResetButton();
	// 	Then.theRtaModeShouldBeClosed().and.theApplicationIsLoaded("applicationUnderTest---IDView--myApp");
	//
	// 	Then.iTeardownMyAppFrame();
	// });
	//
	// opaTest("When I start the app again, a table with links should appear", function(Given, When, Then) {
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
	//
	// // ------------------------------------------------------
	// // Test: deselect one, select another item and restore
	// // ------------------------------------------------------
	//
	// opaTest("When I deselect the 'Category Link2' item and select 'Category Link4', the selection should be changed", function(Given, When, Then) {
	// 	When.iSelectLink("Category Link2 (Superior)");
	// 	When.iSelectLink("Category Link4");
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link2 (Superior)", 0);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link2 (Superior)", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link2 (Superior)", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link3", 1);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link3", false);
	// 	Then.iShouldSeeLinkItemAsEnabled("Category Link3", false);
	//
	// 	Then.iShouldSeeLinkItemOnPosition("Category Link4", 2);
	// 	Then.iShouldSeeLinkItemWithSelection("Category Link4", true);
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
	// opaTest("When I press 'OK' and then 'Restore' button and confirm the warning dialog, the RTA mode should finish", function(Given, When, Then) {
	// 	When.iPressOkButton();
	// 	Then.thePersonalizationDialogShouldBeClosed();
	//
	// 	When.iPressOnRtaResetButton();
	// 	Then.theRtaModeShouldBeClosed().and.theApplicationIsLoaded("applicationUnderTest---IDView--myApp");
	//
	// 	Then.iTeardownMyAppFrame();
	// });
	// opaTest("When I start the app again, a table with links should appear", function(Given, When, Then) {
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
	// opaTest("When I click on 'OK' button, selection dialog should close", function(Given, When, Then) {
	// 	When.iPressOkButton();
	// 	Then.thePersonalizationDialogShouldBeClosed();
	//
	// 	Then.iTeardownMyAppFrame();
	// });
});
