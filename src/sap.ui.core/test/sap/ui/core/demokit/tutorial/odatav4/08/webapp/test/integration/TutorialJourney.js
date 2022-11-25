sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/core/tutorial/odatav4/test/integration/pages/Tutorial"
], function (opaTest) {
	"use strict";

	var iGrowingBy = 10, // Must equal the 'growingThreshold' setting of the table
		iTotalUsers = 20; // Must equal the total number of users

	QUnit.module("Posts");

	opaTest("Should see the paginated table with all users", function (Given, _When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheTutorialPage.theTableShouldHavePagination()
			.and.theTableShouldShowUsers(iGrowingBy)
			.and.theTableShouldShowTotalUsers(iTotalUsers);
	});

	opaTest("Should be able to load more users", function (_Given, When, Then) {
		//Actions
		When.onTheTutorialPage.iPressOnMoreData();
		// Assertions
		Then.onTheTutorialPage.theTableShouldShowUsers(iGrowingBy * 2);
	});

	opaTest("Should be able to sort users", function (_Given, When, Then) {
		//Actions
		When.onTheTutorialPage.iPressOnSort();
		// Assertions
		Then.onTheTutorialPage.theTableShouldStartWith("Alfred");
	});

	opaTest("Should be able to start adding users", function (_Given, When, Then) {
		//Actions
		When.onTheTutorialPage.iPressOnAdd()
			.and.iEnterSomeData("a");
		When.onTheTutorialPage.iPressOnAdd()
			.and.iEnterSomeData("b");
		// Assertions
		Then.onTheTutorialPage.thePageFooterShouldBeVisible(true)
			.and.theTableToolbarItemsShouldBeEnabled(false)
			.and.theTableShouldShowTotalUsers(iTotalUsers + 2);
	});

	opaTest("Should be able to save the new users", function (_Given, When, Then) {
		//Actions
		When.onTheTutorialPage.iPressOnSave();
		// Assertions
		Then.onTheTutorialPage.theTableShouldStartWith("b")
			.and.theTableShouldShowTotalUsers(iTotalUsers + 2)
			.and.theTableToolbarItemsShouldBeEnabled(true)
			.and.thePageFooterShouldBeVisible(false);
	});

	opaTest("Should be able to delete/undelete the new users", function (_Given, When, Then) {
		// delete and undelete
		When.onTheTutorialPage.iSelectUser("b")
			.and.iPressOnDelete();
		Then.onTheTutorialPage.theTableShouldStartWith("a")
			.and.theTableShouldShowTotalUsers(iTotalUsers + 1);
		When.onTheTutorialPage.iSelectUser("a")
			.and.iPressOnDelete();
		Then.onTheTutorialPage.theTableShouldStartWith("Alfred")
			.and.theTableShouldShowTotalUsers(iTotalUsers);
		When.onTheTutorialPage.iPressOnCancel();
		Then.onTheTutorialPage.theMessageToastShouldShow("deletionRestoredMessage", "b")
			.and.theMessageToastShouldShow("deletionRestoredMessage", "a")
			.and.theTableShouldStartWith("b")
			.and.theTableShouldShowTotalUsers(iTotalUsers + 2);
		// delete and save
		When.onTheTutorialPage.iSelectUser("a")
			.and.iPressOnDelete()
			.and.iSelectUser("b")
			.and.iPressOnDelete()
			.and.iPressOnSave();
		Then.onTheTutorialPage.theMessageToastShouldShow("deletionSuccessMessage", "a")
			.and.theMessageToastShouldShow("deletionSuccessMessage", "b")
			.and.theTableShouldStartWith("Alfred")
			.and.theTableShouldShowTotalUsers(iTotalUsers);
	});

	opaTest("Should be able to search for users", function (_Given, When, Then) {
		//Actions
		When.onTheTutorialPage.iSearchFor("Mundy");
		// Assertions
		Then.onTheTutorialPage.theTableShouldShowUsers(1);
	});

	opaTest("Should be able to reset the search", function (_Given, When, Then) {
		//Actions
		When.onTheTutorialPage.iSearchFor("");
		// Assertions
		Then.onTheTutorialPage.theTableShouldShowUsers(10);
	});

	opaTest("Should see an error when trying to change a user name to an existing one",
		function (_Given, When, Then) {
			//Actions
			When.onTheTutorialPage.iChangeAUserKey("javieralfred", "willieashmore")
				.and.iPressOnSave();
			// Assertions
			Then.onTheTutorialPage.iShouldSeeAServiceError()
				.and.theTableToolbarItemsShouldBeEnabled(false)
				.and.thePageFooterShouldBeVisible(true);
		}
	);

	opaTest("Should be able to close the error and cancel the change",
		function (_Given, When, Then) {
			//Actions
			When.onTheTutorialPage.iCloseTheServiceError()
				.and.iPressOnCancel();
			// Assertions
			Then.onTheTutorialPage.theTableToolbarItemsShouldBeEnabled(true)
				.and.thePageFooterShouldBeVisible(false);
			// Cleanup
			Then.iTeardownMyApp();
		}
	);
});
