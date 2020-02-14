/* global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App",
	"./pages/Home",
	"./pages/Settings",
	"./pages/Statistics"
], function (opaTest) {
	"use strict";

	QUnit.module("Desktop navigation");

	opaTest("should press the error button and see a popover message", function (Given, When, Then) {
		//Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheAppPage.iPressTheErrorButton();

		//Assertions
		Then.onTheAppPage.iShouldSeeTheErrorPopover();
	});

	opaTest("should press the notification button and see a popover message", function (Given, When, Then) {

		//Actions
		When.onTheAppPage.iPressTheNotificationButton();

		//Assertions
		Then.onTheAppPage.iShouldSeeTheNotificationPopover();
	});

	opaTest("should press the user button and see a popover message", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iPressTheUserButton();

		//Assertions
		Then.onTheAppPage.iShouldSeeTheUserPopover();
	});

	opaTest("should press the settings button and navigate to settings view", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iPressTheSettingsButton();

		//Assertions
		Then.onTheSettingsPage.iShouldSeeMasterSettingsView().and.iShouldSeeDetailSettingsView();
	});

	opaTest("should press the order settings item and see a toast message", function (Given, When, Then) {
		//Actions
		When.onTheSettingsPage.iPressTheOrderSettingsItem();

		//Assertions
		Then.onTheSettingsPage.iShouldSeeMessageToast();
	});

	opaTest("should press the save button  and see a toast message", function (Given, When, Then) {
		//Actions
		When.onTheSettingsPage.iPressTheSaveButton();

		//Assertions
		Then.onTheSettingsPage.iShouldSeeMessageToast();
	});

	opaTest("should press the cancel button and see a toast message", function (Given, When, Then) {
		//Actions
		When.onTheSettingsPage.iPressTheCancelButton();

		//Assertions
		Then.onTheSettingsPage.iShouldSeeMessageToast();
	});

	opaTest("should press the statistics button and navigate to statistics view", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iPressTheStatisticsButton();

		//Assertions
		Then.onTheStatisticsPage.iShouldSeeTheStatisticsView().
			and.iShouldSeeTheCharts();
	});

	opaTest("should press the refresh button", function (Given, When, Then) {
		//Actions
		When.onTheStatisticsPage.iPressTheRefreshButton();

		//Assertions
		Then.onTheStatisticsPage.iShouldSeeTheBusyIndicator();
	});

	opaTest("should press the usage statistics button and see a toast message", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iPressTheUsageStatisticsButton();

		//Assertions
		Then.onTheAppPage.iShouldSeeMessageToast();
	});

	opaTest("should press the order statistics button and see a toast message", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iPressTheOrderStatisticsButton();

		//Assertions
		Then.onTheAppPage.iShouldSeeMessageToast();
	});

	opaTest("should press the home button and navigate to home view", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iPressTheHomeButton();

		//Assertions
		Then.onTheHomePage.iShouldSeeTheHomeView();

		// Cleanup
		Then.iTeardownMyApp();
	});
});