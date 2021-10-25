/* global QUnit, opaTest */

sap.ui.define([
	'sap/ui/test/Opa5', 'sap/ui/test/opaQunit', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Action', 'test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion'
], function(Opa5, opaQunit, Arrangement, Action, Assertion) {
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

	QUnit.module("", {
		before: function() {
			this.mItems = {
				"Name Link2 (Superior)": {
					position: 0,
					selected: true,
					enabled: true
				},
				"Name Link3": {
					position: 1,
					selected: false,
					enabled: true
				},
				"FactSheet of Name": {
					position: 2,
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

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});

	opaTest("When I deselect the 'Name Link2 (Superior)' item and select the 'FactSheet of Name' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.iSelectLink("Name Link2 (Superior)");
		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);

		When.iSelectLink("FactSheet of Name");
		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);

		// Position value doesn't change yet as we have to close the dialog before it takes effect
		this.mItems["Name Link2 (Superior)"].selected = false;
		this.mItems["FactSheet of Name"].selected = true;

		fnCheckLinks(Then, this.mItems);
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

		// Change the position value as we open the dialog again
		this.mItems["FactSheet of Name"].position = 0;
		this.mItems["Name Link2 (Superior)"].position = 1;
		this.mItems["Name Link3"].position = 2;

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Restore' and then 'OK' button, popover should show previous link selection again", function(Given, When, Then) {
		When.iPressRestoreButton().and.iPressOkButtonOnTheWarningDialog();

		// Change the position value as we reset the personalization
		this.mItems["Name Link2 (Superior)"].selected = true;
		this.mItems["Name Link2 (Superior)"].position = 0;
		this.mItems["Name Link3"].position = 1;
		this.mItems["FactSheet of Name"].selected = false;
		this.mItems["FactSheet of Name"].position = 2;

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

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(false);
	});

	opaTest("When I select the 'FactSheet of Name' item, the 'Restore' button should be enabled", function(Given, When, Then) {
		When.iSelectLink("FactSheet of Name");
		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);

		this.mItems["FactSheet of Name"].selected = true;

		fnCheckLinks(Then, this.mItems);

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

		// Change the position value as we open the dialog again
		this.mItems["FactSheet of Name"].position = 0;
		this.mItems["Name Link2 (Superior)"].position = 1;
		this.mItems["Name Link3"].position = 2;

		fnCheckLinks(Then, this.mItems);

		Then.iShouldSeeRestoreButtonWhichIsEnabled(true);
	});

	opaTest("When I press 'Restore' then select 'FactSheet of Name' again and then 'OK' button, popover should show the same link selection again", function(Given, When, Then) {
		When.iPressRestoreButton().and.iPressOkButtonOnTheWarningDialog();
		Then.thePersonalizationDialogShouldBeClosed();

		When.iPressOnLinkPersonalizationButton();
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
