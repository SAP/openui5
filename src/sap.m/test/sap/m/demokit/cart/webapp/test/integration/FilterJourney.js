/* global QUnit */

sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/test/opaQunit",
	"./pages/Home",
	"./pages/Category"
], function (Configuration, opaTest) {
	"use strict";

	var sDefaultLanguage = Configuration.getLanguage();

	QUnit.module("Filter Journey", {
		before : function () {
			Configuration.setLanguage("en-US");
		},
		after : function () {
			Configuration.setLanguage(sDefaultLanguage);
		}
	});

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

	opaTest("Should filter on both availability and price", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iFilterOnAvailabilityAndPrice();
		//Assertions
		Then.onTheCategory.iShouldOnlySeeOutOfStockAndCheapProductsWithInfoToolbar();
	});

	opaTest("Should change the price filter and then cancel the change", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iCancelAPriceFilterChange();
		//Assertions
		Then.onTheCategory.iShouldOnlySeeOutOfStockAndCheapProductsWithInfoToolbar();
		// Actions
		When.onTheCategory.iPressTheFilterButton();
		When.onTheCategory.iPressTheBackButtonInDialog();
		//Assertions
		Then.onTheCategory.iShouldTestTheFilterCount(1);
	});

	opaTest("Should change the price filter values to the default ones", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iChangeToTheDefaultFilterPriceValues();
		//Assertions
		Then.onTheCategory.iShouldOnlySeeOutOfStockProductsAndAnInfoToolbar();
		//Actions
		When.onTheCategory.iPressTheFilterButton();
		When.onTheCategory.iPressTheBackButtonInDialog();
		Then.onTheCategory.iShouldTestTheFilterCount(0);
	});

	opaTest("Should reset price custom filter", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressResetButton();
		//Assertions
		Then.onTheCategory.iShouldTestTheFilterCount(0);
		When.onTheCategory.iPressOkButton();
		//Assertions
		Then.onTheCategory.iShouldSeeAllProductsAndNoInfoToolbar();
	});

	opaTest("Should filter the products on supplier", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iFilterOnSupplier();
		//Assertions
		Then.onTheCategory.iShouldOnlySeeTechnoComProductsAndAnInfoToolbar();
	});

	opaTest("Should remove the supplier filter", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iRemoveTheSupplierFilter();
		//Assertions
		Then.onTheCategory.iShouldSeeAllProductsAndNoInfoToolbar();
		// Cleanup
		Then.onTheCategory.iTeardownMyApp();
	});
});