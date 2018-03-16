/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/opaQunit'
], function (opaTest) {
	"use strict";

	QUnit.module("Welcome Journey");

	opaTest("Should start the app and see the right number of featured products and an avatar button", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheRightAmountOfProducts().
			and.iShouldSeeAnAvatarButton();
	});

	opaTest("Should press the product link and navigate to product view", function (Given, When, Then) {
		// Actions
		When.onTheWelcomePage.iPressTheProductLink();
		// Assertions
		Then.onTheProduct.iShouldSeeTheProductPage();
		Then.onTheCategory.iShouldSeeSomeEntriesInTheProductList();
	});

	opaTest("Should press back button and navigate to welcome view", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressTheBackButtonInProduct();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should press cart button and see the product in the cart", function (Given, When, Then) {
		// Actions
		When.onHome.iPressOnTheFlatScreensCategory();
		When.onTheWelcomePage.iPressOnTheCartButton();
		When.onTheCategory.iGoToTheCartPage();
		// Assertions
		Then.onTheCart.iShouldSeeTheProductInMyCart();
	});

	opaTest("Should press the first product in viewed items and see it in light box ", function (Given, When, Then) {
		// Actions
		When.onTheWelcomePage.iPressTheProductImage();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheProductInLightBox();
		When.onTheWelcomePage.iPressTheCloseButtonOfTheLightBox().and.iTeardownMyApp();
	});

});
