/* globals opaTest */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Action",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(Opa5, opaQunit, Arrangement, Action, Assertion, testLibrary) {
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

	opaTest("When I click on a Link with 'beforeNavigationCallback', I should see a popup to confirm the navigation", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/qunit/link/opa/appUnderTest/start.html");

		Given.iEnableTheLocalLRep();
		Given.iClearTheLocalStorageFromRtaRestart();

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

		When.onTheMDCLink.iPressTheLink({text: "Power Projector 4713"});

		Then.onTheMDCLink.iShouldSeeAPopover({text: "Power Projector 4713"});
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({text: "Power Projector 4713"}, [
			"Name Link2 (Superior)"
		]);

		Then.theApplicationURLDoesNotContain("?applicationUnderTest_SemanticObjectName_02#link");

		When.onTheMDCLink.iPressTheLink({text: "Name Link2 (Superior)"});
		Then.iShouldSeeAConfirmationDialog();
		When.iCancelTheNavigation();
		Then.theApplicationURLDoesNotContain("?applicationUnderTest_SemanticObjectName_02#link");
		/* Commented this out as it's not stable enough right now
		When.onTheMDCLink.iPressTheLink({text: "Power Projector 4713"});
		Then.thePersonalizationDialogShouldBeClosed();
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({text: "Power Projector 4713"}, [
			"Name Link2 (Superior)"
		]);
		When.onTheMDCLink.iPressTheLink({text: "Name Link2 (Superior)"});
		Then.iShouldSeeAConfirmationDialog();
		When.iConfirmTheNavigation();
		Then.theApplicationURLContains("?applicationUnderTest_SemanticObjectName_02#link");
		*/
		Then.iTeardownMyAppFrame();
	});

	opaTest("When I click on a Link with exactly one LinkItem and additionalContent I should see the 'More Links' button", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/qunit/link/opa/appUnderTestAdditionalContent/start.html");
		Then.iShouldSeeColumnWithName("Product ID");

		When.onTheMDCLink.iPressTheLink({text: "1239102"});
		Then.onTheMDCLink.iShouldSeeAPopover({text: "1239102"});
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		Then.iTeardownMyAppFrame();
	});
});
