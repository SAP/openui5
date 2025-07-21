/* global QUnit */

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/HomePage",
    "./pages/OverviewPage"
], function (opaTest) {
    "use strict";

    QUnit.module("Home Page");

    opaTest("Should see Radio buttons for SAP Icons and SAP TNT Icons", function (Given, When, Then) {
        // Given
       Given.iStartMyApp("./test-resources/sap/m/demokit/iconExplorer/webapp/index.html");

        // Then
        Then.onTheHomePage.iShouldSeeRadioButtons(2, ["infoSAPIcons", "fontName_SAPIconsTNT"]);
    });

    opaTest("Should see search and should be able to search for an icon", function (Given, When, Then) {
        // When
        When.onTheHomePage.iSearchForInput("add");

        // Then
        Then.onTheHomePage.iShouldSeeTheSearchInput()
            .and.iShouldSeeSearchResults();
    });

    opaTest("Should be able to clear search", function (Given, When, Then) {
        // When
        When.onTheHomePage.iSearchForInput("add").and.iClearSearch();
    });

    opaTest("Should navigate to a search result", function (Given, When, Then) {
        // When
        When.onTheHomePage.iSearchForInput("add")
            .and.iSelectARowFromTheSuggestionTable(0);

        // Then
        Then.onTheOverviewPage.iShouldSeeOverviewPage().and.iTeardownMyApp();
    });

    opaTest("Should see navigation buttons on home page", function (Given, When, Then) {
        // Given
        Given.iStartMyApp("./test-resources/sap/m/demokit/iconExplorer/webapp/index.html");

        // Then
        Then.onTheHomePage.iShouldSeeBrowseLibraryButton()
            .and.iShouldSeeInfoButton();

        // Then
        Then.onTheHomePage.iShouldSeeNavigationButtons();

        // When
        When.onTheHomePage.iPressLibraryButton();

        // Then
        Then.onTheOverviewPage.iShouldSeeOverviewPage();

        // Teardown
        Then.iTeardownMyApp();
    });
});