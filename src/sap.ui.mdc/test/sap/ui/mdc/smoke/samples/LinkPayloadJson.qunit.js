sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Arrangement",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Action",
	"test-resources/sap/ui/mdc/qunit/link/opa/test/Assertion",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(Opa5, opaTest, Arrangement, Action, Assertion, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const oLink0 = { text: "1239102" };
	const oLink1 = { text: "2212-121-828" };
	const oLink2 = { text: "K47322.1" };
	const oLink3 = { text: "214-121-828" };

	opaTest("All links properly visible", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/demokit/sample/LinkPayloadJson/index.html");

		Then.iShouldSeeADisabledLink(oLink0);
		Then.iShouldSeeALink(oLink1);
		Then.iShouldSeeALink(oLink2);
		Then.iShouldSeeALink(oLink3);

		Then.iTeardownMyAppFrame();
	});

	opaTest("First link works", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/demokit/sample/LinkPayloadJson/index.html");

		When.onTheMDCLink.iPressLinkOnPopover(oLink1, "Product");
		Then.iShouldSeeAConfirmationDialog();
		When.iCancelTheNavigation();

		When.onTheMDCLink.iPressLinkOnPopover(oLink1, "Product");
		Then.iShouldSeeAConfirmationDialog();
		When.iConfirmTheNavigation();

		Then.iTeardownMyAppFrame();
	});

	opaTest("Second link works", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/demokit/sample/LinkPayloadJson/index.html");

		When.onTheMDCLink.iPressLinkOnPopover(oLink2, "Product");

		Then.iTeardownMyAppFrame();
	});

	opaTest("Third link works", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/demokit/sample/LinkPayloadJson/index.html");

		When.onTheMDCLink.iPressTheLink(oLink3);
		Then.iShouldSeeAConfirmationDialog();
		When.iCancelTheNavigation();
		When.onTheMDCLink.iCloseThePopover();

		When.onTheMDCLink.iPressTheLink(oLink3);
		Then.iShouldSeeAConfirmationDialog();
		When.iConfirmTheNavigation();

		Then.iTeardownMyAppFrame();
	});
});