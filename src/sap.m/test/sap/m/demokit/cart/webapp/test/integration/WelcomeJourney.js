/*
 global QUnit
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/test/opaQunit",
	"./pages/Home",
	"./pages/Welcome",
	"./pages/Product",
	"./pages/Category",
	"./pages/Cart"
], (Localization, opaTest) => {
	"use strict";

	const sDefaultLanguage = Localization.getLanguage();

	QUnit.module("Welcome Journey", {
		before() {
			Localization.setLanguage("en-US");
		},
		after() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	opaTest("Should start the app and see the right number of featured products and an avatar button", (Given, When, Then) => {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheRightAmountOfProducts().
			and.iShouldSeeAnAvatarButton();
	});

	opaTest("Should press the product link and navigate to product view", (Given, When, Then) => {
		// Actions
		When.onTheWelcomePage.iPressTheProductLink();
		// Assertions
		Then.onTheProduct.iShouldSeeTheProductPage();
		Then.onTheCategory.iShouldSeeSomeEntriesInTheProductList();
	});

	opaTest("Should press the image and see the LightBox item", (Given, When, Then) => {
		//Actions
		When.onTheProduct.iPressOnTheProductPicture();
		//Assertions
		Then.onTheProduct.iShouldSeeALightBox();
	});

	opaTest("Should press the close button and see the product view", (Given, When, Then) => {
		//Actions
		When.onTheProduct.iPressTheCloseButtonOfTheLightBox();
		//Assertions
		Then.onTheProduct.iShouldSeeTheProductPage();
	});

	opaTest("Should press back button and navigate to welcome view", (Given, When, Then) => {
		// Actions
		When.onTheCategory.iPressTheBackButtonInCategory();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should press cart button and see the product in the cart", (Given, When, Then) => {
		// Actions
		When.onHome.iPressOnTheFlatScreensCategory();
		When.onTheWelcomePage.iPressOnTheCartButton();
		When.onTheWelcomePage.iToggleTheCart();
		// Assertions
		Then.onTheCart.iShouldSeeTheProductInMyCart();
		// Cleanup
		Then.iTeardownMyApp();
	});

});
