sap.ui.define(['sap/ui/test/opaQunit'], function (opaTest) {

	QUnit.module("List handling");

	opaTest("Should group the list initially", function (Given, When, Then) {
		Given.iStartTheExploredApp();

		When.onTheMasterPage.iLookAtTheScreen();

		Then.onTheMasterPage.iShouldSeeAGroupCalled("Testing").
			and.theListShouldBeSortedAscendingByName();
	});

	opaTest("Should be able to sort descending ", function (Given, When, Then) {
		When.onTheMasterHeaderPage.iGroupByCategoryDescending();

		Then.onTheMasterPage.theListShouldBeSortedDescendingByCategory();
	});

	opaTest("Should be able to filter the list", function (Given, When, Then) {
		When.onTheMasterPage.iTriggerTheSearchFor("test");

		Then.onTheMasterPage.iShouldNotSeeAnEntityCalled("Busy Indicator").
			and.iShouldSeeAnEntityCalled("OPA5").
			and.iShouldSeeAGroupCalled("Testing").
			and.iTeardownMyAppFrame();
	});

});
