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

		When.onTheMDCLink.iPressTheLink({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
		Then.onAppUnderTestPageObject.iShouldSeeAnOpenPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
	});

	opaTest("Test 'iPressTheLink', 'iShouldSeeAPopover' and 'iShouldSeeLinksOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPressTheLink({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });

		Then.onTheMDCLink.iShouldSeeAPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" }, []);

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
	});

	opaTest("Test 'iPersonalizeTheLinks' and 'iShouldSeeLinksOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPersonalizeTheLinks({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" }, ["TextLinkItem00", "TextLinkItem01", "TextLinkItem02"]);

		When.onTheMDCLink.iPressTheLink({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });

		Then.onTheMDCLink.iShouldSeeAPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" }, ["TextLinkItem00", "TextLinkItem01", "TextLinkItem02"]);
	});

	opaTest("Test 'iPressLinkOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPressLinkOnPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" }, "TextLinkItem01");

		Then.onAppUnderTestPageObject.theApplicationURLContains("#link01");

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
	});

	opaTest("Test 'iResetThePersonalization'", function(Given, When, Then) {
		When.onTheMDCLink.iResetThePersonalization({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });

		When.onTheMDCLink.iPressTheLink({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeAPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" }, []);

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "container-LinkIntegrationTesting.appUnderTestPageObject---app--Field-inner" });
		Then.iTeardownMyAppFrame();
	});

});