/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	'sap/ui/test/Opa5',
	'sap/ui/demo/mdtemplate/test/integration/action/NavigationAction',
	'sap/ui/demo/mdtemplate/test/integration/arrangement/StartAppArrangement',
	'sap/ui/demo/mdtemplate/test/integration/assertion/NavigationAssertion'
],
function (Opa5, NavigationAction, StartAppArrangement, NavigationAssertion) {

	module("Mobile navigation", { setup : function () {
		Opa5.extendConfig({
			actions : new NavigationAction(),
			arrangements : new StartAppArrangement(),
			assertions : new NavigationAssertion(),
			viewNamespace : "sap.ui.demo.mdtemplate.view."
		});
	}});

	opaTest("Should see the objects list", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppOnAPhone();

		//Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.iShouldSeeTheObjectList();
	});

	opaTest("Should react on hashchange", function (Given, When, Then) {
		// Actions
		When.iChangeTheHashToObjectN(3);

		// Assertions
		Then.iShouldBeOnTheObjectNPage(3);
	});


	opaTest("Should navigate on press", function (Given, When, Then) {
		// Actions
		When.iPressTheBackButtonOnDetailPage().and.iPressOnTheObject1InMasterList();

		// Assertions
		Then.iShouldBeOnTheObjectNPage(1);
	});

	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
		// Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.iShouldSeeTheObjectLineItemsList().
			and.theLineItemsListShouldHave4Entries().
			and.theFirstLineItemHasIDLineItemID_1();

	});

	opaTest("Line Item Page shows Line Item and Navigation Buttons have correct state", function (Given, When, Then) {

		// Actions
		When.iPressOnTheItem1InLineItemList();

		// Assertions
		Then.iShouldBeOnTheLineItem1Page().
			and.thePreviousButtonIsDisabled().
			and.theNextButtonIsEnabled();

	});

	opaTest("Line Item Page pressing 'Next' Button on Line Item 1 page navigates to Line Item 2 and updates the Navigation Buttons", function (Given, When, Then) {

		// Actions
		When.iPressTheNextButton();

		// Assertions
		Then.iShouldBeOnTheLineItem2Page().
			and.thePreviousButtonIsEnabled().
			and.theNextButtonIsEnabled();

	});

	opaTest("Line Item Page ressing 'Previous' Button on Line Item 2 page navigates to Line Item 1 and updates the Navigation Buttons", function (Given, When, Then) {

		// Actions
		When.iPressThePreviousButton();

		// Assertions
		Then.iShouldBeOnTheLineItem1Page().
			and.thePreviousButtonIsDisabled().
			and.theNextButtonIsEnabled();

	});

	opaTest("Line Item Page: after several 'Next' and 'Previous' navigation, going back in browser history should take us back to Detail Page for Object 1", function (Given, When, Then) {

		// Actions
		When.iGoBackInBrowserHistory();

		// Assertions
		Then.iShouldBeOnTheObjectNPage(1).
			and.iTeardownMyAppFrame();

	});
	
	opaTest("Navigate directly to Line Item 7 of object 3 with hash: press back button twice should take me to the master list", function (Given, When, Then) {
		//Arrangement
		Given.iStartTheAppOnAPhone("#/object/ObjectID_3/lineitem/LineItemID_7");

		//Actions
		When.iWaitUntilISeePageForLineItem7().
		    and.iPressTheBackButtonOnLineItemPage().
			and.iPressTheBackButtonOnDetailPage();

		// Assertions
		Then.iShouldSeeTheObjectList().
			and.iTeardownMyAppFrame();
	});
	
	opaTest("Start the app with an empty hash: the hash should still be empty after loading", function (Given, When, Then) {
		//Arrangement
		Given.iStartTheAppOnAPhone();

		//Actions
		When.iWaitUntilTheMasterListIsLoaded();

		//Assertions
		Then.iShouldSeeAnEmptyHash().
			and.iTeardownMyAppFrame();
	})

});
