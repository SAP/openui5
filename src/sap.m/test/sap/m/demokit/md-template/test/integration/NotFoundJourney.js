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
				Given.iStartTheAppOnAPhone(sHash);
				fnTest.call(this, Given, When, Then);
			});
			opaTest("Desktop: " + sTestName, function (Given, When, Then) {
				Given.iStartTheAppOnADesktopDevice(sHash);
				fnTest.call(this, Given, When, Then);
			});
		}

		opaTestPhoneAndDesktop("Should see the not found page if the hash is something that matches no route", "#somethingThatDoesNotExist", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheNotFoundPage().
				//and.theListShouldSayResourceNotFound().
				and.theNotFoundPageShouldSayResourceNotFound().
				and.iTeardownMyAppFrame();
		});
		
		opaTest("Should see the resource not found page and no selection in the master list when navigating to an invalid hash", function (Given, When, Then) {
			//Actions
			Given.iStartTheAppOnADesktopDevice();
			When.iLookAtTheScreen().
				and.iChangeTheHashToSomethingInvalid();

			// Assertions
			Then.iShouldSeeTheNotFoundPage().
				and.theListShouldHaveNoSelection().
				and.theNotFoundPageShouldSayResourceNotFound().
				and.iTeardownMyAppFrame();
		});


		opaTestPhoneAndDesktop("Should see the not found master and detail page if an invalid object id has been called", "#/object/SomeInvalidObjectId", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheObjectNotFoundPage().
				and.theNotFoundPageShouldSayObjectNotFound().
				and.iTeardownMyAppFrame();
		});

		opaTestPhoneAndDesktop("Should see the not found master and detail page if an invalid line item id has been called", "#/object/ObjectID_3/lineitem/SomeInvalidLineItemId", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheLineItemNotFoundPage().
				and.theNotFoundPageShouldSayLineItemNotFound().
				and.iTeardownMyAppFrame();
		});
		
		opaTestPhoneAndDesktop("Should see the not found text for no search results", "", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheObjectList().
				and.theObjectListShouldHave9Entries();
			
			When.iSearchForSomethingWithNoResults();

			Then.iShouldSeeTheNoDataTextForNoSearchResults().
				and.iTeardownMyAppFrame();
		});

	});
