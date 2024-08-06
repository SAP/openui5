/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"sap/ui/mdc/LinkIntegrationTesting/appUnderTestPageObject/pages/App"
], function(
	Opa5,
	opaTest,
	TestLibrary,
	App
) {
	"use strict";

	const sLinkId = "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner";
	const oLinkIdentifier = { id: sLinkId };

	Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,

		arrangements: {
			iClearTheLocalStorageFromRtaRestart: function() {
				window.localStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
				window.localStorage.removeItem("sap.ui.rta.restart.USER");
				localStorage.clear();
			}
		}
	});

	opaTest("Start App and test 'iPressTheLink' and 'iCloseThePopover'", function(Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/link/appUnderTestPageObject/index.html");
		Given.iClearTheLocalStorageFromRtaRestart();

		When.onTheMDCLink.iPressTheLink(oLinkIdentifier);
		Then.onAppUnderTestPageObject.iShouldSeeAnOpenPopover(oLinkIdentifier);

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover(oLinkIdentifier);
	});

	opaTest("Test 'iPressTheLink', 'iShouldSeeAPopover' and 'iShouldSeeLinksOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPressTheLink(oLinkIdentifier);

		Then.onTheMDCLink.iShouldSeeAPopover(oLinkIdentifier);
		Then.onTheMDCLink.iShouldSeeLinksOnPopover(oLinkIdentifier, []);

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover(oLinkIdentifier);
	});

	opaTest("Test 'iPersonalizeTheLinks' and 'iShouldSeeLinksOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPersonalizeTheLinks(oLinkIdentifier, ["TextLinkItem00", "TextLinkItem01", "TextLinkItem02"]);

		When.onTheMDCLink.iPressTheLink(oLinkIdentifier);

		Then.onTheMDCLink.iShouldSeeAPopover(oLinkIdentifier);
		Then.onTheMDCLink.iShouldSeeLinksOnPopover(oLinkIdentifier, ["TextLinkItem00", "TextLinkItem01", "TextLinkItem02"]);
	});

	opaTest("Test 'iPressLinkOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPressLinkOnPopover(oLinkIdentifier, "TextLinkItem01");

		Then.onAppUnderTestPageObject.theApplicationURLContains("#internalLink01");

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover(oLinkIdentifier);
	});

	opaTest("Test 'iResetThePersonalization'", function(Given, When, Then) {
		When.onTheMDCLink.iResetThePersonalization(oLinkIdentifier);

		When.onTheMDCLink.iPressTheLink(oLinkIdentifier);
		Then.onTheMDCLink.iShouldSeeAPopover(oLinkIdentifier);
		Then.onTheMDCLink.iShouldSeeLinksOnPopover(oLinkIdentifier, []);

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover(oLinkIdentifier);
		Then.iTeardownMyAppFrame();
	});

});