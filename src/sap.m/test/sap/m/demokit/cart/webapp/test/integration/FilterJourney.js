/* global QUnit */

sap.ui.define([
	'sap/ui/test/opaQunit'
], function (opaTest) {
	"use strict";

	QUnit.module("Filter Journey");

	opaTest("Should start the app and go to the category view I should see a filter button", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Actions
		When.onHome.iPressOnTheFlatScreensCategory();
		// Assertions
		Then.onTheCategory.iShouldSeeAFilterButton();
	});

	opaTest("Should filter the products on availability", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iFilterOnAvailability();
		//Assertions
		Then.onTheCategory.iShouldOnlySeeAvailableAndDiscontinuedProductsWithInfoToolbar();
	});

	opaTest("Should remove the availability filters", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iRemoveTheAvailabilityFilters();
		//Assertions
		Then.onTheCategory.iShouldSeeAllProductsAndNoInfoToolbar();
	});

	opaTest("Should filter the products on price", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iFilterOnPrice();
		//Assertions
		Then.onTheCategory.iShouldOnlySeeExpensiveProductsAndAnInfoToolbar();
	});
	opaTest("Should remove the price filter", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iRemoveThePriceFilter();
		//Assertions
		Then.onTheCategory.iShouldSeeAllProductsAndNoInfoToolbar();
	});

	opaTest("Should filter on both availability and price", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iFilterOnAvailabilityAndPrice();
		//Assertions
		Then.onTheCategory.iShouldOnlySeeOutOfStockAndCheapProductsWithInfoToolbar();
		Then.onTheCategory.iTeardownMyApp();
	});


});