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
		Then.iShouldSeeColumnWithName("Name");
		Then.theCellWithTextIsOfType("Gladiator MX", "sap.m.Link");
	});

	// ------------------------------------------------------
	// Test: select an item and restore
	// ------------------------------------------------------
	opaTest("When I click on 'Gladiator MX' link in the 'Name' column, popover should open with initiallyVisible link", function(Given, When, Then) {
		When.iClickOnLink("Gladiator MX");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Name Link2 (Superior)"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("FactSheet of Name", 0);
		Then.iShouldSeeLinkItemWithSelection("FactSheet of Name", false);
		Then.iShouldSeeLinkItemAsEnabled("FactSheet of Name", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", true);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 2);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});

	opaTest("When I deselect the 'Name Link2 (Superior)' item and select the 'FactSheet of Name' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.iSelectLink("Name Link2 (Superior)");
		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);

		When.iSelectLink("FactSheet of Name");
		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);

		Then.iShouldSeeLinkItemOnPosition("FactSheet of Name", 0);
		Then.iShouldSeeLinkItemWithSelection("FactSheet of Name", true);
		Then.iShouldSeeLinkItemAsEnabled("FactSheet of Name", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 2);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);
	});

	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"FactSheet of Name"
		]);
	});

	opaTest("When I click on 'Flat Medium' link in the 'Name' column, popover should open", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("Flat Medium");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"FactSheet of Name"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("FactSheet of Name", 0);
		Then.iShouldSeeLinkItemWithSelection("FactSheet of Name", true);
		Then.iShouldSeeLinkItemAsEnabled("FactSheet of Name", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 2);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Restore' and then 'OK' button, popover should show previous link selection again", function(Given, When, Then) {
		When.iPressRestoreButton();
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Name Link2 (Superior)"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		Given.closeAllNavigationPopovers();
		Then.iTeardownMyAppFrame();
	});

	opaTest("When I click on 'Gladiator MX' link in the 'Name' column, popover should open with initiallyVisible link", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html');
		Given.iEnableTheLocalLRep();
		Given.iClearTheLocalStorageFromRtaRestart();

		When.iClickOnLink("Gladiator MX");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Name Link2 (Superior)"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("FactSheet of Name", 0);
		Then.iShouldSeeLinkItemWithSelection("FactSheet of Name", false);
		Then.iShouldSeeLinkItemAsEnabled("FactSheet of Name", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", true);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 2);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});

	opaTest("When I select the 'FactSheet of Name' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.iSelectLink("FactSheet of Name");
		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);

		Then.iShouldSeeLinkItemOnPosition("FactSheet of Name", 0);
		Then.iShouldSeeLinkItemWithSelection("FactSheet of Name", true);
		Then.iShouldSeeLinkItemAsEnabled("FactSheet of Name", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", true);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 2);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"FactSheet of Name",
			"Name Link2 (Superior)"
		]);
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("FactSheet of Name", 0);
		Then.iShouldSeeLinkItemWithSelection("FactSheet of Name", true);
		Then.iShouldSeeLinkItemAsEnabled("FactSheet of Name", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link2 (Superior)", 1);
		Then.iShouldSeeLinkItemWithSelection("Name Link2 (Superior)", true);
		Then.iShouldSeeLinkItemAsEnabled("Name Link2 (Superior)", true);

		Then.iShouldSeeLinkItemOnPosition("Name Link3", 2);
		Then.iShouldSeeLinkItemWithSelection("Name Link3", false);
		Then.iShouldSeeLinkItemAsEnabled("Name Link3", true);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Restore' then select 'FactSheet of Name' again and then 'OK' button, popover should show the same link selection again", function(Given, When, Then) {
		When.iPressRestoreButton();
		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
		When.iSelectLink("FactSheet of Name");
		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"FactSheet of Name",
			"Name Link2 (Superior)"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		Given.closeAllNavigationPopovers();
		Then.iTeardownMyAppFrame();
	});
});
