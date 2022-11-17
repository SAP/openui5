/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"sap/ui/mdc/LinkIntegrationTesting/appUnderTestPageObject/pages/App"
], function(
	Opa5,
	opaTest,
	FakeLrepConnectorLocalStorage,
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
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.mdc.LinkIntegrationTesting.appUnderTestPageObject",
						async: true,
						settings: { id: "appUnderTestPageObject" }
					},
					hash: "",
					autoWait: true
				});
			},
			iEnableTheLocalLRep: function() {
                // Init LRep for VariantManagement (we have to fake the connection to LRep in order to be independent from backend)
                FakeLrepConnectorLocalStorage.enableFakeConnector();
                FakeLrepConnectorLocalStorage.forTesting.synchronous.clearAll();
            }
		}
	});

	opaTest("Start App and test 'iPressTheLink' and 'iCloseThePopover'", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		Given.iEnableTheLocalLRep();

		When.onTheMDCLink.iPressTheLink({ id: "appUnderTestPageObject---app--Field-inner" });
		Then.onAppUnderTestPageObject.iShouldSeeAnOpenPopover({ id: "appUnderTestPageObject---app--Field-inner" });

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "appUnderTestPageObject---app--Field-inner" });
	});

	opaTest("Test 'iPressTheLink', 'iShouldSeeAPopover' and 'iShouldSeeLinksOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPressTheLink({ id: "appUnderTestPageObject---app--Field-inner" });

		Then.onTheMDCLink.iShouldSeeAPopover({ id: "appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ id: "appUnderTestPageObject---app--Field-inner" }, []);

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "appUnderTestPageObject---app--Field-inner" });
	});

	opaTest("Test 'iPersonalizeTheLinks' and 'iShouldSeeLinksOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPersonalizeTheLinks({ id: "appUnderTestPageObject---app--Field-inner" }, ["TextLinkItem00", "TextLinkItem01", "TextLinkItem02"]);

		When.onTheMDCLink.iPressTheLink({ id: "appUnderTestPageObject---app--Field-inner" });

		Then.onTheMDCLink.iShouldSeeAPopover({ id: "appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ id: "appUnderTestPageObject---app--Field-inner" }, ["TextLinkItem00", "TextLinkItem01", "TextLinkItem02"]);
	});

	opaTest("Test 'iPressLinkOnPopover'", function(Given, When, Then) {
		When.onTheMDCLink.iPressLinkOnPopover({ id: "appUnderTestPageObject---app--Field-inner" }, "TextLinkItem01");

		Then.onAppUnderTestPageObject.theApplicationURLContains("#link01");

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "appUnderTestPageObject---app--Field-inner" });
	});

	opaTest("Test 'iResetThePersonalization'", function(Given, When, Then) {
		When.onTheMDCLink.iResetThePersonalization({ id: "appUnderTestPageObject---app--Field-inner" });

		When.onTheMDCLink.iPressTheLink({ id: "appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeAPopover({ id: "appUnderTestPageObject---app--Field-inner" });
		Then.onTheMDCLink.iShouldSeeLinksOnPopover({ id: "appUnderTestPageObject---app--Field-inner" }, []);

		When.onTheMDCLink.iCloseThePopover();
		Then.onAppUnderTestPageObject.iShouldNotSeeAnOpenPopover({ id: "appUnderTestPageObject---app--Field-inner" });
		Then.iTeardownMyUIComponent();
	});

});