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
	});

	// ------------------------------------------------------
	// Test: select an item for one link and check that this item is shown also for another link
	// ------------------------------------------------------
	opaTest("When I click on '1239102' link in the 'Product ID' column, popover should open with no links", function(Given, When, Then) {
		When.iClickOnLink("1239102");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens with disabled 'Restore' button", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("1239102", 0);
		Then.iShouldSeeLinkItemWithSelection("1239102", false);
		Then.iShouldSeeLinkItemAsEnabled("1239102", true);

		Then.iShouldSeeLinkItemOnPosition("Review Description", 1);
		Then.iShouldSeeLinkItemWithSelection("Review Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Review Description", true);

		Then.iShouldSeeLinkItemOnPosition("Edit Description", 2);
		Then.iShouldSeeLinkItemWithSelection("Edit Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Edit Description", true);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});

	opaTest("When I select the 'Edit Description' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.iSelectLink("Edit Description");

		Then.iShouldSeeLinkItemOnPosition("1239102", 0);
		Then.iShouldSeeLinkItemWithSelection("1239102", false);
		Then.iShouldSeeLinkItemAsEnabled("1239102", true);

		Then.iShouldSeeLinkItemOnPosition("Review Description", 1);
		Then.iShouldSeeLinkItemWithSelection("Review Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Review Description", true);

		Then.iShouldSeeLinkItemOnPosition("Edit Description", 2);
		Then.iShouldSeeLinkItemWithSelection("Edit Description", true);
		Then.iShouldSeeLinkItemAsEnabled("Edit Description", true);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Edit Description"
		]);
	});

	opaTest("When I click on '977700-11' link in the 'Product ID' column, popover should open with link 'Edit Description'", function(Given, When, Then) {
		Given.closeAllNavigationPopovers();
		When.iClickOnLink("977700-11");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Edit Description"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens with a enabled 'Restore' button", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeLinkItemOnPosition("977700-11", 0);
		Then.iShouldSeeLinkItemWithSelection("977700-11", false);
		Then.iShouldSeeLinkItemAsEnabled("977700-11", true);

		Then.iShouldSeeLinkItemOnPosition("Review Description", 1);
		Then.iShouldSeeLinkItemWithSelection("Review Description", false);
		Then.iShouldSeeLinkItemAsEnabled("Review Description", true);

		Then.iShouldSeeLinkItemOnPosition("Edit Description", 2);
		Then.iShouldSeeLinkItemWithSelection("Edit Description", true);
		Then.iShouldSeeLinkItemAsEnabled("Edit Description", true);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Edit Description"
		]);

		Then.iTeardownMyAppFrame();
	});
});
