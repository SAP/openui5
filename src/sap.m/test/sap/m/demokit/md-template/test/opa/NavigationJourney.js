/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	'sap/ui/test/Opa5',
	'sap/ui/demo/mdtemplate/test/opa/action/NavigationAction',
	'sap/ui/demo/mdtemplate/test/opa/arrangement/NavigationArrangement',
	'sap/ui/demo/mdtemplate/test/opa/assertion/NavigationAssertion'
],
function (Opa5, NavigationAction, NavigationArrangement, NavigationAssertion) {
	Opa5.extendConfig({
		actions : new NavigationAction(),
		arrangements : new NavigationArrangement(),
		assertions : new NavigationAssertion(),
		viewNamespace : "sap.ui.demo.mdtemplate.view."
	});

	module("Desktop navigation");

	opaTest("Should see the objects list", function (Given, When, Then) {
		// Arrangements
		Given.GivenIStartTheAppOnADesktopDevice();

		//Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.iShouldSeeTheObjectList().
			and.theObjectListShouldHave9Entries().
			and.theObjectPageShowsTheFirstObject();
	});

	opaTest("Should react on hashchange", function (Given, When, Then) {
		// Actions
		When.iChangeTheHashToObject3();

		// Assertions
		Then.iShouldBeOnTheObject3Page().
			and.theObject3ShouldBeSelectedInTheMasterList();
	});


	opaTest("Should navigate on press", function (Given, When, Then) {
		// Actions
		When.iPressOnTheObject1InMasterList();

		// Assertions
		Then.iShouldBeOnTheObject1Page();
	});

	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
		// Actions
		When.iPressOnTheObject1InMasterList();

		// Assertions
		Then.iShouldBeOnTheObject1Page().
			and.iShouldSeeTheObjectLineItemsList().
			and.theLineItemsListShouldHave4Entries().
			and.theFirstLineItemHasIDLineItemID_1();

	});

	opaTest("Line Item Page shows Line Item and Navigation Buttons have correct state", function (Given, When, Then) {

		// Actions
		When.iPressOnTheObject1InMasterList().
			and.iPressOnTheItem1InLineItemList();

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
			and.theNextButtonIsEnabled().
			and.iTeardownMyAppFrame();

	});

});
