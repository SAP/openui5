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

	const fnCheckLinks = function(Then, mItems) {
		Object.entries(mItems).forEach(function (oEntry) {
			const sLinkText = oEntry[0];
			const oValue = oEntry[1];
			Then.iShouldSeeLinkItemOnPosition(sLinkText, oValue.position);
			Then.iShouldSeeLinkItemWithSelection(sLinkText, oValue.selected);
			Then.iShouldSeeLinkItemAsEnabled(sLinkText, oValue.enabled);
		});
	};

	QUnit.module("", {
		before: function() {
			this.mItems = {
				"1239102": {
					position: 0,
					selected: false,
					enabled: true
				},
				"Review Description": {
					position: 1,
					selected: false,
					enabled: true
				},
				"Edit Description": {
					position: 2,
					selected: false,
					enabled: true
				}
			};
		}
	});

	opaTest("When I look at the screen of appUnderTest, a table with links should appear", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html');
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
		When.onTheMDCLink.iPressTheLink({text: "1239102"});

		Then.onTheMDCLink.iShouldSeeAPopover({text: "1239102"});
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens with disabled 'Restore' button", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();

		Then.thePersonalizationDialogOpens();

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});

	opaTest("When I select the 'Edit Description' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.onTheMDCLink.iPersonalizeTheLinks({text: "1239102"}, [
			"Edit Description"
		]);

		Then.thePersonalizationDialogShouldBeClosed();
		When.iPressOnLinkPersonalizationButton();
		Then.thePersonalizationDialogOpens();

		// Position value doesn't change yet as we have to close the dialog before it takes effect
		this.mItems["Edit Description"].selected = true;
		this.mItems["Edit Description"].position = 0;
		this.mItems["1239102"].position = 1;
		this.mItems["Review Description"].position = 2;

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({text: "1239102"}, [
			"Edit Description"
		]);
	});

	opaTest("When I click on '977700-11' link in the 'Product ID' column, popover should open with link 'Edit Description'", function(Given, When, Then) {
		When.onTheMDCLink.iCloseThePopover();
		When.onTheMDCLink.iPressTheLink({text: "977700-11"});

		Then.onTheMDCLink.iShouldSeeAPopover({text: "977700-11"});
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({text: "977700-11"}, [
			"Edit Description"
		]);
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
	});

	opaTest("When I click on 'More Links' button, the selection dialog opens with a enabled 'Restore' button", function(Given, When, Then) {
		When.iPressOnLinkPersonalizationButton();

		// Delete this entry as we open another link
		delete this.mItems["1239102"];
		this.mItems["977700-11"] = {
			position: 1,
			selected: false,
			enabled: true
		};

		Then.thePersonalizationDialogOpens();

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Ok' button, the dialog should close", function(Given, When, Then) {
		When.iPressOkButton();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({text: "977700-11"}, [
			"Edit Description"
		]);

		Then.iTeardownMyAppFrame();
	});
});
