import opaTest from "sap/ui/test/opaQunit";
var iGrowingBy = 10, iTotalUsers = 20;
QUnit.module("Posts");
opaTest("Should see the paginated table with all users", function (Given, When, Then) {
    Given.iStartMyApp();
    Then.onTheTutorialPage.theTableShouldHavePagination().and.theTableShouldShowUsers(iGrowingBy).and.theTableShouldShowTotalUsers(iTotalUsers);
});
opaTest("Should be able to load more users", function (Given, When, Then) {
    When.onTheTutorialPage.iPressOnMoreData();
    Then.onTheTutorialPage.theTableShouldShowUsers(iGrowingBy * 2);
});
opaTest("Should be able to sort users", function (Given, When, Then) {
    When.onTheTutorialPage.iPressOnSort();
    Then.onTheTutorialPage.theTableShouldStartWith("Alfred");
});
opaTest("Should be able to start adding users", function (Given, When, Then) {
    When.onTheTutorialPage.iPressOnAdd().and.iEnterSomeData("a");
    When.onTheTutorialPage.iPressOnAdd().and.iEnterSomeData("b");
    Then.onTheTutorialPage.thePageFooterShouldBeVisible(true).and.theTableToolbarItemsShouldBeEnabled(false).and.theTableShouldShowTotalUsers(iTotalUsers + 2);
});
opaTest("Should be able to save the new users", function (Given, When, Then) {
    When.onTheTutorialPage.iPressOnSave();
    Then.onTheTutorialPage.theTableShouldStartWith("b").and.theTableShouldShowTotalUsers(iTotalUsers + 2).and.theTableToolbarItemsShouldBeEnabled(true).and.thePageFooterShouldBeVisible(false);
});
opaTest("Should be able to delete the new users", function (Given, When, Then) {
    When.onTheTutorialPage.iSelectUser("a").and.iPressOnDelete();
    When.onTheTutorialPage.iSelectUser("b").and.iPressOnDelete();
    Then.onTheTutorialPage.theMessageToastShouldShow("deletionSuccessMessage").and.theTableShouldStartWith("Alfred").and.theTableShouldShowTotalUsers(iTotalUsers);
});
opaTest("Should be able to search for users", function (Given, When, Then) {
    When.onTheTutorialPage.iSearchFor("Mundy");
    Then.onTheTutorialPage.theTableShouldShowUsers(1);
});
opaTest("Should be able to reset the search", function (Given, When, Then) {
    When.onTheTutorialPage.iSearchFor("");
    Then.onTheTutorialPage.theTableShouldShowUsers(10);
});
opaTest("Should see an error when trying to change a user name to an existing one", function (Given, When, Then) {
    When.onTheTutorialPage.iChangeAUserKey("javieralfred", "willieashmore").and.iPressOnSave();
    Then.onTheTutorialPage.iShouldSeeAServiceError().and.theTableToolbarItemsShouldBeEnabled(false).and.thePageFooterShouldBeVisible(true);
});
opaTest("Should be able to close the error and cancel the change", function (Given, When, Then) {
    When.onTheTutorialPage.iCloseTheServiceError().and.iPressOnCancel();
    Then.onTheTutorialPage.theTableToolbarItemsShouldBeEnabled(true).and.thePageFooterShouldBeVisible(false);
});
opaTest("Should be able to see the detail area", function (Given, When, Then) {
    When.onTheTutorialPage.iSelectUser("javieralfred").and.iPressUser();
    Then.onTheTutorialPage.theDetailAreaShouldBeVisible(true);
});
opaTest("Should be able to close detail area when user is deleted", function (Given, When, Then) {
    When.onTheTutorialPage.iSelectUser("javieralfred").and.iPressUser();
    When.onTheTutorialPage.iSelectUser("javieralfred").and.iPressOnDelete();
    Then.onTheTutorialPage.theDetailAreaShouldBeVisible(false);
    Then.iTeardownMyApp();
});