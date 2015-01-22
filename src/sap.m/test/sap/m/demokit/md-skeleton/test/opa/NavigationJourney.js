jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");


sap.ui.define(
[
	'sap/ui/test/Opa5',
	'sap/ui/demo/mdskeleton/test/opa/action/NavigationAction',
	'sap/ui/demo/mdskeleton/test/opa/arrangement/NavigationArrangement',
	'sap/ui/demo/mdskeleton/test/opa/assertion/NavigationAssertion'
],
function (Opa5, NavigationAction, NavigationArrangement, NavigationAssertion) {
	return {
		start : function (sFrameUrl) {
			Opa5.extendConfig({
				actions : new NavigationAction(),
				arrangements : new NavigationArrangement(),
				assertions : new NavigationAssertion(),
				viewNamespace : "sap.ui.demo.mdskeleton.view."
			});

			opaTest("Should see the objects list", function (Given, When, Then) {
				// Arrangements
				Given.iStartMyAppInAFrame(sFrameUrl);

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
				When.iPressOnTheObject1();

				// Assertions
				Then.iShouldBeOnTheObject1Page();
			});

			opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
				// Actions
				When.iPressOnTheObject1();

				// Assertions
				Then.iShouldBeOnTheObject1Page().
					and.iShouldSeeTheObjectLineItemsList().
					and.theLineItemsListShouldHave4Entries().
					and.theFirstLineItemHasIDLineItemID_1();

			});
		}
	};

});
