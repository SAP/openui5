import opaTest from "sap/ui/test/opaQunit";
QUnit.module("Check Journey");
opaTest("Should start the app and see the 'Do Something' button with its label", function (Given, When, Then) {
    Given.iStartMyApp();
    Then.onTheAppPage.iShouldSeeTheDoSomethingButton().and.iShouldSeeTheButtonLabel();
});
opaTest("Should be able to press the 'Do Something' button", function (Given, When, Then) {
    When.onTheAppPage.iPressTheDoSomethingButton();
    Then.onTheAppPage.iShouldSeeMessageToast();
});