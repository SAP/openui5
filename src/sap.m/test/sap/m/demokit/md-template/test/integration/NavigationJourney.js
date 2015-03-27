/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	'sap/ui/test/Opa5',
	'sap/ui/demo/mdtemplate/test/integration/action/NavigationAction',
	'sap/ui/demo/mdtemplate/test/integration/arrangement/StartAppArrangement',
	'sap/ui/demo/mdtemplate/test/integration/assertion/NavigationAssertion'
],
function (Opa5, NavigationAction, StartAppArrangement, NavigationAssertion) {

	module("Desktop navigation", { setup : function () {
		Opa5.extendConfig({
			actions : new NavigationAction(),
			arrangements : new StartAppArrangement(),
			assertions : new NavigationAssertion(),
			viewNamespace : "sap.ui.demo.mdtemplate.view."
		});
	}});

	opaTest("Should see the objects list", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppOnADesktopDevice();

		//Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.iShouldSeeTheObjectList().
			and.theObjectListShouldHave10Entries().
			and.theMasterPageHeaderShouldDisplay20Entries().
			and.theObjectPageShowsTheFirstObject();
	});

	opaTest("Should react on hashchange", function (Given, When, Then) {
		// Actions
		When.iChangeTheHashToObjectN(10);

		// Assertions
		Then.iShouldBeOnTheObjectNPage(10).
			and.theObjectNShouldBeSelectedInTheMasterList(10);
	});


	opaTest("Should navigate on press", function (Given, When, Then) {
		// Actions
		When.iPressOnTheObject1InMasterList();

		// Assertions
		Then.iShouldBeOnTheObjectNPage(1);
	});

	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
		// Actions
		When.iPressOnTheObject1InMasterList();

		// Assertions
		Then.iShouldBeOnTheObjectNPage(1).
			and.iShouldSeeTheObjectLineItemsList().
			and.theLineItemsListShouldHave4Entries().
			and.theLineItemsHeaderShouldDisplay4Entries().
			and.theFirstLineItemHasIDLineItemID_1().
			and.iTeardownMyAppFrame();

	});

	opaTest("Navigate directly to an object not on the client with hash: no item should be selected and the object page should be displayed", function (Given, When, Then) {
		//Arrangement
		Given.iStartTheAppOnADesktopDevice("#/object/ObjectID_2");

		//Actions
		When.iWaitUntilTheMasterListIsLoaded();

		// Assertions
		Then.iShouldBeOnTheObjectNPage(2).
			and.theListShouldHaveNoSelection().
			and.iTeardownMyAppFrame();
	});
	
	opaTest("Start the app with empty hash: the hash should reflect the selection of the first item in the list", function (Given, When, Then) {
		//Arrangement
		Given.iStartTheAppOnADesktopDevice();
		
		//Actions
		When.iWaitUntilTheMasterListIsLoaded();
		//Assertions
		
		Then.theObjectNShouldBeSelectedInTheMasterList(1).
			and.iShouldBeOnTheObjectNPage(1).
			and.iShouldSeeTheHashForObjectN(1).
			and.iTeardownMyAppFrame();
	});
	
});
