/* globals opaTest */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Action",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion",
	"sap/ui/Device"
], function(Opa5, opaQunit, Arrangement, Action, Assertion, Device) {
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

	//set execution delay for Internet Explorer and Edge
	if (Device.browser.msie || Device.browser.edge) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

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

		When.iClickOnLink("Power Projector 4713");

		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Name Link2 (Superior)"
		]);

		Then.theApplicationURLDoesNotContain("?applicationUnderTest_SemanticObjectName_02#link");

		When.iClickOnLink("Name Link2 (Superior)");
		Then.iShouldSeeAConfirmationDialog();
		When.iCancelTheNavigation();
		Then.theApplicationURLDoesNotContain("?applicationUnderTest_SemanticObjectName_02#link");
		/* Commented this out as it's not stable enough right now
		When.iClickOnLink("Power Projector 4713");
		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeOrderedLinksOnNavigationContainer([
			"Name Link2 (Superior)"
		]);
		When.iClickOnLink("Name Link2 (Superior)");
		Then.iShouldSeeAConfirmationDialog();
		When.iConfirmTheNavigation();
		Then.theApplicationURLContains("?applicationUnderTest_SemanticObjectName_02#link");
		*/
		Then.iTeardownMyAppFrame();
	});

	opaTest("When I click on a Link with exactly one LinkItem and additionalContent I should see the 'More Links' button", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/qunit/link/opa/appUnderTestAdditionalContent/start.html");
		Then.iShouldSeeColumnWithName("Product ID");

		When.iClickOnLink("1239102");
		Then.iShouldSeeNavigationPopoverOpens();
		Then.iShouldSeeOnNavigationPopoverPersonalizationLinkText();

		Then.iTeardownMyAppFrame();
	});
});
