/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
	[
		'sap/ui/test/Opa5',
		'sap/ui/demo/mdtemplate/test/integration/action/NavigationAction',
		'sap/ui/demo/mdtemplate/test/integration/arrangement/StartAppArrangement',
		'sap/ui/demo/mdtemplate/test/integration/assertion/NavigationAssertion'
	],
	function (Opa5, NavigationAction, StartAppArrangement, NavigationAssertion) {

		module("Not found Journey", { setup : function () {
			Opa5.extendConfig({
				actions : new NavigationAction(),
				arrangements : new StartAppArrangement(),
				assertions : new NavigationAssertion(),
				viewNamespace : "sap.ui.demo.mdtemplate.view."
			});
		}}); 
		
		opaTest("Should see the resource not found page and no selection in the master list when navigating to an invalid hash", function (Given, When, Then) {
			//Arrangement
			Given.iStartTheAppOnADesktopDevice();
			
			//Actions
			When.iWaitUntilTheMasterListIsLoaded().
				and.iChangeTheHashToSomethingInvalid();

			// Assertions
			Then.iShouldSeeTheNotFoundPage().
				and.theListShouldHaveNoSelection().
				and.theNotFoundPageShouldSayResourceNotFound().
				and.iTeardownMyAppFrame();
		});

		function opaTestPhoneAndDesktop (sTestName, sHash , fnTest) {
			opaTest("Phone: " + sTestName, function (Given, When, Then) {
				Given.iStartTheAppOnAPhone(sHash);
				fnTest.call(this, Given, When, Then);
				Then.iTeardownMyAppFrame();
			});
			opaTest("Desktop: " + sTestName, function (Given, When, Then) {
				Given.iStartTheAppOnADesktopDevice(sHash);
				fnTest.call(this, Given, When, Then);
				Then.iTeardownMyAppFrame();
			});
		}

		opaTestPhoneAndDesktop("Should see the not found page if the hash is something that matches no route", "#somethingThatDoesNotExist", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheNotFoundPage().
				and.theNotFoundPageShouldSayResourceNotFound();
		});
		
		opaTestPhoneAndDesktop("Should see the not found master and detail page if an invalid object id has been called", "#/object/SomeInvalidObjectId", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheObjectNotFoundPage().
				and.theNotFoundPageShouldSayObjectNotFound();
		});

		opaTestPhoneAndDesktop("Should see the not found master and detail page if an invalid line item id has been called", "#/object/ObjectID_3/lineitem/SomeInvalidLineItemId", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheLineItemNotFoundPage().
				and.theNotFoundPageShouldSayLineItemNotFound();
		});
		
		opaTestPhoneAndDesktop("Should see the not found text for no search results", "", function (Given, When, Then) {
			//Actions
			When.iLookAtTheScreen();

			// Assertions
			Then.iShouldSeeTheObjectList().
				and.theObjectListShouldHave9Entries();
			
			When.iSearchForSomethingWithNoResults();

			Then.iShouldSeeTheNoDataTextForNoSearchResults();
		});

	});
