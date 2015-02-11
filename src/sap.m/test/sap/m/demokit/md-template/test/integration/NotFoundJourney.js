/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
	[
		'sap/ui/test/Opa5',
		'sap/ui/demo/mdtemplate/test/integration/action/NavigationAction',
		'sap/ui/demo/mdtemplate/test/integration/arrangement/NavigationArrangement',
		'sap/ui/demo/mdtemplate/test/integration/assertion/NavigationAssertion'
	],
	function (Opa5, NavigationAction, NavigationArrangement, NavigationAssertion) {
		Opa5.extendConfig({
			actions : new NavigationAction(),
			arrangements : new NavigationArrangement(),
			assertions : new NavigationAssertion(),
			viewNamespace : "sap.ui.demo.mdtemplate.view."
		});

		module("Not found Journey");

		function opaTestPhoneAndDesktop (sTestName, sHash , fnTest) {
			opaTest("Phone: " + sTestName, function (Given, When, Then) {
				Given.GivenIStartTheAppOnAPhone(sHash);
				fnTest.call(this, Given, When, Then);
			});
			opaTest("Desktop: " + sTestName, function (Given, When, Then) {
				Given.GivenIStartTheAppOnADesktopDevice(sHash);
				fnTest.call(this, Given, When, Then);
			});
		}

		opaTestPhoneAndDesktop("Should see the not found page if the hash is something that matches no route", "#somethingThatDoesNotExist", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheEmptyPage().
				and.theTextShouldSayResourceNotFound().
				and.iTeardownMyAppFrame();
		});

		opaTestPhoneAndDesktop("Should see the not found list", "#/objects/SomeInvalidObjectId", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			//TODO: this test must be updated to show a more meaningful error message
			// Assertions
			Then.iShouldSeeTheEmptyPage().
				and.theTextShouldSayResourceNotFound().
				and.iTeardownMyAppFrame();
		});

	});
