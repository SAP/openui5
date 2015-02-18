/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	'sap/ui/test/Opa5',
	'sap/ui/demo/mdtemplate/test/integration/action/MasterAction',
	'sap/ui/demo/mdtemplate/test/integration/arrangement/StartAppArrangement',
	'sap/ui/demo/mdtemplate/test/integration/assertion/MasterAssertion'
],
function (Opa5, MasterAction, StartAppArrangement, MasterAssertion) {
	
	module("Master List", { setup : function () {
		Opa5.extendConfig({
			actions : new MasterAction(),
			arrangements : new StartAppArrangement(),
			assertions : new MasterAssertion(),
			viewNamespace : "sap.ui.demo.mdtemplate.view."
		});
	}});

	opaTest("Should see the master list with 9 entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppOnADesktopDevice();

		//Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.iShouldSeeTheMasterList().
			and.theMasterListShouldHave9Entries();
	});
	
	opaTest("Search for 'Object 2' should deliver exactly one result", function (Given, When, Then) {

		//Actions
		When.iSearchForObject2();

		// Assertions
		Then.theMasterListShowsObject2().
			and.theMasterListShouldHave1Entry();
	});
	
	opaTest("Entering 'Object 3' into search field and pressing search field's refresh should leave the list as it was", function (Given, When, Then) {

		//Actions
		When.iEnterObject3InTheSearchField().and.iTriggerRefresh();

		// Assertions
		Then.theMasterListShowsObject2().
			and.theMasterListShouldHave1Entry();
	});
	
	opaTest("MasterList Sorting on UnitNumber", function(Given, When, Then) {
	
		// Actions
		When.iClearTheSearch().and.iSortTheListOnUnitNumber();
		// Assertions
		Then.theMasterListShouldBeSortedAscendingOnUnitNumber();

	});
	
	opaTest("MasterList Sorting on Name", function(Given, When, Then) {
		
		// Actions
		When.iSortTheListOnName();
		// Assertions
		Then.theMasterListShouldBeSortedAscendingOnName();

	})
	
	opaTest("MasterList Filtering on UnitNumber less than 100", function(Given, When, Then) {
		
		// Action
		When.iOpenViewSettingsDialog().
			and.iSelectListItemInViewSettingsDialog("Unit Number").
			and.iSelectListItemInViewSettingsDialog("<100 UoM").
			and.iPressOKInViewSelectionDialog();
		
		// Assertion
		Then.theMasterListShouldBeFilteredOnUnitNumberValueLessThan100();
	});
	
	opaTest("MasterList Filtering on UnitNumber more than 100", function(Given, When, Then) {
		
		// Action
		When.iOpenViewSettingsDialog().
			and.iSelectListItemInViewSettingsDialog(">100 UoM").
			and.iPressOKInViewSelectionDialog();
		// Assertion
		Then.theMasterListShouldBeFilteredOnUnitNumberValueMoreThan100();
	});
	
	opaTest("MasterList remove filter should display all items", function(Given, When, Then) {
		
		// Action
		When.iOpenViewSettingsDialog().
			and.iPressResetInViewSelectionDialog().
			and.iPressOKInViewSelectionDialog();
		// Assertion
		Then.theMasterListShouldHave9Entries();
	});
	
	opaTest("MasterList grouping delivers a group with one member and a group with 8 members", function(Given, When, Then) {
		
		// Action
		When.iGroupTheList();
		// Assertion
		Then.theMasterListShouldContainGroup20OrLess().
			and.theMasterListShouldContainGroup20OrMore().
			and.theMasterListGroupShouldBeFilteredOnUnitNumberValue20OrLess();
	});
	
	opaTest("Remove grouping from MasterList delivers initial list", function(Given, When, Then) {
			
			// Action
			When.iRemoveListGrouping();
			// Assertion
			Then.theMasterListShouldNotContainGroupHeaders().
				and.theMasterListShouldHave9Entries().
				and.iTeardownMyAppFrame();
		});
	});