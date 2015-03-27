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
			and.theFirstLineItemHasIDLineItemID_1().
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
