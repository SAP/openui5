/* global QUnit */

sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/test/opaQunit",
	"./pages/Home",
	"./pages/Category",
	"./pages/Product",
	"./pages/Comparison",
	"./pages/Cart",
	"./pages/Welcome"
], function (Configuration, opaTest) {
	"use strict";

	var sDefaultLanguage = Configuration.getLanguage(),
		//List of product ids used
		productOne = "HT-1254",
		productTwo = "HT-1255",
		productThree = "HT-1137";

	QUnit.module("Comparison Journey", {
		before : function () {
			Configuration.setLanguage("en-US");
		},
		after : function () {
			Configuration.setLanguage(sDefaultLanguage);
		}
	});

	//We are still on the second category
	opaTest("Should see the product list with Compare link", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Actions
		When.onHome.iPressOnTheFlatScreensCategory();

		// Assertions
		Then.onTheCategory.iShouldSeeCompareLinkOnListEntry();
	});

	opaTest("Should see comparison view with one product", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressOnCompareLink(productOne);

		// Assertions
		Then.onTheComparison.iShouldSeeAProductAndAPlaceholder(productOne);
	});

	opaTest("Should add a product to the cart", function (Given, When, Then) {
		// Actions

		When.onTheComparison.iAddTheDisplayedProductToTheCart();

		When.onTheComparison.iToggleTheCart();

		// Assertions
		Then.onTheCart.iShouldSeeTheProductInMyCart()
			.and.iShouldSeeTheTotalPriceUpdated();
	});

		opaTest("Should see comparison view with two products", function (Given, When, Then) {
		// Actions
		When.onTheComparison.iToggleTheCart();
		When.onTheCategory.iPressOnCompareLink(productTwo);

		// Assertions
		Then.onTheComparison.iShouldSeeTwoProducts(productOne, productTwo);
	});

	opaTest("Should see comparison view with a different second product", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressOnCompareLink(productThree);

		// Assertions
		Then.onTheComparison.iShouldSeeTwoProducts(productOne, productThree);
	});

	opaTest("Should see comparison view with one product", function (Given, When, Then) {
		// Actions
		When.onTheComparison.iDeleteAProduct(productOne);

		// Assertions
		Then.onTheComparison.iShouldSeeAProductAndAPlaceholder(productThree);

		// Cleanup
		Then.iTeardownMyApp();
	});
});
