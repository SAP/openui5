/* globals opaTest */

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement',
	'test-resources/sap/ui/mdc/qunit/link/opa/test/Action',
	'test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary'
], function(Opa5, opaQunit, Arrangement, Action, Assertion, testLibrary) {
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

	opaTest("When I look at the screen of appUnderTest, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html');
		Given.iClearTheLocalStorageFromRtaRestart();

		Then.iShouldSeeStartRtaButton();
		Then.iShouldSeeVisibleColumnsInOrder("sap.m.Column", [
			"Name", "Product ID", "Category"
		]);
		Then.iShouldSeeColumnWithName("Name");
		Then.iShouldSeeColumnWithName("Product ID");
		Then.iShouldSeeColumnWithName("Category");

		Then.theCellWithTextIsOfType("Power Projector 4713", "sap.m.Link");
		Then.theCellWithTextIsOfType("Flat S", "sap.m.Link");
		Then.theCellWithTextIsOfType("1239102", "sap.m.Link");
		Then.theCellWithTextIsOfType("Laptop", "sap.m.Link");
	});

	opaTest("When I click on 'Power Projector 4713' link in the 'Name' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		When.onTheMDCLink.iPressTheLink({ text: "Power Projector 4713" });

		Then.onTheMDCLink.iShouldSeeAPopover({ text: "Power Projector 4713" });
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'Flat S' link in the 'Name' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		When.onTheMDCLink.iCloseThePopover();
		When.onTheMDCLink.iPressTheLink({ text: "Flat S" });

		Then.onTheMDCLink.iShouldSeeAPopover({ text: "Flat S" });
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		When.iPressOkButton();
		Then.thePersonalizationDialogShouldBeClosed();

		Then.onTheMDCLink.theResetButtonIsEnabled({ text: "Flat S" }, false);
		When.iPressOkButton();
		Then.thePersonalizationDialogShouldBeClosed();
	});

	opaTest("When I click on '1239102' link in the 'Product ID' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		When.onTheMDCLink.iCloseThePopover();
		When.onTheMDCLink.iPressTheLink({ text: "1239102" });

		Then.onTheMDCLink.iShouldSeeAPopover({ text: "1239102" });
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I add a the link 'Review Description' and click on it, I navigate to the internalHref property of that link.", function(Given, When, Then) {
		When.onTheMDCLink.iCloseThePopover();

		When.onTheMDCLink.iPersonalizeTheLinks({ text: "1239102" }, ["Review Description"]);

		When.onTheMDCLink.iPressTheLink({ text: "1239102" });
		Then.onTheMDCLink.iShouldSeeAPopover({ text: "1239102" });

		When.onTheMDCLink.iPressTheLink({ text: "Review Description" });
		Then.theApplicationURLContains("#internalLink01");
	});

	opaTest("When I click on 'Laptop' link in the 'Category' column, popover should open with main link and with link personalization button", function(Given, When, Then) {
		When.onTheMDCLink.iCloseThePopover();
		When.onTheMDCLink.iPressTheLink({ text: "Laptop" });

		Then.onTheMDCLink.iShouldSeeAPopover({ text: "Laptop" });
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		When.onTheMDCLink.iCloseThePopover();
		Then.iTeardownMyAppFrame();
	});

	opaTest("When I click on 'Flat S' link in the 'Name' column and click 'Select all Links' in the selection dialog I should see all links on the popup", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html');

		When.onTheMDCLink.iPressTheLink({ text: "Flat S" });

		Then.onTheMDCLink.iShouldSeeAPopover({ text: "Flat S" });
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		When.iSelectAllLinks(true);
		When.iPressOkButton();

		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ text: "Flat S" }, [
			"FactSheet of Name",
			"Name Link2 (Superior)",
			"Name Link3"
		]);
		Then.onTheMDCLink.theResetButtonIsEnabled({ text: "Flat S" }, true);
	});

	opaTest("When I click on 'Flat S' link in the 'Name' column and deselect 'Select all Links' in the selection dialog I should see no links on the popup", function(Given, When, Then) {
		When.onTheMDCLink.iCloseThePopover();
		When.onTheMDCLink.iPressTheLink({ text: "Flat S" });

		Then.onTheMDCLink.iShouldSeeAPopover({ text: "Flat S" });
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		When.iSelectAllLinks(false);
		When.iPressOkButton();

		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ text: "Flat S" }, []);
		Then.iTeardownMyAppFrame();
	});

});
