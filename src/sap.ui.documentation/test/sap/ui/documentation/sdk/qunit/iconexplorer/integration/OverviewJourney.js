/* global QUnit */

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/HomePage",
    "./pages/OverviewPage"
], function (opaTest) {
    "use strict";

    QUnit.module("Overview Page");

    opaTest("Should see page title and nav back button", function (Given, When, Then) {
        // Given
       Given.iStartMyApp("./test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview");

        // Then
        Then.onTheOverviewPage.iShouldSeeOverviewPage()
            .and.iShouldSeePageTitle("Icon Explorer")
            .and.iShouldSeeNavBackButton();
    });

    opaTest("Should see navigation button", function (Given, When, Then) {
        // Then
        Then.onTheOverviewPage.IShouldSeeNavigationButton();
    });

    opaTest("Should see all filters", function (Given, When, Then) {
        // Then
        Then.onTheOverviewPage.iShouldSeeFilters();
    });

    opaTest("Should see suggested tags", function (Given, When, Then) {
        // Then
        Then.onTheOverviewPage.iShouldSeeSuggestedTags();
    });

    opaTest("Should see search field", function (Given, When, Then) {
        // Then
        Then.onTheOverviewPage.iShouldSeeTheSearchField();
    });

    opaTest("Should be able to search for an icon", function (Given, When, Then) {
        // When
        When.onTheOverviewPage.iSearchForInput("add");

        // Then
        Then.onTheOverviewPage.iShouldSeeSearchResults();
    });

    opaTest("Should select an icon", function (Given, When, Then) {
        // When
        When.onTheOverviewPage.iShouldCopyIcon(0);
    });

    opaTest("Should open side panel", function (Given, When, Then) {
        // When
        When.onTheOverviewPage.iShouldOpenSidePanel();

        // Then
        Then.onTheOverviewPage.iShouldSeeSidePanelOpened();

        // Teardown
        Then.iTeardownMyApp();
    });

    opaTest("Should see icon preview in side panel with all information", function (Given, When, Then) {
        var sIconName = "add";
        // When
         Given.iStartMyApp("./test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons/?icon=" + sIconName);

        // Then
        Then.onTheOverviewPage
            .iShouldSeeIconPreview()
            .and.IShouldSeeIconInformation(sIconName)
            .and.IShouldSeeCopyIconPanel(sIconName);

        // Teardown
        Then.iTeardownMyApp();
    });
});