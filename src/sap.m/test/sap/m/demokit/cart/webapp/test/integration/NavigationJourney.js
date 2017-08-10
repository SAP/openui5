/* global QUnit */

sap.ui.define([
    'sap/ui/test/opaQunit'
], function (opaTest) {
    "use strict";

    QUnit.module("Navigation Journey");

    opaTest("Should start the app and go to the speaker category view", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();
        // Actions
        When.onHome.iPressOnTheSpeakerCategory();
        // Assertions
        Then.onTheCategory.iShouldBeTakenToTheSpeakerCategory();
    });

    opaTest("Should see the product Blaster Extreme", function (Given, When, Then) {

        When.onTheCategory.iPressOnTheProductBlasterExtreme();

        Then.onTheProduct.iShouldSeeTheBlasterExtremeDetailPage();
    });

    opaTest("Should navigate back to home", function (Given, When, Then) {

        When.onTheCategory.iPressTheBackButton();

        Then.onHome.iShouldSeeTheCategoryList();
        Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
    });

    opaTest("Should navigate to cart", function (Given, When, Then) {

        When.onHome.iGoToTheCartPage();

        Then.onTheCart.iShouldSeeTheCart();
        Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
    });

    opaTest("Should navigate back home", function (Given, When, Then) {

        When.onTheCart.iPressTheBackButton();

        Then.onHome.iShouldSeeTheCategoryList();
        Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
    });

    opaTest("Should navigate from welcome to product view", function (Given, When, Then) {

        When.onTheWelcomePage.iPressOnTheProductSmartphoneAlphaTitle();

        Then.onTheProduct.iShouldSeeTheSmartphoneAlphaDetailPage();
    });

    opaTest("Should navigate back to home", function (Given, When, Then) {

        When.onTheCategory.iPressTheBackButton();

        Then.onHome.iShouldSeeTheCategoryList();
        Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
        When.onHome.iTeardownMyApp();
    });
});
